import React from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';

const connectionStates = {
  connected: {
    icon: Wifi,
    light: {
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    dark: {
      color: 'text-green-400',
      bgColor: 'bg-green-950',
      borderColor: 'border-green-800',
    },
    label: 'Connected',
  },
  connecting: {
    icon: Loader2,
    light: {
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    dark: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-950',
      borderColor: 'border-blue-800',
    },
    label: 'Connecting...',
  },
  reconnecting: {
    icon: Loader2,
    light: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    dark: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-950',
      borderColor: 'border-yellow-800',
    },
    label: 'Reconnecting...',
  },
  disconnected: {
    icon: WifiOff,
    light: {
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    dark: {
      color: 'text-gray-400',
      bgColor: 'bg-gray-950',
      borderColor: 'border-gray-800',
    },
    label: 'Disconnected',
  },
  error: {
    icon: AlertTriangle,
    light: {
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    dark: {
      color: 'text-red-400',
      bgColor: 'bg-red-950',
      borderColor: 'border-red-800',
    },
    label: 'Connection Error',
  },
};

export function ConnectionStatusIndicator({
  state,
  reason,
  retries,
  showLabel = true,
  size = 'sm',
  silent = false,
  className,
}) {
  // Hide component completely if silent mode is enabled and this is a stale connection
  if (silent && reason && reason.includes('stale_connection')) {
    return null;
  }

  const config = connectionStates[state] || connectionStates.disconnected;
  const Icon = config.icon;
  const isSpinning = state === 'connecting' || state === 'reconnecting';

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Check if dark mode is active
  const isDarkMode =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const themeConfig = isDarkMode ? config.dark : config.light;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 rounded-md border transition-colors duration-200',
        themeConfig.bgColor,
        themeConfig.borderColor,
        className,
      )}
      title={reason ? `${config.label} - ${reason}` : config.label}
    >
      <Icon
        className={cn(
          sizeClasses[size],
          themeConfig.color,
          isSpinning && 'animate-spin',
        )}
      />
      {showLabel && !silent && (
        <span className={cn('text-xs font-medium', themeConfig.color)}>
          {config.label}
          {retries > 0 && state === 'reconnecting' && ` (${retries})`}
        </span>
      )}
    </div>
  );
}
