'use client';

import * as React from 'react';
import { Info, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SettingsNotice component for displaying standardized notices in settings pages
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Notice title
 * @param {string} props.description - Notice description
 * @param {'info'|'warning'|'error'|'success'} props.variant - Visual variant (default: 'info')
 * @param {React.ReactNode} props.icon - Custom icon (overrides variant icon)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.centered - Whether to center the content (default: false)
 */
export function SettingsNotice({
  title,
  description,
  variant = 'info',
  icon: customIcon,
  className,
  centered = false,
  ...props
}) {
  const variantStyles = {
    info: {
      container:
        'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800',
      title: 'text-blue-800 dark:text-blue-200',
      description: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-600 dark:bg-blue-400',
      icon: Info,
    },
    warning: {
      container:
        'border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800',
      title: 'text-amber-800 dark:text-amber-200',
      description: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-600 dark:bg-amber-400',
      icon: AlertTriangle,
    },
    error: {
      container: 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800',
      title: 'text-red-800 dark:text-red-200',
      description: 'text-red-700 dark:text-red-300',
      dot: 'bg-red-600 dark:bg-red-400',
      icon: AlertCircle,
    },
    success: {
      container:
        'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800',
      title: 'text-green-800 dark:text-green-200',
      description: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-600 dark:bg-green-400',
      icon: CheckCircle,
    },
    // Default slate style (like in TeamSettings)
    default: {
      container:
        'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50',
      title: 'text-slate-800 dark:text-slate-200',
      description: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-600 dark:bg-slate-400',
      icon: Info,
    },
  };

  const styles = variantStyles[variant] || variantStyles.info;
  const IconComponent = customIcon || styles.icon;

  const content = (
    <div className='space-y-1'>
      <p className={cn('text-sm font-medium', styles.title)}>{title}</p>
      {description && (
        <p className={cn('text-xs', styles.description)}>{description}</p>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'rounded-md border p-4',
        styles.container,
        centered && 'text-center',
        className,
      )}
      {...props}
    >
      {centered ? (
        <div className='flex items-center justify-center gap-2 mb-2'>
          <div className={cn('h-2 w-2 rounded-full', styles.dot)} />
          <h3 className={cn('text-sm font-semibold', styles.title)}>{title}</h3>
        </div>
      ) : (
        <div className='flex items-start gap-2'>
          <IconComponent className='h-4 w-4 mt-0.5 shrink-0' />
          {content}
        </div>
      )}

      {centered && description && (
        <p className={cn('text-xs mt-2', styles.description)}>{description}</p>
      )}
    </div>
  );
}

/**
 * Preset notice components for common use cases
 */

export function ComingSoonNotice({
  title = 'Coming soon',
  description,
  ...props
}) {
  return (
    <SettingsNotice
      variant='default'
      title={title}
      description={
        description ||
        "We're working on bringing this feature to your workspace. Stay tuned!"
      }
      centered
      {...props}
    />
  );
}

export function InfoNotice({ title, description, ...props }) {
  return (
    <SettingsNotice
      variant='info'
      title={title}
      description={description}
      {...props}
    />
  );
}

export function WarningNotice({ title, description, ...props }) {
  return (
    <SettingsNotice
      variant='warning'
      title={title}
      description={description}
      {...props}
    />
  );
}

export function ErrorNotice({ title, description, ...props }) {
  return (
    <SettingsNotice
      variant='error'
      title={title}
      description={description}
      {...props}
    />
  );
}

export function SuccessNotice({ title, description, ...props }) {
  return (
    <SettingsNotice
      variant='success'
      title={title}
      description={description}
      {...props}
    />
  );
}
