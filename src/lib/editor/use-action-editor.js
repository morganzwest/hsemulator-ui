import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { inferLanguage } from '@/lib/editor/infer-language'
import YAML from 'yaml'

/* -----------------------------
   Helpers
----------------------------- */

function formatOutputFields(outputFields) {
  if (!outputFields || Object.keys(outputFields).length === 0) return []

  return [
    '',
    '--- Output Fields ---',
    JSON.stringify(outputFields, null, 2),
  ]
}


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

  function resolveLevel(event) {
    switch (event.kind) {
      case 'Stderr':
        return 'ERROR' // for now; later you can split info/error
      case 'ExecutionCreated':
      case 'ValidationStarted':
      case 'ExecutionStarted':
      case 'ExecutionFinished':
        return 'EVENT'
      default:
        return 'INFO'
    }
  }

  function formatTime(ts) {
    if (!ts) return '--:--:--'
    const ms =
      ts.secs_since_epoch * 1000 +
      Math.floor((ts.nanos_since_epoch || 0) / 1e6)

    const d = new Date(ms)
    return d.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function formatEventLine(event) {
    const time = formatTime(event.timestamp)
    const level = resolveLevel(event).padEnd(5, ' ') // fixed width
    const prefix = `${time} [${level}]`

    if (event.message) {
      return `${prefix} ${event.message}`
    }

    return `${prefix} ${event.kind}`
  }

  function formatEvents(events) {
    const lines = []

    let bufferingErrorBlock = false

    for (const e of events) {
      if (e.kind === 'Stderr') {
        if (!bufferingErrorBlock) {
          bufferingErrorBlock = true
        }
        lines.push(formatEventLine(e))
        continue
      }

      bufferingErrorBlock = false
      lines.push(formatEventLine(e))
    }

    return lines
  }

  function eventTimestampToISO(ts) {
  if (!ts) return null
  const ms =
    ts.secs_since_epoch * 1000 +
    Math.floor((ts.nanos_since_epoch || 0) / 1e6)
  return new Date(ms).toISOString()
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

  let executionRow = null
  let executionId = null

  try {
    const { owner_id, id: action_id } = activeAction
    const basePath = `${owner_id}/${action_id}`

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
       Resolve fixtures
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
       Create execution row (START)
    ----------------------------- */

    const { data: execInsert, error: execErr } = await supabase
      .from('action_executions')
      .insert({
        action_id,
        owner_id,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (execErr) throw execErr

    executionRow = execInsert

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

    executionId = payload?.summary?.execution_id

    /* -----------------------------
       Persist events (append-only)
    ----------------------------- */

    if (Array.isArray(payload?.events)) {
      const rows = payload.events.map(e => ({
        execution_fk: executionRow.id,
        execution_id: executionId,
        kind: e.kind,
        event_time: eventTimestampToISO(e.timestamp),
        message: e.message ?? null,
      }))

      const { error } = await supabase
        .from('action_execution_events')
        .insert(rows)

      if (error) console.error('Event insert failed', error)
    }

    /* -----------------------------
       Update execution (SUCCESS)
    ----------------------------- */

    if (payload?.summary?.result) {
      const r = payload.summary.result

      await supabase
        .from('action_executions')
        .update({
          execution_id: executionId,
          status: r.ok ? 'executed' : 'failed',
          finished_at: new Date().toISOString(),
          duration_ms: r.max_duration_ms,
          max_duration_ms: r.max_duration_ms,
          max_memory_kb: r.max_memory_kb,
          runs: r.runs,
          failures_count: r.failures?.length ?? 0,
          ok: r.ok,
          snapshots_ok: r.snapshots_ok,
          result: payload.summary,
        })
        .eq('id', executionRow.id)
    }

    /* -----------------------------
       Render output (unchanged)
    ----------------------------- */

    const lines = []

    if (payload?.summary?.result) {
      const r = payload.summary.result

      lines.push('✔ Execution completed')
      lines.push(`Result: ${r.ok ? 'OK' : 'FAILED'}`)
      lines.push(`Runs: ${r.runs}`)
      lines.push(`Duration: ${r.max_duration_ms} ms`)
      lines.push(`Snapshots: ${r.snapshots_ok ? 'OK' : 'FAILED'}`)

      if (r.outputFields) {
        lines.push(...formatOutputFields(r.outputFields))
      }
    }


    if (Array.isArray(payload?.events)) {
      lines.push('')
      lines.push('--- Events ---')
      lines.push(...formatEvents(payload.events))
    }

    setLogs(l => [...l, ...lines])
  } catch (err) {
    /* -----------------------------
       Update execution (FAILURE)
    ----------------------------- */

    if (executionRow) {
      await supabase
        .from('action_executions')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          ok: false,
          error_message: err.message,
        })
        .eq('id', executionRow.id)
    }

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
