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

function ExecutionStatusExplainer({ status }) {
  switch (status) {
    case 'created':
      return (
        <Explainer
          icon={<PlayCircle className='h-5 w-5' />}
          title='Execution created'
          description='This execution has been created but has not yet entered the queue.'
        />
      );

    case 'queued':
      return (
        <Explainer
          icon={<Clock className='h-5 w-5 animate-pulse' />}
          title='Waiting to run'
          description='The execution is queued and will start as soon as a worker becomes available.'
        />
      );

    case 'running':
      return (
        <Explainer
          icon={<Activity className='h-5 w-5 animate-pulse' />}
          title='Execution in progress'
          description='The action is currently running. Logs will appear here as they are produced.'
        />
      );

    default:
      return null;
  }
}

function Explainer({ icon, title, description }) {
  return (
    <div className='flex gap-4 rounded-md border bg-muted/30 p-4'>
      <div className='text-primary'>{icon}</div>
      <div>
        <div className='text-sm font-medium'>{title}</div>
        <p className='text-sm text-muted-foreground leading-relaxed'>
          {description}
        </p>
      </div>
    </div>
  );
}

const EVENT_META = {
  ExecutionCreated: {
    label: 'Execution created',
    icon: <PlayCircle className='h-3.5 w-3.5' />,
    tone: 'neutral',
  },
  ValidationStarted: {
    label: 'Validation started',
    icon: <Activity className='h-3.5 w-3.5' />,
    tone: 'info',
  },
  ExecutionStarted: {
    label: 'Execution started',
    icon: <Terminal className='h-3.5 w-3.5' />,
    tone: 'running',
  },
  ExecutionCompleted: {
    label: 'Execution finished',
    icon: <AlertTriangle className='h-3.5 w-3.5' />,
    tone: 'done',
  },
  Stderr: {
    label: 'Error',
    icon: <Error className='h-3.5 w-3.5' />,
    tone: 'done',
  },
};

function formatEventKind(kind) {
  return EVENT_META[kind]?.label ?? kind;
}

function eventIcon(kind) {
  return (
    <div className='rounded-full border bg-background p-1'>
      {EVENT_META[kind]?.icon ?? <Activity className='h-3.5 w-3.5' />}
    </div>
  );
}

function eventStyles(kind) {
  switch (EVENT_META[kind]?.tone) {
    case 'running':
      return 'bg-amber-500/10 border-amber-500/30 text-amber-700';
    case 'done':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700';
    case 'info':
      return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
    default:
      return 'bg-muted/40';
  }
}

/* -------------------------------------
   Status badge (normalised)
------------------------------------- */

function ExecutionExportFooter({ execution, events }) {
  return (
    <div className='border-t bg-background px-6 py-3'>
      <div className='flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={!execution}
              className='inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50'
            >
              Export
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end'>
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

            <DropdownMenuItem disabled>
              Export to TXT
              <Badge className='ml-2' variant='outline'>
                Coming Soon
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function statusBadge(status, ok) {
  switch (status) {
    case 'created':
      return (
        <Badge className='border border-slate-500/30 bg-slate-500/15 text-slate-500'>
          Created
        </Badge>
      );

    case 'queued':
      return (
        <Badge className='border border-blue-500/30 bg-blue-500/15 text-blue-500'>
          Queued
        </Badge>
      );

    case 'running':
      return (
        <Badge className='border border-amber-500/30 bg-amber-500/15 text-amber-600 animate-pulse'>
          Running
        </Badge>
      );

    case 'completed':
      return ok ? (
        <Badge className='border border-emerald-600/30 bg-emerald-600/15 text-emerald-600'>
          Success
        </Badge>
      ) : (
        <Badge className='border border-red-500/30 bg-red-500/15 text-red-500'>
          Failed
        </Badge>
      );

    case 'failed':
      return (
        <Badge className='border border-red-500/30 bg-red-500/15 text-red-500'>
          Failed
        </Badge>
      );

    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
}

/* -------------------------------------
   Helpers
------------------------------------- */

function exportExecution({ execution, events, type }) {
  if (!execution) return;

  let content = '';
  let mime = 'text/plain';
  let extension = type;

  switch (type) {
    case 'json':
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

    case 'txt':
      content = [
        `Execution ID: ${execution.id}`,
        `Action: ${execution.action_name}`,
        `Status: ${execution.status}`,
        `Created: ${execution.created_at}`,
        '',
        '--- EVENTS ---',
        ...events.map((e) => `[${e.event_time}] ${e.kind}\n${e.message ?? ''}`),
      ].join('\n\n');
      break;

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

  const showTimeline =
    execution &&
    (execution.status === 'running' ||
      execution.status === 'completed' ||
      execution.status === 'failed');

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
                          <pre className='whitespace-pre-wrap'>
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />
                </section>
              )}

              {/* Status explainer */}
              {!showTimeline && (
                <ExecutionStatusExplainer status={execution.status} />
              )}

              {/* Timeline */}
              {showTimeline && (
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
                                {formatEventKind(ev.kind)}
                              </span>
                              <span>
                                {new Date(ev.event_time).toLocaleTimeString(
                                  'en-GB',
                                  {
                                    hour12: false,
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    fractionalSecondDigits: 3,
                                  },
                                )}
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
              )}
            </div>
          )}
        </div>

        <ExecutionExportFooter execution={execution} events={events} />
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
