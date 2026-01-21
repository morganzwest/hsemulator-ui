import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const supabase = createSupabaseBrowserClient()

export function useActionExecutions({
  limit = 10,
  actionId = null,
}) {
  const [executions, setExecutions] = useState([])

  useEffect(() => {
    let mounted = true
    let intervalId = null

    async function load(reason = 'poll') {
      console.debug('[useActionExecutions] load', {
        reason,
        actionId,
        limit,
      })

      let query = supabase
        .from('action_executions')
        .select(`
          id,
          execution_id,
          action_id,
          status,
          ok,
          max_duration_ms,
          created_at,
          owner:profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (actionId) {
        query = query.eq('action_id', actionId)
      }

      const { data, error } = await query

      if (!mounted) return

      if (error) {
        console.error('[useActionExecutions] load failed', error)
        return
      }

      setExecutions(
        data.map(row => ({
          id: row.id,
          execution_id: row.execution_id,
          action_id: row.action_id,
          status: row.status,
          ok: row.ok,
          max_duration_ms: row.max_duration_ms,
          created_at: row.created_at,
          owner_name: row.owner?.full_name ?? 'User',
          owner_avatar:
            row.owner?.avatar_url ?? '/avatars/default.jpg',
        }))
      )
    }

    function startPolling() {
      if (intervalId) return

      console.debug('[useActionExecutions] polling started')
      load('initial')

      intervalId = setInterval(() => {
        load('interval')
      }, 3000)
    }

    function stopPolling() {
      if (!intervalId) return

      console.debug('[useActionExecutions] polling stopped')
      clearInterval(intervalId)
      intervalId = null
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        load('tab-visible')
        startPolling()
      } else {
        stopPolling()
      }
    }

    // Initial state
    if (document.visibilityState === 'visible') {
      startPolling()
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )

    return () => {
      mounted = false
      stopPolling()
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )
    }
  }, [limit, actionId])

  return executions
}
