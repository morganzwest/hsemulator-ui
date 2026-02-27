import React from 'react';
import { ConnectionStatusIndicator } from './connection-status-indicator';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ConnectionStatusBanner({
  connectionState,
  connectionInfo,
  onManualReconnect,
  silent = false, // New prop to hide banner for stale connections
  className,
}) {
  const { reason, retries, channelName } = connectionInfo;

  // Check if dark mode is active
  const isDarkMode =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Hide banner completely if silent mode is enabled and this is a stale connection
  if (silent && reason && reason.includes('stale_connection')) {
    return null;
  }

  // Show banner based on error classification and retry count
  // Non-retryable errors show immediately, retryable errors respect 7-retry threshold
  // Filter out stale_connection and any retry_stale_connection reasons
  const isStaleConnection =
    reason &&
    (reason === 'stale_connection' || reason.includes('stale_connection'));

  // Classify errors as retryable vs non-retryable
  const isRetryableError = (reason) => {
    return (
      reason === 'connection_closed' ||
      reason === 'connection_timeout' ||
      reason === 'stale_connection' ||
      (reason && reason.includes('stale_connection')) ||
      (reason && reason.startsWith('retry_'))
    );
  };

  const isNonRetryableError = (reason) => {
    return (
      reason === 'max_retries_exceeded' ||
      reason === 'channel_error' ||
      reason === 'auth_change_no_session'
    );
  };

  const shouldShowBanner =
    // Non-retryable errors - show immediately
    (connectionState === 'error' && isNonRetryableError(reason)) ||
    // Retryable errors - only after 7 attempts
    (connectionState === 'error' && isRetryableError(reason) && retries >= 7) ||
    // Reconnecting state - after 7 attempts (existing logic)
    (connectionState === 'reconnecting' &&
      retries >= 7 &&
      !isStaleConnection) ||
    // Disconnected state - if not user initiated and not stale
    (connectionState === 'disconnected' &&
      reason !== 'user_initiated' &&
      !isStaleConnection);

  if (!shouldShowBanner) return null;

  const getBannerMessage = () => {
    switch (connectionState) {
      case 'reconnecting':
        return retries > 1
          ? `Attempting to reconnect... (attempt ${retries})`
          : 'Connection lost, attempting to reconnect...';
      case 'error':
        if (reason === 'max_retries_exceeded') {
          return 'Connection failed - maximum retry attempts reached';
        }
        return `Connection error: ${reason || 'Unknown error'}`;
      case 'disconnected':
        return 'Realtime connection lost';
      default:
        return 'Connection issue detected';
    }
  };

  const getBannerColor = () => {
    const lightColors = {
      reconnecting: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      disconnected: 'bg-gray-50 border-gray-200 text-gray-800',
    };

    const darkColors = {
      reconnecting: 'bg-yellow-950 border-yellow-800 text-yellow-200',
      error: 'bg-red-950 border-red-800 text-red-200',
      disconnected: 'bg-gray-950 border-gray-800 text-gray-200',
    };

    const colors = lightColors[connectionState] || lightColors.error;
    return isDarkMode
      ? darkColors[connectionState] || darkColors.error
      : colors;
  };

  return (
    <div
      className={cn(
        'border-b px-4 py-3 flex items-center justify-between',
        getBannerColor(),
        className,
      )}
    >
      <div className='flex items-center gap-3'>
        <ConnectionStatusIndicator
          state={connectionState}
          reason={reason}
          retries={retries}
          showLabel={false}
          size='sm'
          silent={silent && isStaleConnection}
        />
        <div className='flex items-center gap-2'>
          {connectionState === 'error' && <AlertTriangle className='w-4 h-4' />}
          <span className='text-sm font-medium'>{getBannerMessage()}</span>
        </div>
      </div>

      {connectionState === 'error' && onManualReconnect && (
        <button
          onClick={onManualReconnect}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm',
            isDarkMode
              ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500'
              : 'bg-red-500 hover:bg-red-600 text-white border border-red-400',
          )}
        >
          <RefreshCw className='w-4 h-4' />
          Retry Connection
        </button>
      )}

      {connectionState === 'reconnecting' &&
        retries >= 7 &&
        onManualReconnect && (
          <button
            onClick={onManualReconnect}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors',
              isDarkMode
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-500'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-400',
            )}
          >
            <RefreshCw className='w-3 h-3' />
            Force Retry
          </button>
        )}
    </div>
  );
}
