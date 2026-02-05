/**
 * Realtime subscriptions for action executions and logs (Supabase Realtime v2).
 *
 * - Subscribes to:
 *   - public.action_execution_events (ALL events)
 *   - public.action_executions (UPDATE)
 *
 * - Ensures Realtime is authenticated (setAuth) before subscribing
 * - Re-applies auth on token refresh / sign-in
 * - Auto-reconnects on CLOSED / CHANNEL_ERROR / TIMED_OUT with exponential backoff
 * - Safe cleanup and idempotent teardown
 *
 * Notes:
 * - RLS must be written to support Realtime: use TO public with auth.uid()-based ownership checks.
 * - Client-side filtering is not a security boundary.
 *
 * Usage:
 *   const stop = subscribeExecutionRealtime(supabase, {
 *     channelName: `execution:${portalId}`,
 *     onLog: payload => console.log('LOG', payload),
 *     onExecutionUpdate: payload => console.log('EXEC', payload),
 *   })
 *
 *   // cleanup
 *   stop()
 */

export function subscribeExecutionRealtime(
    supabase,
    {
        schema = 'public',
        logsTable = 'action_execution_events',
        executionsTable = 'action_executions',
        channelName = 'execution:realtime',
        onLog,
        onExecutionUpdate,

        // reconnect tuning
        maxRetries = 8,
        baseRetryDelayMs = 500,
        maxRetryDelayMs = 10_000,

        // auth tuning
        waitForAuthMs = 3_000, // if no session yet, retry within this window
    } = {}
) {
    if (!supabase) {
        throw new Error('subscribeExecutionRealtime requires a Supabase client')
    }

    let channel = null
    let retries = 0
    let closedByUser = false
    let reconnectTimer = null
    let authRetryTimer = null

    // keep the latest token we applied to realtime, avoid redundant setAuth calls
    let lastAppliedAccessToken = null

    // keep a subscription to auth state changes so we can update realtime auth
    let authUnsub = null

    function clearTimer(ref) {
        if (ref) clearTimeout(ref)
        return null
    }

    function clearAllTimers() {
        reconnectTimer = clearTimer(reconnectTimer)
        authRetryTimer = clearTimer(authRetryTimer)
    }

    function backoffDelay(attempt) {
        const delay = baseRetryDelayMs * Math.pow(2, attempt)
        // jitter helps avoid thundering herd on reconnect
        const jitter = Math.floor(Math.random() * Math.min(250, delay * 0.2))
        return Math.min(delay + jitter, maxRetryDelayMs)
    }

    function teardownChannel() {
        if (channel) {
            try {
                supabase.removeChannel(channel)
            } catch (_) {
                // noop
            }
            channel = null
        }
    }

    function teardownAll() {
        clearAllTimers()
        teardownChannel()

        if (typeof authUnsub === 'function') {
            try {
                authUnsub()
            } catch (_) {
                // noop
            }
        }
        authUnsub = null
    }

    function scheduleReconnect(reason) {
        if (closedByUser) return

        if (retries >= maxRetries) {
            console.error('[Realtime] Max retries reached — giving up', {
                channelName,
                reason,
            })
            return
        }

        const delay = backoffDelay(retries)
        retries += 1

        console.warn(
            `[Realtime] Reconnecting in ${delay}ms (attempt ${retries}/${maxRetries})`,
            { channelName, reason }
        )

        reconnectTimer = clearTimer(reconnectTimer)
        reconnectTimer = setTimeout(() => {
            if (closedByUser) return
            teardownChannel()
            void createAndSubscribe({ reason: `reconnect:${reason}` })
        }, delay)
    }

    async function applyRealtimeAuthFromSession(session) {
        const token = session?.access_token || null

        if (!token) {
            console.warn('[Realtime][AUTH] No session / no access token')
            return false
        }

        if (token === lastAppliedAccessToken) {
            console.debug('[Realtime][AUTH] Token already applied')
            return true
        }

        try {
            supabase.realtime.setAuth(token)
            lastAppliedAccessToken = token

            console.info('[Realtime][AUTH] Access token applied', {
                userId: session.user.id,
                role: session.user.role ?? 'authenticated',
            })

            return true
        } catch (err) {
            console.error('[Realtime][AUTH] Failed to set auth', err)
            return false
        }
    }


    async function ensureAuthOrRetry({ reason }) {
        const startedAt = Date.now()

        async function attempt() {
            if (closedByUser) return false

            let session = null
            try {
                const res = await supabase.auth.getSession()
                session = res?.data?.session ?? null
            } catch (err) {
                console.warn('[Realtime] getSession failed', { reason, err })
            }

            const ok = await applyRealtimeAuthFromSession(session)
            if (ok) return true

            // No session yet (common during client hydration) → retry briefly
            const elapsed = Date.now() - startedAt
            if (elapsed >= waitForAuthMs) {
                console.warn('[Realtime] No session available — subscribing may be anon', {
                    channelName,
                    reason,
                })
                return false
            }

            authRetryTimer = clearTimer(authRetryTimer)
            authRetryTimer = setTimeout(() => {
                void attempt()
            }, 200)

            return false
        }

        return attempt()
    }

    function attachAuthListenerOnce() {
        if (authUnsub) return

        // Ensure realtime auth stays updated across refreshes / sign-in / sign-out
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            if (closedByUser) return

            void applyRealtimeAuthFromSession(session).then(ok => {
                if (!ok) {
                    // If user signed out, we should reconnect to avoid stale auth.
                    lastAppliedAccessToken = null
                    scheduleReconnect('auth_change_no_session')
                }
            })
        })

        authUnsub = () => data?.subscription?.unsubscribe?.()
    }

    async function createAndSubscribe({ reason = 'initial' } = {}) {
        if (closedByUser) return

        attachAuthListenerOnce()
        reconnectTimer = clearTimer(reconnectTimer)
        authRetryTimer = clearTimer(authRetryTimer)

        // Always attempt to ensure realtime has the current token BEFORE creating channel
        await ensureAuthOrRetry({ reason })

        channel = supabase.channel(channelName)

        /* -----------------------------------------
           ACTION EXECUTION EVENTS (LOG STREAM)
        ------------------------------------------ */

        channel.on(
            'postgres_changes',
            {
                event: '*',
                schema,
                table: logsTable,
            },
            payload => {
                // v2 payload shape:
                // {
                //   eventType: 'INSERT' | 'UPDATE' | 'DELETE',
                //   schema,
                //   table,
                //   commit_timestamp,
                //   new,
                //   old
                // }
                if (typeof onLog === 'function') onLog(payload)
            }
        )

        /* -----------------------------------------
           ACTION EXECUTIONS (STATUS UPDATES)
        ------------------------------------------ */

        channel.on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema,
                table: executionsTable,
            },
            payload => {
                if (typeof onExecutionUpdate === 'function') onExecutionUpdate(payload)
            }
        )

        /* -----------------------------------------
           SUBSCRIBE + STATUS HANDLING
        ------------------------------------------ */

        channel.subscribe(status => {
            console.log('[Realtime][STATUS]', status, { channelName, reason })

            if (status === 'SUBSCRIBED') {
                retries = 0
                reconnectTimer = clearTimer(reconnectTimer)
                authRetryTimer = clearTimer(authRetryTimer)
                return
            }

            if (status === 'CHANNEL_ERROR') {
                console.warning('[Realtime] CHANNEL_ERROR — scheduling reconnect', {
                    channelName,
                })
                scheduleReconnect('CHANNEL_ERROR')
                return
            }

            if (status === 'CLOSED') {
                console.warn('[Realtime] CLOSED — scheduling reconnect', { channelName })
                scheduleReconnect('CLOSED')
                return
            }

            if (status === 'TIMED_OUT') {
                console.warn('[Realtime] TIMED_OUT — scheduling reconnect', {
                    channelName,
                })
                scheduleReconnect('TIMED_OUT')
                return
            }
        })
    }

    // initial connect
    void createAndSubscribe({ reason: 'initial' })

    /* -----------------------------------------
       RETURN CLEANUP
    ------------------------------------------ */

    return function unsubscribe() {
        closedByUser = true
        teardownAll()
        console.log('[Realtime] Unsubscribed from execution realtime', {
            channelName,
        })
    }
}
