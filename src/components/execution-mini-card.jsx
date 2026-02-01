'use client';

import { useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, CircleDot } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

/* -----------------------------
   Status styles
----------------------------- */

function statusStyles(status) {
  switch (status) {
    case 'created':
      return 'border-l-slate-400 text-slate-500';
    case 'queued':
      return 'border-l-blue-400 text-blue-500';
    case 'running':
      return 'border-l-amber-400 text-amber-500';
    case 'completed':
      return 'border-l-emerald-500 text-emerald-500';
    case 'failed':
      return 'border-l-red-500 text-red-500';
    default:
      return 'border-l-muted-foreground/40 text-muted-foreground';
  }
}

function StatusIcon({ status }) {
  switch (status) {
    case 'created':
      return <CircleDot className='h-4 w-4' />;
    case 'queued':
      return <Clock className='h-4 w-4' />;
    case 'running':
      return <Loader2 className='h-4 w-4 animate-spin' />;
    case 'completed':
      return <CheckCircle2 className='h-4 w-4' />;
    case 'failed':
      return <XCircle className='h-4 w-4' />;
    default:
      return null;
  }
}

/* -----------------------------
   Component
----------------------------- */

export function ExecutionMiniCard({ execution, isCurrentAction, onOpen }) {
  const { id, status, max_duration_ms, owner_avatar, owner_name, __isNew } =
    execution;

  // UI-only "new row" animation
  useEffect(() => {
    if (!__isNew) return;
    const t = setTimeout(() => {
      execution.__isNew = false;
    }, 400);
    return () => clearTimeout(t);
  }, [__isNew, execution]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        __isNew && 'animate-in fade-in slide-in-from-top-2',
      )}
    >
      <button
        type='button'
        onClick={() => onOpen?.(execution)}
        className='w-full text-left'
      >
        <div
          className={cn(
            'flex flex-col gap-1 rounded-md border-l-4 bg-sidebar-accent px-3 py-2 text-xs min-w-0 overflow-hidden transition hover:bg-sidebar-accent/70',
            statusStyles(status),
          )}
        >
          {/* Top row */}
          <div className='flex items-center justify-between font-mono min-w-0'>
            <div className='flex items-center gap-2 min-w-0'>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  isCurrentAction ? 'bg-primary' : 'bg-muted-foreground/40',
                )}
              />
              <span className='truncate'>{id?.slice(0, 12)}…</span>
            </div>

            <StatusIcon status={status} />
          </div>

          {/* Bottom row */}
          <div className='flex items-center gap-2 text-muted-foreground min-w-0'>
            <Avatar className='size-4'>
              {owner_avatar && (
                <AvatarImage src={owner_avatar} alt={owner_name} />
              )}

              <AvatarFallback className='bg-slate-700 text-white text-[9px] font-semibold'>
                {owner_name?.trim()?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>

            <span className='truncate flex-1'>{owner_name}</span>

            {max_duration_ms != null && (
              <span className='tabular-nums shrink-0'>
                {max_duration_ms} ms
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
