import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { inferLanguage } from '@/lib/editor/infer-language'
import { toast } from 'sonner'
import { getActivePortalId } from '../portal-state'
import { useEffect, useRef } from 'react'
import { subscribeExecutionRealtime } from './realtime-logs'

/* -----------------------------
   Helpers
----------------------------- */

function formatOutputFields(outputFields) {
  if (!outputFields || Object.keys(outputFields).length === 0) return []
  return ['', '--- Output Fields ---', JSON.stringify(outputFields, null, 2)]
}

function formatExecutionIdLine(executionId) {
  const time = formatTimestamp(new Date().toISOString())
  return `${time} [EVENT] Execution ID — ${executionId}`
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
    throw new Error('Invalid action: missing id or portal_id')
  }
  return `${action.portal_id}/${action.id}`
}

async function loadDefaultFixture({ supabase, basePath }) {
  const { data } = await supabase.storage
    .from('actions')
    .download(`${basePath}/event.json`)
  if (!data) return []
  return [{ name: 'event.json', source: await data.text() }]
}

function compileInlineConfig({ files, fixtures }) {
  const entry =
    Object.keys(files).find(f => f.endsWith('.py')) ||
    Object.keys(files).find(f => f.endsWith('.js'))

  if (!entry) throw new Error('No entry file found')

  return {
    action: {
      language: entry.endsWith('.py') ? 'python' : 'javascript',
      entry,
      source: files[entry].value,
    },
    fixtures,
    env: {
      API_KEY: {
        secret_id: '9adcc3cb-469c-4927-9a46-9045d46c031f',
        type: 'secret',
      },
      MODE: 'test',
    },
    repeat: 1,
  }
}

/* -----------------------------
   Canonical log formatter
----------------------------- */

function formatTimestamp(ts) {
  if (!ts) return '--:--:--.000'
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )}.${ms}`
}

function resolveLevel(kind) {
  switch (kind) {
    case 'Stdout':
      return 'INFO '
    case 'Stderr':
    case 'ExecutionFailed':
    case 'ExecutionTimedOut':
      return 'ERROR'
    default:
      return 'EVENT'
  }
}

function defaultMessage(kind) {
  switch (kind) {
    case 'ExecutionCreated':
      return 'Execution Queued'
    case 'ValidationStarted':
      return 'Validating Action Configuration'
    case 'ExecutionStarted':
      return 'Runtime Execution Started'
    case 'ExecutionFinished':
      return 'Runtime Finished Processing'
    case 'ExecutionCompleted':
      return 'Execution Completed Successfully'
    case 'ExecutionFailed':
      return 'Execution Failed'
    case 'ExecutionTimedOut':
      return 'Execution Exceeded Time Limit'
    default:
      return null
  }
}

function formatLogRow(row) {
  const time = formatTimestamp(row.event_time ?? row.created_at)
  const level = resolveLevel(row.kind)
  const prefix = `${time} [${level}] ${row.kind}`

  // No message → synthetic/default event
  if (!row.message) {
    const msg = defaultMessage(row.kind)
    return msg ? [`${prefix} — ${msg}`] : [prefix]
  }

  // Stdout / Stderr / returns (multiline-safe)
  return row.message
    .split('\n')
    .filter(Boolean)
    .map(line => `${prefix} — ${line}`)
}


/* -----------------------------
   Hook
----------------------------- */

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

  const activeExecutionIdRef = useRef(null)
  const resolveExecutionRef = useRef(null)
  const subscribedRef = useRef(false)

  /* -----------------------------
     Realtime subscription
  ----------------------------- */

  useEffect(() => {
    if (subscribedRef.current) return
    subscribedRef.current = true

    const stop = subscribeExecutionRealtime(supabase, {
      onLog: payload => {
        const row = payload.new ?? payload.old
        if (!row) return

        if (
          activeExecutionIdRef.current &&
          row.execution_fk !== activeExecutionIdRef.current
        ) {
          return
        }

        const lines = formatLogRow(row)
        setLogs(prev => [...prev, ...lines])

        if (
          row.kind === 'ExecutionCompleted' ||
          row.kind === 'ExecutionFailed' ||
          row.kind === 'ExecutionTimedOut'
        ) {
          resolveExecutionRef.current?.()
          resolveExecutionRef.current = null
        }
      },
    })

    return stop
  }, [])

  /* -----------------------------
     Load files
  ----------------------------- */

  async function loadFiles() {
    if (!activeAction) return
    getActivePortalId()

    const basePath = resolveActionBasePath(activeAction)
    setLoadingFiles(true)
    setLogs([])

    const { data } = await supabase.storage.from('actions').list(basePath)

    const entries = await Promise.all(
      (data ?? []).map(async obj => {
        const { data } = await supabase.storage
          .from('actions')
          .download(`${basePath}/${obj.name}`)
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

    const loaded = Object.fromEntries(entries)
    setFiles(loaded)
    setActiveFile(Object.keys(loaded)[0] ?? null)
    setLoadingFiles(false)
  }

  /* -----------------------------
     Save files
  ----------------------------- */

  async function saveAllFiles(editorRef) {
    if (!activeAction) return
    const basePath = resolveActionBasePath(activeAction)

    await editorRef?.current
      ?.getAction('editor.action.formatDocument')
      ?.run()

    await new Promise(r => setTimeout(r, 0))

    for (const [name, file] of Object.entries(files)) {
      if (!file.dirty) continue
      await supabase.storage
        .from('actions')
        .upload(`${basePath}/${name}`, new Blob([file.value]), {
          upsert: true,
        })
    }

    await supabase
      .from('actions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeAction.id)

    setFiles(prev =>
      Object.fromEntries(
        Object.entries(prev).map(([k, v]) => [k, { ...v, dirty: false }])
      )
    )

    setLogs(l => [...l, '✔ Files saved'])
  }

  /* -----------------------------
     Run action
  ----------------------------- */

  async function runFile() {
    if (!activeAction) return
    setLogs(l => [...l, '---------------------'])
    const entryFile = resolveEntryFile(files)
    if (!entryFile) {
      setLogs(l => [...l, '✖ No runnable file'])
      return
    }

    setRunning(true)
    setLogs(l => [...l, '', `▶ Action added to queue (${entryFile})`])

    return toast.promise(
      (async () => {
        const donePromise = new Promise(resolve => {
          resolveExecutionRef.current = resolve
        })

        const timeout = setTimeout(
          () => resolveExecutionRef.current?.(),
          60_000
        )

        try {
          const { data: exec } = await supabase
            .from('action_executions')
            .insert({
              action_id: activeAction.id,
              owner_id: activeAction.owner_id,
              status: 'queued',
              started_at: new Date().toISOString(),
            })
            .select()
            .single()

          activeExecutionIdRef.current = exec.id

          setLogs(prev => [...prev, formatExecutionIdLine(exec.id)])

          const fixtures = await loadDefaultFixture({
            supabase,
            basePath: resolveActionBasePath(activeAction),
          })

          await fetch(`${process.env.NEXT_PUBLIC_RUNTIME_URL}/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer dev_secret_key',
            },
            body: JSON.stringify({
              mode: 'execute',
              execution_id: exec.id,
              config: compileInlineConfig({ files, fixtures }),
            }),
          })

          await donePromise
        } finally {
          clearTimeout(timeout)
          activeExecutionIdRef.current = null
          resolveExecutionRef.current = null
          setRunning(false)
        }
      })(),
      {
        loading: 'Running action…',
        success: 'Execution complete',
        error: 'Execution failed',
      }
    )
  }

  return { loadFiles, saveAllFiles, runFile }
}
