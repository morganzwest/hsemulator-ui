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

    async function load() {
      let query = supabase
        .from('action_executions')
        .select(`
          id,
          execution_id,
          action_id,
          status,
          ok,
          max_duration_ms,
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
      if (!mounted || error || !data) return

      setExecutions(
        data.map(row => ({
          id: row.id,
          execution_id: row.execution_id,
          action_id: row.action_id,
          status: row.status,
          ok: row.ok,
          max_duration_ms: row.max_duration_ms,
          owner_name: row.owner?.full_name ?? 'User',
          owner_avatar:
            row.owner?.avatar_url ?? '/avatars/default.jpg',
        }))
      )
    }

    load()

    const channel = supabase
      .channel(
        actionId
          ? `action-executions-${actionId}`
          : 'action-executions-all'
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'action_executions',
          ...(actionId
            ? { filter: `action_id=eq.${actionId}` }
            : {}),
        },
        payload => {
          setExecutions(prev => {
            const existing = prev.filter(
              e => e.id !== payload.new.id
            )

            return [
              {
                id: payload.new.id,
                execution_id: payload.new.execution_id,
                action_id: payload.new.action_id,
                status: payload.new.status,
                ok: payload.new.ok,
                max_duration_ms:
                  payload.new.max_duration_ms,
                owner_name:
                  prev.find(e => e.id === payload.new.id)
                    ?.owner_name ?? 'User',
                owner_avatar:
                  prev.find(e => e.id === payload.new.id)
                    ?.owner_avatar ??
                  '/avatars/default.jpg',
              },
              ...existing,
            ].slice(0, limit)
          })
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [limit, actionId])

  return executions
}
