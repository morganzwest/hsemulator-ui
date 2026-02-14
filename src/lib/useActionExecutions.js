'use client'

import { useEffect, useRef, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'

const supabase = createSupabaseBrowserClient()

export function useActionExecutions({
  limit = 10,
  actionId = null,
  portalId = null,
}) {
  const [executions, setExecutions] = useState([])
  const seenIdsRef = useRef(new Set())
  const lastErrorRef = useRef(null)

  useEffect(() => {
    let mounted = true
    let intervalId = null

    seenIdsRef.current.clear()

    async function load(reason = 'poll') {
      let query = supabase
        .from('action_executions')
        .select(`
          id,
          action_id,
          status,
          ok,
          max_duration_ms,
          created_at,

          action:actions!inner (
            portal_id
          ),
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

      if (portalId) {
        query = query.eq('action.portal_id', portalId)
      }

      const { data, error } = await query

      if (!mounted) return

      if (error) {
        const message = error.message || 'Failed to load action executions'

        if (lastErrorRef.current !== message) {
          toast.error(message)
          lastErrorRef.current = message
        }

        console.error('[useActionExecutions]', error)
        return
      }

      lastErrorRef.current = null

      setExecutions(() => {
        const next = (data ?? []).map(row => {
          const isNew = !seenIdsRef.current.has(row.id)

          return {
            id: row.id,
            action_id: row.action_id,

            portal_id: row.action?.portal_id ?? null,

            status: row.status,
            ok: row.ok,
            max_duration_ms: row.max_duration_ms,
            created_at: row.created_at,

            owner_name: row.owner?.full_name ?? 'User',
            owner_avatar:
              row.owner?.avatar_url ?? '/avatars/default.jpg',

            __isNew: isNew,
          }
        })

        next.forEach(e => seenIdsRef.current.add(e.id))
        return next
      })
    }

    function startPolling() {
      if (intervalId) return
      load('initial')
      intervalId = setInterval(() => load('interval'), 3000)
    }

    function stopPolling() {
      if (!intervalId) return
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

    if (document.visibilityState === 'visible') {
      startPolling()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mounted = false
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [limit, actionId, portalId])

  return executions
}
