import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { inferLanguage } from '@/lib/editor/infer-language'
import YAML from 'yaml'

/* -----------------------------
   Helpers
----------------------------- */

function formatTimestamp(ts) {
  if (!ts) return ''
  const ms =
    ts.secs_since_epoch * 1000 +
    Math.floor((ts.nanos_since_epoch || 0) / 1e6)
  return new Date(ms).toISOString()
}

function formatEvent(event) {
  const ts = formatTimestamp(event.timestamp)
  return ts ? `[${ts}] ${event.kind}` : event.kind
}

function resolveEntryFile(files) {
  return (
    Object.keys(files).find(f => f.endsWith('.js')) ||
    Object.keys(files).find(f => f.endsWith('.py')) ||
    null
  )
}

/* -----------------------------
   Hook
----------------------------- */

function compileInlineConfig({
  yamlConfig,
  files,
  fixtures,
}) {
  return {
    version: yamlConfig.version,

    action: {
      language:
        yamlConfig.action?.type === 'python' ? 'python' : 'js',
      entry: yamlConfig.action.entry,
      source: files[yamlConfig.action.entry].value,
    },

    fixtures: fixtures.map(f => ({
      name: f.name,
      source: f.source,
    })),

    env: yamlConfig.env ?? {},

    runtime: {
      node: yamlConfig.runtime?.node ?? 'node',
      python: yamlConfig.runtime?.python ?? 'python',
    },

    output: yamlConfig.output,

    snapshots: {
      enabled: yamlConfig.snapshots?.enabled ?? true,
      ignore: yamlConfig.snapshots?.ignore ?? [],
    },

    repeat: yamlConfig.repeat ?? 1,
  }
}


