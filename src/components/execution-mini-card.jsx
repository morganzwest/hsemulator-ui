import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

function statusStyles(status, ok) {
  if (status === 'running')
    return 'border-l-amber-400 text-amber-500'
  if (status === 'executed' && ok)
    return 'border-l-emerald-500 text-emerald-500'
  if (status === 'failed')
    return 'border-l-red-500 text-red-500'
  return 'border-l-muted-foreground/40 text-muted-foreground'
}

function StatusIcon({ status, ok }) {
  if (status === 'running')
    return <Loader2 className="h-4 w-4 animate-spin" />
  if (status === 'executed' && ok)
    return <CheckCircle2 className="h-4 w-4" />
  if (status === 'failed')
    return <XCircle className="h-4 w-4" />
  return null
}

export function ExecutionMiniCard({
  execution,
  isCurrentAction = false,
}) {
  const {
    execution_id,
    status,
    ok,
    max_duration_ms,
    owner_avatar,
    owner_name,
  } = execution

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-md border-l-4 bg-sidebar-accent px-3 py-2 text-xs min-w-0 overflow-hidden',
        statusStyles(status, ok)
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between font-mono min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Context dot */}
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              isCurrentAction
                ? 'bg-primary'
                : 'bg-muted-foreground/40'
            )}
            title={
              isCurrentAction
                ? 'This action'
                : 'Different action'
            }
          />

          <span className="truncate">
            {execution_id?.slice(0, 12)}
          </span>
        </div>

        <StatusIcon status={status} ok={ok} />
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
        <div className="shrink-0">
          <Image
            src={owner_avatar}
            alt={owner_name}
            width={16}
            height={16}
            className="rounded-full"
          />
        </div>

        <span className="truncate min-w-0 flex-1">
          {owner_name}
        </span>

        {max_duration_ms != null && (
          <span className="ml-auto tabular-nums shrink-0">
            {max_duration_ms} ms
          </span>
        )}
      </div>
    </div>
  )
}
