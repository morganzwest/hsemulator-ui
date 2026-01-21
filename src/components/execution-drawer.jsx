'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

import {
  Clock,
  User,
  Activity,
  AlertTriangle,
  Terminal,
  PlayCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useExecutionDetails } from '@/lib/use-execution-details'

/* -------------------------------------
   Helpers
------------------------------------- */

function statusBadge(status, ok) {
  if (status === 'running')
    return (
      <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30">
        Running
      </Badge>
    )

  if (status === 'executed' && ok)
    return (
      <Badge className="bg-emerald-600/15 text-emerald-600 border border-emerald-600/30">
        Success
      </Badge>
    )

  if (status === 'failed')
    return <Badge variant="destructive">Failed</Badge>

  return <Badge variant="outline">{status}</Badge>
}

function eventIcon(kind) {
  if (kind === 'Stdout')
    return <Terminal className="h-4 w-4 text-muted-foreground" />
  if (kind === 'Stderr')
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  if (kind === 'ExecutionCreated')
    return <PlayCircle className="h-4 w-4 text-muted-foreground" />
  return <Activity className="h-4 w-4 text-muted-foreground" />
}

function eventStyles(kind) {
  if (kind === 'Stderr')
    return 'bg-red-500/10 border-red-500/30 text-red-500'
  if (kind === 'Stdout')
    return 'bg-muted text-foreground'
  return 'bg-muted/50 text-muted-foreground'
}

function formatMemory(kb) {
  if (kb == null) return null
  if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${kb} KB`
}

/* -------------------------------------
   Component
------------------------------------- */

export function ExecutionSheet({
  executionId,
  open,
  onOpenChange,
}) {
  const {
    execution,
    events = [],
    loading,
    error,
  } = useExecutionDetails(executionId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[50vw] max-w-[900px] min-w-[30vw] flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-base font-semibold">
                {execution?.action_name ?? 'Execution'}
              </SheetTitle>

              <SheetDescription className="font-mono text-xs">
                Execution {executionId}
              </SheetDescription>
            </div>

            {execution &&
              statusBadge(execution.status, execution.ok)}
          </div>
        </SheetHeader>

        {/* Scroll container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 text-sm">
          {loading && (
            <div className="text-muted-foreground">
              Loading execution…
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-500">
              Failed to load execution details
            </div>
          )}

          {execution && (
            <div className="flex flex-col gap- bg-background">
              {/* ---------------------------------
                 Summary metrics
              --------------------------------- */}
              <section className="grid grid-cols-2 gap-4">
                <Metric
                  icon={<Clock className="h-4 w-4" />}
                  label="Created"
                  value={new Date(
                    execution.created_at
                  ).toLocaleString()}
                />

                <Metric
                  icon={<Activity className="h-4 w-4" />}
                  label="Updated"
                  value={new Date(
                    execution.updated_at
                  ).toLocaleString()}
                />

                {execution.duration_ms != null && (
                  <Metric
                    label="Duration"
                    value={`${execution.duration_ms} ms`}
                  />
                )}

                {execution.max_memory_kb != null && (
                  <Metric
                    label="Max memory"
                    value={formatMemory(
                      execution.max_memory_kb
                    )}
                  />
                )}

                <Metric
                  icon={<User className="h-4 w-4" />}
                  label="Owner"
                  value={execution.owner_name}
                  colSpan
                />
              </section>

              {/* ---------------------------------
                 Sticky Action Context
              --------------------------------- */}
              {execution.action_description && (
                <div className="sticky -top-8 z-30 bg-background -mx-6 px-6 pt-6">
                  <section className="rounded-md border bg-muted/30 p-4">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Action context
                    </div>
                    <p className="leading-relaxed">
                      {execution.action_description}
                    </p>
                  </section>

                  <Separator className="my-6" />
                </div>
              )}

              {/* ---------------------------------
                 Execution timeline
              --------------------------------- */}
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="h-4 w-4" />
                  Execution timeline
                </h3>

                {events.length === 0 ? (
                  <div className="text-muted-foreground">
                    No events recorded
                  </div>
                ) : (
                  <div className="relative space-y-5">
                    <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border" />

                    {events.map(ev => (
                      <div
                        key={ev.id}
                        className="relative flex gap-4"
                      >
                        <div className="mt-1 shrink-0 z-10">
                          {eventIcon(ev.kind)}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="uppercase">
                              {ev.kind}
                            </span>
                            <span>·</span>
                            <span>
                              {new Date(
                                ev.event_time
                              ).toLocaleTimeString()}
                            </span>
                          </div>

                          {ev.message && (
                            <pre
                              className={`rounded-md border px-3 py-2 font-mono text-xs whitespace-pre-wrap ${eventStyles(
                                ev.kind
                              )}`}
                            >
                              {ev.message}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* -------------------------------------
   Metric primitive
------------------------------------- */

function Metric({
  icon,
  label,
  value,
  colSpan,
}) {
  return (
    <div
      className={`rounded-md border bg-background p-3 flex gap-3 ${
        colSpan ? 'col-span-2' : ''
      }`}
    >
      {icon && (
        <div className="text-muted-foreground">
          {icon}
        </div>
      )}
      <div>
        <div className="text-xs text-muted-foreground">
          {label}
        </div>
        <div className="font-medium tabular-nums">
          {value}
        </div>
      </div>
    </div>
  )
}
