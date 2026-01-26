import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { inferLanguage } from '@/lib/editor/infer-language'
import YAML from 'yaml'
import { toast } from 'sonner'
import { getActivePortalId } from '../portal-state'

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

function resolveActionBasePath(action) {
  if (!action?.id || !action?.portal_id) {
    console.error('[ActionEditor] Invalid action for base path', action)
    throw new Error('Invalid action: missing id or portal_id')
  }

  const path = `${action.portal_id}/${action.id}`
  console.debug('[ActionEditor] Using storage path:', path)
  return path
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

    // NOTE: still validating active portal, but path comes from action
    try {
      getActivePortalId()
    } catch {
      toast.error('No active workspace selected')
      throw new Error('Missing active portal')
    }

    const basePath = resolveActionBasePath(activeAction)

    console.debug('[ActionEditor] loadFiles → list', basePath)

    setLoadingFiles(true)
    setLogs([])

    const { data, error } = await supabase
      .storage
      .from('actions')
      .list(basePath)

    if (error) {
      console.error('[ActionEditor] list failed', error)
      setLogs([`✖ Failed to load files: ${error.message}`])
      setLoadingFiles(false)
      return
    }

    const entries = await Promise.all(
      (data ?? [])
        .filter(o => o.name && !o.name.endsWith('/'))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(async obj => {
          const filePath = `${basePath}/${obj.name}`
          console.debug('[ActionEditor] download', filePath)

          const { data, error } = await supabase
            .storage
            .from('actions')
            .download(filePath)

          if (error) {
            console.error('[ActionEditor] download failed', filePath, error)
            return null
          }

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

  const basePath = resolveActionBasePath(activeAction)
  console.debug('[ActionEditor] saveAllFiles → basePath', basePath)

  // 1) Run formatter and allow Monaco to flush model updates
  try {
    await editorRef?.current
      ?.getAction('editor.action.formatDocument')
      ?.run()
  } catch (e) {
    console.warn('[ActionEditor] formatDocument failed (continuing)', e)
  }

  // Let Monaco propagate the formatted text into state
  await new Promise(r => setTimeout(r, 0))

  // 2) Decide what to save (authoritative)
  // Prefer saving all files if any are dirty to avoid missing changes
  const entries = Object.entries(files)
  const dirtyEntries = entries.filter(([, f]) => f.dirty)

  if (!dirtyEntries.length) {
    console.debug('[ActionEditor] No dirty files detected; skipping save')
    return
  }

  // 3) Upload sequentially with verification logging
  const saved = new Set()

  try {
    for (const [name, file] of dirtyEntries) {
      const filePath = `${basePath}/${name}`

      const contentType =
        file.language === 'json'
          ? 'application/json;charset=utf-8'
          : name.endsWith('.yaml') || name.endsWith('.yml')
            ? 'text/yaml;charset=utf-8'
            : name.endsWith('.js')
              ? 'text/javascript;charset=utf-8'
              : name.endsWith('.py')
                ? 'text/x-python;charset=utf-8'
                : 'text/plain;charset=utf-8'

      const body = new Blob([file.value], { type: contentType })

      console.debug('[ActionEditor] upload →', {
        path: filePath,
        bytes: file.value?.length ?? 0,
        contentType,
      })

      const { error } = await supabase.storage
        .from('actions')
        .upload(filePath, body, { upsert: true })

      if (error) {
        console.error('[ActionEditor] upload failed', filePath, error)
        throw error
      }

      saved.add(name)
    }

    // 4) Touch action updated_at only if uploads succeeded
    await supabase
      .from('actions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeAction.id)

    // 5) Clear dirty only for successfully saved files
    setFiles(prev =>
      Object.fromEntries(
        Object.entries(prev).map(([k, v]) => [
          k,
          saved.has(k) ? { ...v, dirty: false } : v,
        ])
      )
    )

    setLogs(l => [...l, '✔ Files saved'])
    console.debug('[ActionEditor] saveAllFiles completed', {
      saved: Array.from(saved),
    })
  } catch (err) {
    // Do NOT clear dirty flags on failure
    console.error('[ActionEditor] saveAllFiles failed', err)
    setLogs(l => [...l, `✖ Save failed: ${err.message}`])
  }
}


  function resolveLevel(event) {
    switch (event.kind) {
      case 'Stderr':
        return 'ERROR'
      case 'ExecutionCreated':
      case 'ValidationStarted':
      case 'ExecutionStarted':
      case 'ExecutionFinished':
        return 'EVENT'
      default:
        return 'debug'
    }
  }

  function formatTime(ts) {
    if (!ts) return '--:--:--:--'
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
    const level = resolveLevel(event).padEnd(5, ' ')
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
        bufferingErrorBlock = true
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
    const basePath = resolveActionBasePath(activeAction)

    console.debug('[ActionEditor] runFile → basePath', basePath)

    setRunning(true)
    setLogs(l => [...l, '', `▶ Running ${entryFile}`])

    toast.promise(
      async () => {
        let executionRow = null
        let executionId = null

        try {
          const { id: action_id, owner_id } = activeAction

          const { data: configBlob, error: configErr } =
            await supabase.storage
              .from('actions')
              .download(`${basePath}/config.yaml`)

          if (configErr || !configBlob) {
            throw new Error('config.yaml is required')
          }

          const yamlConfig = YAML.parse(await configBlob.text()) ?? {}

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

          const inlineConfig = compileInlineConfig({
            yamlConfig,
            files,
            fixtures: fixtureFiles,
          })

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

          if (Array.isArray(payload?.events)) {
            const rows = payload.events.map(e => ({
              execution_fk: executionRow.id,
              execution_id: executionId,
              kind: e.kind,
              event_time: eventTimestampToISO(e.timestamp),
              message: e.message ?? null,
            }))

            await supabase
              .from('action_execution_events')
              .insert(rows)
          }

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

          return { entryFile }
        } catch (err) {
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
          throw err
        } finally {
          setRunning(false)
        }
      },
      {
        loading: 'Running action…',
        success: 'Execution complete',
        error: 'Execution failed',
      }
    )
  }

  return {
    loadFiles,
    saveAllFiles,
    runFile,
  }
}
