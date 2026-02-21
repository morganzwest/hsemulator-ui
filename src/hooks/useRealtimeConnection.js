import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

export function useRealtimeConnection() {
  const [connectionState, setConnectionState] = useState('disconnected')
  const [connectionInfo, setConnectionInfo] = useState({
    reason: null,
    retries: 0,
    timestamp: null,
    channelName: null
  })
  const [isReconnecting, setIsReconnecting] = useState(false)

  const reconnectTimeoutRef = useRef(null)

  const handleConnectionChange = useCallback((info) => {
    const { state, oldState, reason, retries, timestamp, channelName } = info

    setConnectionState(state)
    setConnectionInfo({
      reason,
      retries,
      timestamp,
      channelName
    })

    setIsReconnecting(state === 'reconnecting')

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Connection state management only - no toast notifications
  }, [])

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // Memoize connection info to prevent unnecessary re-renders
  const memoizedConnectionInfo = useMemo(() => connectionInfo, [connectionInfo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearReconnectTimeout()
    }
  }, [clearReconnectTimeout])

  return {
    connectionState,
    connectionInfo: memoizedConnectionInfo,
    isReconnecting,
    handleConnectionChange,
    clearReconnectTimeout
  }
}
