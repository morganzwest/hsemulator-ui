'use client';

import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

import {
  Clock,
  User,
  Activity,
  AlertTriangle,
  Terminal,
  PlayCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useExecutionDetails } from '@/lib/use-execution-details';
import { formatDistanceToNowStrict } from 'date-fns';

/* -------------------------------------
   Helpers
------------------------------------- */

function statusBadge(status, ok) {
  if (status === 'running')
    return (
      <Badge className='border border-amber-500/30 bg-amber-500/15 text-amber-600 animate-pulse'>
        Running
      </Badge>
    );

  if (status === 'executed' && ok)
    return (
      <Badge className='border border-emerald-600/30 bg-emerald-600/15 text-emerald-600'>
        Success
      </Badge>
    );

  if (status === 'failed') return <Badge variant='destructive'>Failed</Badge>;

  return <Badge variant='outline'>{status}</Badge>;
}

function exportExecution({ execution, events, type }) {
  if (!execution) return;

  let content = '';
  let mime = 'text/plain';
  let extension = type;

  switch (type) {
    case 'json': {
      mime = 'application/json';
      content = JSON.stringify(
        {
          execution,
          events,
          exported_at: new Date().toISOString(),
        },
        null,
        2,
      );
      break;
    }

    case 'txt': {
      content = [
        `Execution ID: ${execution.id}`,
        `Action: ${execution.action_name}`,
        `Status: ${execution.status}`,
        `Created: ${execution.created_at}`,
        '',
        '--- EVENTS ---',
        ...events.map(
          (e) =>
            `[${e.event_time}] ${e.kind}\n${e.message ?? ''}`,
        ),
      ].join('\n\n');
      break;
    }

    default:
      return;
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `execution-${execution.id}.${extension}`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ExecutionExportFooter({ execution, events }) {
  return (
    <div className="border-t bg-background px-6 py-3">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={!execution}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
            >
              Export
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                exportExecution({
                  execution,
                  events,
                  type: 'json',
                })
              }
            >
              Export to JSON
            </DropdownMenuItem>

            <DropdownMenuItem
            disabled
              onClick={() =>
                exportExecution({
                  execution,
                  events,
                  type: 'txt',
                })
              }
            >
              Export to TXT <Badge className="ml-2" variant="outline">Coming Soon</Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}


function eventIcon(kind) {
  if (kind === 'Stdout')
    return <Terminal className='h-4 w-4 text-muted-foreground' />;
  if (kind === 'Stderr')
    return <AlertTriangle className='h-4 w-4 text-red-500' />;
  if (kind === 'ExecutionCreated')
    return <PlayCircle className='h-4 w-4 text-muted-foreground' />;
  return <Activity className='h-4 w-4 text-muted-foreground' />;
}

function eventStyles(kind) {
  if (kind === 'Stderr') return 'bg-red-500/10 border-red-500/40 text-red-400';
  if (kind === 'Stdout') return 'bg-muted text-foreground';
  return 'bg-muted/50 text-muted-foreground';
}

function formatMemory(kb) {
  if (kb == null) return null;
  if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

/* -------------------------------------
   Component
------------------------------------- */

export function ExecutionSheet({ executionId, open, onOpenChange }) {
  const {
    execution,
    events = [],
    loading,
    error,
  } = useExecutionDetails(executionId);

  const outputFields = execution?.result?.outputFields;
  const hasOutput = outputFields && Object.keys(outputFields).length > 0;

  const createdLabel = useMemo(() => {
    if (!execution?.created_at) return null;
    const d = new Date(execution.created_at);
    return {
      relative: `${formatDistanceToNowStrict(d)} ago`,
      full: d.toLocaleString(),
    };
  }, [execution?.created_at]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-[clamp(560px,55vw,1000px)] min-w-[560px] flex-col p-0'
      >
        {/* Header */}
        <SheetHeader className='border-b px-6 py-4 pr-12'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-0.5'>
              <SheetTitle className='text-sm font-semibold'>
                {execution?.action_name ?? 'Execution'}
              </SheetTitle>

              <SheetDescription className='flex items-center gap-2 font-mono text-xs'>
                <span>{executionId}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(executionId)}
                  className='text-muted-foreground hover:text-foreground'
                >
                  Copy
                </button>
              </SheetDescription>
            </div>

            {execution && statusBadge(execution.status, execution.ok)}
          </div>
        </SheetHeader>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 text-sm [scrollbar-gutter:stable]'>
          {loading && (
            <div className='space-y-3'>
              <Skeleton className='h-4 w-1/3' />
              <Skeleton className='h-24 w-full' />
            </div>
          )}

          {error && (
            <div className='rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-500'>
              Failed to load execution details
            </div>
          )}

          {execution && (
            <div className='flex flex-col gap-6'>
              {/* Summary */}
              <section className='grid grid-cols-2 gap-4'>
                <Metric
                  icon={<Clock className='h-4 w-4' />}
                  label='Created'
                  value={
                    <span title={createdLabel?.full}>
                      {createdLabel?.relative}
                    </span>
                  }
                />

                <Metric
                  icon={<Activity className='h-4 w-4' />}
                  label='Updated'
                  value={new Date(execution.updated_at).toLocaleString()}
                />

                {execution.duration_ms != null && (
                  <Metric
                    label='Duration'
                    value={`${execution.duration_ms} ms`}
                  />
                )}

                {execution.max_memory_kb != null && (
                  <Metric
                    label='Max memory'
                    value={formatMemory(execution.max_memory_kb)}
                  />
                )}

                <Metric
                  icon={<User className='h-4 w-4' />}
                  label='Owner'
                  value={execution.owner_name}
                  colSpan
                />
              </section>

              {/* Output */}
              {hasOutput && (
                <section className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='flex items-center gap-2 text-sm font-medium'>
                      <Terminal className='h-4 w-4' />
                      Execution output
                    </h3>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          JSON.stringify(outputFields, null, 2),
                        )
                      }
                      className='text-xs text-muted-foreground hover:text-foreground'
                    >
                      Copy JSON
                    </button>
                  </div>

                  <div className='rounded-md border divide-y overflow-hidden'>
                    {Object.entries(outputFields).map(([key, value]) => (
                      <div
                        key={key}
                        className='grid grid-cols-3 gap-4 px-3 py-2 text-xs'
                      >
                        <div className='truncate font-mono text-muted-foreground'>
                          {key}
                        </div>

                        <div className='col-span-2 font-mono select-text'>
                          {typeof value === 'string' && (
                            <span className='text-sky-500'>"{value}"</span>
                          )}

                          {typeof value === 'number' && (
                            <span className='text-emerald-500'>{value}</span>
                          )}

                          {typeof value === 'boolean' && (
                            <span className='text-violet-500'>
                              {String(value)}
                            </span>
                          )}

                          {value === null && (
                            <span className='text-muted-foreground'>null</span>
                          )}

                          {typeof value === 'object' && value !== null && (
                            <details className='mt-1'>
                              <summary className='cursor-pointer text-muted-foreground'>
                                Object
                              </summary>
                              <pre className='mt-2 rounded bg-muted/40 p-2 text-xs whitespace-pre-wrap'>
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />
                </section>
              )}

              {/* Action context */}
              {execution.action_description && (
                <div className='-mx-6 px-6'>
                  <section className='sticky top-4 z-30 rounded-md border-l-4 border-primary bg-muted/20 p-4'>
                    <div className='mb-1 text-xs font-medium text-muted-foreground'>
                      Action context
                    </div>
                    <p className='leading-relaxed'>
                      {execution.action_description}
                    </p>
                  </section>

                  <Separator className='my-6' />
                </div>
              )}

              {/* Timeline */}
              <section className='space-y-4'>
                <h3 className='flex items-center gap-2 text-sm font-medium'>
                  <Activity className='h-4 w-4' />
                  Execution timeline
                </h3>

                {events.length === 0 ? (
                  <div className='text-muted-foreground'>
                    No events recorded
                  </div>
                ) : (
                  <div className='relative space-y-5'>
                    <div className='absolute left-[7px] top-0 bottom-0 w-px bg-border' />

                    {events.map((ev) => (
                      <div key={ev.id} className='relative flex gap-4'>
                        <div className='mt-1 z-10 shrink-0'>
                          {eventIcon(ev.kind)}
                        </div>

                        <div className='flex-1 space-y-1'>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground font-mono'>
                            <span className='rounded border px-1.5 py-0.5 text-[10px] uppercase'>
                              {ev.kind}
                            </span>
                            <span>
                              {new Date(ev.event_time).toLocaleTimeString('en-GB', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
})
}
                            </span>
                          </div>

                          {ev.message && (
                            <pre
                              className={`rounded-md border px-3 py-2 font-mono text-xs whitespace-pre-wrap ${eventStyles(
                                ev.kind,
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
        <ExecutionExportFooter
  execution={execution}
  events={events}
/>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------
   Metric
------------------------------------- */

function Metric({ icon, label, value, colSpan }) {
  return (
    <div
      className={`flex gap-3 rounded-md border bg-background p-3 ${
        colSpan ? 'col-span-2' : ''
      }`}
    >
      <div className='text-muted-foreground'>
        {icon ?? <span className='h-4 w-4' />}
      </div>

      <div>
        <div className='text-xs text-muted-foreground'>{label}</div>
        <div className='font-medium tabular-nums'>{value}</div>
      </div>
    </div>
  );
}
