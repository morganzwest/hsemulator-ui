import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const supabase = createSupabaseBrowserClient()

export function useExecutionDetails(executionId) {
  const [execution, setExecution] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!executionId) return

    let mounted = true
    setLoading(true)
    setError(null)

    async function load() {
      try {
        /* ---------------------------------
           1. Load execution + action + owner
        --------------------------------- */

        const { data, error: execError } =
          await supabase
            .from('action_executions')
            .select(`
              id,
              execution_id,
              action_id,
              status,
              ok,
              started_at,
              finished_at,
              duration_ms,
              max_duration_ms,
              max_memory_kb,
              runs,
              failures_count,
              error_message,
              snapshots_ok,
              created_at,
              updated_at,
              owner:profiles (
                full_name,
                avatar_url
              ),
              action:actions (
                name,
                description,
                language,
                filepath
              )
            `)
            .eq('id', executionId)
            .single()

        if (execError) throw execError
        if (!data) throw new Error('Execution not found')

        /* ---------------------------------
           2. Load execution events (logs)
        --------------------------------- */

        const {
          data: eventRows,
          error: eventsError,
        } = await supabase
          .from('action_execution_events')
          .select(`
            id,
            kind,
            message,
            event_time
          `)
          .eq('execution_fk', executionId)
          .order('event_time', { ascending: true })

        if (eventsError) throw eventsError

        if (!mounted) return

        setExecution({
          id: data.id,
          execution_id: data.execution_id,
          status: data.status,
          ok: data.ok,
          started_at: data.started_at,
          finished_at: data.finished_at,
          duration_ms: data.duration_ms,
          max_duration_ms: data.max_duration_ms,
          max_memory_kb: data.max_memory_kb,
          runs: data.runs,
          failures_count: data.failures_count,
          error_message: data.error_message,
          snapshots_ok: data.snapshots_ok,
          created_at: data.created_at,
          updated_at: data.updated_at,

          owner_name:
            data.owner?.full_name ?? 'User',
          owner_avatar:
            data.owner?.avatar_url ??
            '/avatars/default.jpg',

          action_name:
            data.action?.name ?? 'Unnamed action',
          action_description:
            data.action?.description ?? null,
          action_language: data.action?.language,
          action_filepath: data.action?.filepath,
        })

        setEvents(eventRows ?? [])
        setLoading(false)
      } catch (err) {
        if (!mounted) return

        console.error(
          '[useExecutionDetails] load failed',
          err
        )

        setError(err)
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [executionId])

  return {
    execution,
    events,
    loading,
    error,
  }
}
