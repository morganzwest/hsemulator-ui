/**
 * Realtime subscriptions for action executions and logs.
 *
 * - Subscribes to:
 *   - public.action_execution_events (ALL events)
 *   - public.action_executions (UPDATE)
 *
 * - Handles Realtime v2 payload shape
 * - Auto-reconnects on CLOSED / CHANNEL_ERROR with exponential backoff
 * - Safe cleanup and idempotent teardown
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
        maxRetries = 5,
        baseRetryDelayMs = 500,
        maxRetryDelayMs = 10_000,
    } = {}
) {
    if (!supabase) {
        throw new Error('subscribeExecutionRealtime requires a Supabase client')
    }

    let channel = null
    let retries = 0
    let closedByUser = false
    let reconnectTimer = null

    function clearReconnectTimer() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer)
            reconnectTimer = null
        }
    }

    function backoffDelay(attempt) {
        // exponential backoff with cap
        const delay = baseRetryDelayMs * Math.pow(2, attempt)
        return Math.min(delay, maxRetryDelayMs)
    }

    function teardownChannel() {
        clearReconnectTimer()
        if (channel) {
            try {
                supabase.removeChannel(channel)
            } catch (_) {
                // noop
            }
            channel = null
        }
    }

    function scheduleReconnect(reason) {
        if (closedByUser) return
        if (retries >= maxRetries) {
            console.error(
                '[Realtime] Max retries reached — giving up',
                { channelName, reason }
            )
            return
        }

        const delay = backoffDelay(retries)
        retries += 1

        console.warn(
            `[Realtime] Reconnecting in ${delay}ms (attempt ${retries}/${maxRetries})`,
            { channelName, reason }
        )

        clearReconnectTimer()
        reconnectTimer = setTimeout(() => {
            teardownChannel()
            createAndSubscribe()
        }, delay)
    }

    function createAndSubscribe() {
        if (closedByUser) return

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

                console.groupCollapsed(
                    `[Realtime][LOG][${payload.eventType}] ${logsTable}`
                )
                console.log(payload)
                console.groupEnd()

                if (typeof onLog === 'function') {
                    onLog(payload)
                }
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
                console.groupCollapsed(
                    `[Realtime][EXECUTION][UPDATE] ${executionsTable}`
                )
                console.log(payload)
                console.groupEnd()

                if (typeof onExecutionUpdate === 'function') {
                    onExecutionUpdate(payload)
                }
            }
        )

        /* -----------------------------------------
           SUBSCRIBE + STATUS HANDLING
        ------------------------------------------ */

        channel.subscribe(status => {
            console.log('[Realtime][STATUS]', status, { channelName })

            if (status === 'SUBSCRIBED') {
                // successful connection → reset retry counter
                retries = 0
                clearReconnectTimer()
            }

            if (status === 'CHANNEL_ERROR') {
                console.error(
                    '[Realtime] CHANNEL_ERROR — scheduling reconnect',
                    { channelName }
                )
                scheduleReconnect('CHANNEL_ERROR')
            }

            if (status === 'CLOSED') {
                console.warn(
                    '[Realtime] CLOSED — scheduling reconnect',
                    { channelName }
                )
                scheduleReconnect('CLOSED')
            }

            if (status === 'TIMED_OUT') {
                console.warn(
                    '[Realtime] TIMED_OUT — scheduling reconnect',
                    { channelName }
                )
                scheduleReconnect('TIMED_OUT')
            }
        })
    }

    // initial connect
    createAndSubscribe()

    /* -----------------------------------------
       RETURN CLEANUP
    ------------------------------------------ */

    return function unsubscribe() {
        closedByUser = true
        clearReconnectTimer()
        teardownChannel()
        console.log('[Realtime] Unsubscribed from execution realtime', {
            channelName,
        })
    }
}
