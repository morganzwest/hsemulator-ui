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
        onConnectionChange, // New callback for connection state changes

        // reconnect tuning
        maxRetries = 8,
        baseRetryDelayMs = 500,
        maxRetryDelayMs = 10_000,

        // auth tuning
        waitForAuthMs = 3_000, // if no session yet, retry within this window

        // connection health tuning
        heartbeatIntervalMs = 30_000, // 30 seconds
        connectionTimeoutMs = 60_000, // 1 minute
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
    let heartbeatTimer = null
    let connectionState = 'disconnected' // 'disconnected', 'connecting', 'connected', 'reconnecting', 'error'
    let lastActivity = Date.now()
    let connectionStartTime = null

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
        heartbeatTimer = clearTimer(heartbeatTimer)
    }

    function backoffDelay(attempt) {
        const delay = baseRetryDelayMs * Math.pow(2, attempt)
        // Improved jitter helps avoid thundering herd on reconnect (25-50% of delay)
        const jitter = Math.floor(Math.random() * Math.min(delay * 0.5, delay * 0.25))
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

    function updateConnectionState(newState, reason = null) {
        const oldState = connectionState

        // Connection state validation matrix
        const validTransitions = {
            'disconnected': ['connecting'],
            'connecting': ['connected', 'error', 'disconnected'],
            'connected': ['error', 'disconnected', 'reconnecting'],
            'reconnecting': ['connected', 'error', 'disconnected'],
            'error': ['connecting', 'disconnected', 'reconnecting']
        }

        if (oldState && validTransitions[oldState] && !validTransitions[oldState].includes(newState)) {
            console.warn('[Realtime][STATE] Invalid state transition detected', {
                oldState,
                newState,
                reason,
                channelName,
                time: new Date().toISOString()
            })
        }

        connectionState = newState

        console.info('[Realtime][STATE]', `${oldState} -> ${newState}`, {
            channelName,
            reason,
            retries,
            time: new Date().toISOString()
        })

        if (typeof onConnectionChange === 'function') {
            onConnectionChange({
                state: newState,
                oldState,
                reason,
                channelName,
                retries,
                timestamp: Date.now()
            })
        }

        // Update activity timestamp on successful connection
        if (newState === 'connected') {
            lastActivity = Date.now()
        }
    }

    function startHeartbeat() {
        // Atomic cleanup - clear existing timer first
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer)
            heartbeatTimer = null
        }

        // Only start if not closed and in connected state
        if (closedByUser || connectionState !== 'connected') {
            return
        }

        heartbeatTimer = setInterval(() => {
            if (closedByUser || connectionState !== 'connected') {
                // Clear timer if state changed during interval
                if (heartbeatTimer) {
                    clearInterval(heartbeatTimer)
                    heartbeatTimer = null
                }
                return
            }

            const now = Date.now()
            const timeSinceActivity = now - lastActivity

            // If no activity for longer than timeout, consider connection stale
            if (timeSinceActivity > connectionTimeoutMs) {
                console.warn('[Realtime][HEARTBEAT] Connection appears stale', {
                    channelName,
                    timeSinceActivity,
                    lastActivity: new Date(lastActivity).toISOString()
                })
                updateConnectionState('error', 'stale_connection')
                scheduleReconnect('stale_connection')
                return
            }

            // Send a ping through the channel to verify it's still responsive
            if (channel && channel.state === 'joined') {
                try {
                    // Use a built-in method to check connection health
                    channel.send({
                        type: 'heartbeat',
                        timestamp: now
                    })
                } catch (err) {
                    console.warn('[Realtime][HEARTBEAT] Failed to send heartbeat', {
                        channelName,
                        error: err.message
                    })
                    // Update connection state on heartbeat failure
                    updateConnectionState('error', 'heartbeat_failed')
                    scheduleReconnect('heartbeat_failed')
                }
            }
        }, heartbeatIntervalMs)
    }

    function scheduleReconnect(reason) {
        if (closedByUser) return

        if (retries >= maxRetries) {
            console.error('[Realtime] Max retries reached — giving up', {
                channelName,
                reason,
                totalRetries: retries,
            })
            updateConnectionState('error', 'max_retries_exceeded')
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
            updateConnectionState('reconnecting', `retry_${reason}`)
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

        updateConnectionState('connecting', reason)
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
                // Update activity timestamp on actual data reception
                lastActivity = Date.now()

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
                // Update activity timestamp on actual data reception
                lastActivity = Date.now()

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
                updateConnectionState('connected', 'subscription_successful')
                startHeartbeat()
                return
            }

            if (status === 'CHANNEL_ERROR') {
                console.warn('[Realtime] CHANNEL_ERROR — scheduling reconnect', {
                    channelName,
                })
                updateConnectionState('error', 'channel_error')
                scheduleReconnect('CHANNEL_ERROR')
                return
            }

            if (status === 'CLOSED') {
                console.warn('[Realtime] CLOSED — scheduling reconnect', { channelName })
                updateConnectionState('error', 'connection_closed')
                scheduleReconnect('CLOSED')
                return
            }

            if (status === 'TIMED_OUT') {
                console.warn('[Realtime] TIMED_OUT — scheduling reconnect', {
                    channelName,
                })
                updateConnectionState('error', 'connection_timeout')
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
        updateConnectionState('disconnected', 'user_initiated')
        teardownAll()
        console.log('[Realtime] Unsubscribed from execution realtime', {
            channelName,
        })
    }
}