export function useActionEditor({
  activeAction,
  files,
  setFiles,
  setActiveFile,
  setLoadingFiles,
  setLogs,
  setRunning,
}) {
  const supabase = createSupabaseBrowserClient()

  /* -----------------------------
     Load files
  ----------------------------- */

  async function loadFiles() {
    if (!activeAction) return

    const { id, owner_id } = activeAction
    const basePath = `${owner_id}/${id}`

    setLoadingFiles(true)
    setLogs([])

    const { data, error } = await supabase
      .storage
      .from('actions')
      .list(basePath)

    if (error) {
      setLogs([`✖ Failed to load files: ${error.message}`])
      setLoadingFiles(false)
      return
    }

    const entries = await Promise.all(
      (data ?? [])
        .filter(o => o.name && !o.name.endsWith('/'))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(async obj => {
          const { data, error } = await supabase
            .storage
            .from('actions')
            .download(`${basePath}/${obj.name}`)

          if (error) return null

          return [
            obj.name,
            {
              language: inferLanguage(obj.name),
              value: await data.text(),
              dirty: false,
            },
          ]
        })
    )

    const loaded = Object.fromEntries(entries.filter(Boolean))
    const filenames = Object.keys(loaded)

    setFiles(loaded)
    setActiveFile(filenames[0] ?? null)
    setLoadingFiles(false)
  }

  /* -----------------------------
     Save files
  ----------------------------- */

  async function saveAllFiles(editorRef) {
    if (!activeAction) return

    const { id, owner_id } = activeAction
    const basePath = `${owner_id}/${id}`

    await editorRef?.current
      ?.getAction('editor.action.formatDocument')
      ?.run()

    const dirtyFiles = Object.entries(files).filter(
      ([, f]) => f.dirty
    )

    if (!dirtyFiles.length) return

    try {
      await Promise.all(
        dirtyFiles.map(([name, file]) =>
          supabase.storage
            .from('actions')
            .upload(
              `${basePath}/${name}`,
              new Blob([file.value]),
              {
                upsert: true,
                contentType:
                  file.language === 'json'
                    ? 'application/json'
                    : 'text/plain',
              }
            )
        )
      )

      await supabase
        .from('actions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id)

      setFiles(prev =>
        Object.fromEntries(
          Object.entries(prev).map(([k, v]) => [
            k,
            { ...v, dirty: false },
          ])
        )
      )

      setLogs(l => [...l, '✔ Files saved'])
    } catch (err) {
      setLogs(l => [...l, `✖ Save failed: ${err.message}`])
    }
  }

  /* -----------------------------
     Run action (INLINE execution)
  ----------------------------- */
  async function runFile() {
  if (!activeAction) return

  const entryFile = resolveEntryFile(files)
  if (!entryFile) {
    setLogs(l => [...l, '✖ No runnable action file (.js / .py) found'])
    return
  }

  const actionFile = files[entryFile]

  setRunning(true)
  setLogs(l => [...l, '', `▶ Running ${entryFile}`])

  try {
    const { owner_id, id } = activeAction
    const basePath = `${owner_id}/${id}`

    /* -----------------------------
       Load config.yaml
    ----------------------------- */

    const { data: configBlob, error: configErr } =
      await supabase.storage
        .from('actions')
        .download(`${basePath}/config.yaml`)

    if (configErr || !configBlob) {
      throw new Error('config.yaml is required')
    }

    let yamlConfig
    try {
      yamlConfig = YAML.parse(await configBlob.text()) ?? {}
    } catch (e) {
      throw new Error(`Invalid config.yaml: ${e.message}`)
    }

    /* -----------------------------
       Resolve fixtures (INLINE)
    ----------------------------- */

    const fixtureFiles = await Promise.all(
      (yamlConfig.fixtures ?? []).map(async path => {
        const { data, error } = await supabase.storage
          .from('actions')
          .download(`${basePath}/${path}`)

        if (error || !data) {
          throw new Error(`Missing fixture: ${path}`)
        }

        return {
          name: path.startsWith('/') ? path.slice(1) : path,
          source: await data.text(),
        }
      })
    )

    /* -----------------------------
       Compile inline config
    ----------------------------- */

    const inlineConfig = {
      version: yamlConfig.version ?? 1,

      action: {
        language:
          yamlConfig.action?.type === 'python' ||
          entryFile.endsWith('.py')
            ? 'python'
            : 'js',
        entry: yamlConfig.action?.entry ?? entryFile,
        source: actionFile.value,
      },

      fixtures: fixtureFiles,

      env: yamlConfig.env ?? {},

      runtime: {
        node: yamlConfig.runtime?.node ?? 'node',
        python: yamlConfig.runtime?.python ?? 'python',
      },

      output: yamlConfig.output,

      snapshots: {
        enabled: yamlConfig.snapshots?.enabled ?? true,
        ignore: yamlConfig.snapshots?.ignore ?? [],
      },

      repeat: yamlConfig.repeat ?? 1,
    }

    /* -----------------------------
       Execute
    ----------------------------- */

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_RUNTIME_URL}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dev_secret_key',
        },
        body: JSON.stringify({
          mode: 'execute',
          config: inlineConfig,
        }),
      }
    )

    const payload = await res.json()
    if (!res.ok) {
      throw new Error(payload?.error || 'Execution failed')
    }

    /* -----------------------------
       Render output
    ----------------------------- */

    const lines = []

    if (payload?.summary?.result) {
      const r = payload.summary.result
      lines.push('✔ Execution completed')
      lines.push(`Result: ${r.ok ? 'OK' : 'FAILED'}`)
      lines.push(`Runs: ${r.runs}`)
      lines.push(`Duration: ${r.max_duration_ms} ms`)
      lines.push(`Memory: ${(r.max_memory_kb / 1024).toFixed(1)} MB`)
      lines.push(`Snapshots: ${r.snapshots_ok ? 'OK' : 'FAILED'}`)
    }

    if (Array.isArray(payload?.events)) {
      lines.push('')
      lines.push('--- Events ---')
      payload.events.forEach(e => lines.push(formatEvent(e)))
    }

    setLogs(l => [...l, ...lines])
  } catch (err) {
    setLogs(l => [...l, `✖ ${err.message}`])
  } finally {
    setRunning(false)
  }
}



  return {
    loadFiles,
    saveAllFiles,
    runFile,
  }
}
