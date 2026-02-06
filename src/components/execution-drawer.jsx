import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5';

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
    severity: 'info',
    structural: true,
  },

  ExecutionFailed: {
    label: 'Execution failed',
    icon: <AlertTriangle className='h-3.5 w-3.5' />,
    tone: 'error',
    severity: 'error',
    structural: true,
  },

  ValidationStarted: {
    label: 'Validation started',
    icon: <Activity className='h-3.5 w-3.5' />,
    tone: 'info',
    severity: 'info',
    structural: true,
  },

  ExecutionStarted: {
    label: 'Execution started',
    icon: <Terminal className='h-3.5 w-3.5' />,
    tone: 'running',
    severity: 'info',
    structural: true,
  },

  ExecutionCompleted: {
    label: 'Execution finished',
    icon: <Activity className='h-3.5 w-3.5' />,
    tone: 'done',
    severity: 'success',
    structural: true,
  },

  Stderr: {
    label: 'Error',
    icon: <AlertTriangle className='h-3.5 w-3.5' />,
    tone: 'error',
    severity: 'error',
    structural: false,
  },
};
function isStructuralErrorEvent(event) {
  return (
    EVENT_META[event.kind]?.structural &&
    EVENT_META[event.kind]?.severity === 'error' &&
    event.message
  );
}

function isReturnEvent(event) {
  return event.kind === 'Return' || event.kind === 'Output';
}

function formatEventKind(kind) {
  return EVENT_META[kind]?.label ?? kind;
}

function groupTimelineEvents(events) {
  const groups = [];
  let current = null;

  for (const ev of events) {
    const meta = EVENT_META[ev.kind];

    // Structural events always start a new group
    if (meta?.structural) {
      current = { event: ev, logs: [] };
      groups.push(current);
      continue;
    }

    // Return/output events should attach to the *last completed* group
    if (isReturnEvent(ev)) {
      const lastCompleted = [...groups]
        .reverse()
        .find((g) => g.event.kind === 'ExecutionCompleted');

      if (lastCompleted) {
        lastCompleted.logs.push(ev);
        continue;
      }
    }

    // Default: attach to current group
    if (!current) {
      current = { event: ev, logs: [] };
      groups.push(current);
    }

    current.logs.push(ev);
  }

  return groups;
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

    case 'error':
      return 'bg-red-500/10 border-red-500/30 text-red-600';

    default:
      return 'bg-muted/40';
  }
}

/* -------------------------------------
   Status badge (normalised)
------------------------------------- */

function ExecutionExportFooter({
  execution,
  events,
  showRawErrors,
  setShowRawErrors,
  errorCount,
}) {
  const showToggle = errorCount > 0;

  return (
    <div className='border-t bg-background px-6 py-3'>
      <div
        className={`flex items-center ${
          showToggle ? 'justify-between' : 'justify-end'
        }`}
      >
        {showToggle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center gap-3'>
                  <Switch
                    checked={showRawErrors}
                    onCheckedChange={setShowRawErrors}
                    id='raw-errors'
                  />
                  <label
                    htmlFor='raw-errors'
                    className='text-xs font-medium cursor-pointer'
                  >
                    {showRawErrors ? 'Raw' : 'Simple'} Output
                  </label>
                </div>
              </TooltipTrigger>

              <TooltipContent side='top'>
                <p className='max-w-xs text-xs'>
                  Toggle between a simplified error message and the full raw
                  stack trace produced by the execution runtime.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

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
function normaliseExecutionEvents(events) {
  return events
    .slice()
    .sort(
      (a, b) =>
        new Date(a.event_time).getTime() - new Date(b.event_time).getTime(),
    )
    .map((e, index) => ({
      ...e,
      index,
      time: new Date(e.event_time),
      hasMessage: Boolean(e.message?.trim()),
      isError: e.kind === 'Stderr' || e.kind === 'ExecutionFailed',
    }));
}

export function formatExecutionError(message) {
  if (!message || typeof message !== 'string') return message;

  const lines = message.split('\n');

  // ---- Extract error header ----
  // JS SyntaxError / TypeError / Error
  const jsHeader =
    lines.find((l) => l.startsWith('SyntaxError')) ||
    lines.find((l) => l.startsWith('TypeError')) ||
    lines.find((l) => l.startsWith('ReferenceError')) ||
    lines.find((l) => l.startsWith('Error:'));

  // Python error (last line of traceback)
  const pyHeader = lines.findLast?.((l) => /^[A-Za-z]+Error:/.test(l));

  const header = jsHeader || pyHeader || lines[0];

  // ---- Extract user frame ----
  // action.js:line[:col]
  const jsFrameMatch = message.match(/action\.js:(\d+)(?::\d+)?/);
  if (jsFrameMatch) {
    return [header.trim(), `    at (action.js:${jsFrameMatch[1]})`].join('\n');
  }

  // action.py:line
  const pyFrameMatch = message.match(/action\.py", line (\d+)/);
  if (pyFrameMatch) {
    return [header.trim(), `  File "action.py", line ${pyFrameMatch[1]}`].join(
      '\n',
    );
  }

  // ---- Fallback ----
  return header.trim();
}

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

function extractOutputFieldsFromReturn(event, showRawErrors) {
  if (event.kind !== 'Return' || !event.message || showRawErrors) {
    return null;
  }

  try {
    const parsed = JSON.parse(event.message);

    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.outputFields &&
      typeof parsed.outputFields === 'object'
    ) {
      return parsed.outputFields;
    }
  } catch {
    // not JSON, ignore
  }

  return null;
}

function ReturnSummaryLog({ count, onShowRaw, onScrollToTable }) {
  return (
    <div className='flex items-center justify-between gap-3 rounded-md border bg-emerald-500/10 border-emerald-500/30 px-3 py-2'>
      <div className='flex items-center gap-2 text-xs font-mono text-emerald-700'>
        <Terminal className='h-3.5 w-3.5' />
        Returned {count} output field{count !== 1 ? 's' : ''}
      </div>

      <div className='flex items-center gap-2'>
        <button
          onClick={onScrollToTable}
          className='border py-1 px-1.5 hover:bg-white/10 rounded text-xs hover:underline underline-offset-2 text-muted-foreground hover:text-foreground cursor-pointer'
        >
          View table
        </button>

        <button
          onClick={onShowRaw}
          className='border py-1 px-1.5 hover:bg-white/10 rounded text-xs hover:underline underline-offset-2 text-muted-foreground hover:text-foreground cursor-pointer'
        >
          Show raw
        </button>
      </div>
    </div>
  );
}

function durationTone(ms) {
  if (ms > 5000) return 'error';
  if (ms > 3000) return 'warning';
  return 'default';
}

function runtimeIcon(execution) {
  const lang = execution?.action_language;
  const path = execution?.action_filepath;

  if (lang === 'javascript' || path?.endsWith('.js')) {
    return <IoLogoJavascript className='h-4 w-4 text-yellow-600' />;
  }

  if (lang === 'python' || path?.endsWith('.py')) {
    return <IoLogoPython className='h-4 w-4 text-blue-400' />;
  }

  return <Terminal className='h-4 w-4 text-muted-foreground' />;
}

function resolveRuntime(actionLanguage, filepath) {
  if (actionLanguage === 'javascript') return 'Node.js';
  if (actionLanguage === 'python') return 'Python';

  if (filepath?.endsWith('.js')) return 'Node.js';
  if (filepath?.endsWith('.py')) return 'Python';

  return 'Unknown';
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
  const [showRawErrors, setShowRawErrors] = useState(false);

  const language = execution?.action_language;
  const timelineEvents = useMemo(
    () => normaliseExecutionEvents(events),
    [events],
  );

  const timeline = timelineEvents;

  const outputFromReturn = useMemo(() => {
    return timeline.find(
      (e) => e.kind === 'Return' && extractOutputFieldsFromReturn(e, false),
    );
  }, [timeline]);

  const { outputFields, hasOutput } = useMemo(() => {
    if (
      execution?.result?.outputFields &&
      Object.keys(execution.result.outputFields).length > 0
    ) {
      return {
        outputFields: execution.result.outputFields,
        hasOutput: true,
      };
    }

    if (!showRawErrors) {
      for (const e of timeline) {
        const extracted = extractOutputFieldsFromReturn(e, false);
        if (extracted && Object.keys(extracted).length > 0) {
          return {
            outputFields: extracted,
            hasOutput: true,
          };
        }
      }
    }

    return {
      outputFields: null,
      hasOutput: false,
    };
  }, [execution, timeline, showRawErrors]);

  const errorCount = useMemo(
    () => timelineEvents.filter((e) => e.isError).length,
    [timelineEvents],
  );

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
        className='flex w-[clamp(900px,55vw,1000px)] min-w-[900px] flex-col p-0'
      >
        {/* Header */}
        <SheetHeader className='border-b px-6 py-4 pr-12'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-0.5'>
              <SheetTitle className='text-sm font-semibold'>
                {execution?.action_name ?? 'Execution'}
              </SheetTitle>

              <SheetDescription className='flex items-center gap-2 font-mono text-xs'>
                {/* <span>{executionId}</span> */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(executionId);
                    toast.success('Execution ID copied');
                  }}
                  className='group flex items-center gap-2 rounded-md border border-white/0 hover:px-1 py-1 font-mono text-xs text-muted-foreground hover:bg-muted trnasition'
                >
                  <span className=''>{executionId}</span>
                  <Copy className='h-3 w-3 opacity-0 group-hover:opacity-100 transition' />
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
                    <>
                      <span title={createdLabel?.full}>
                        {createdLabel?.relative}
                      </span>
                      <span className='pl-1 font-normal italic'>
                        ({new Date(execution.updated_at).toLocaleString()})
                      </span>
                    </>
                  }
                />

                {execution.duration_ms != null && (
                  <Metric
                    icon={<Activity className='h-4 w-4' />}
                    label='Duration'
                    value={`${execution.duration_ms} ms`}
                    tone={durationTone(execution.duration_ms)}
                  />
                )}

                <Metric
                  icon={<User className='h-4 w-4' />}
                  label='Execution Run By'
                  value={execution.owner_name}
                />

                <Metric
                  icon={runtimeIcon(execution)}
                  label='Runtime'
                  value={resolveRuntime(
                    execution?.action_language,
                    execution?.action_filepath,
                  )}
                />
              </section>

              {/* Output */}
              {hasOutput && (
                <section id='execution-output' className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='flex items-center gap-2 text-sm font-medium'>
                      <Terminal className='h-4 w-4' />
                      Execution output
                      <Badge variant='secondary' className='text-[10px]'>
                        {Object.keys(outputFields).length} fields
                      </Badge>
                    </h3>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        navigator.clipboard.writeText(
                          JSON.stringify(outputFields, null, 2),
                        );
                        toast.success('Output copied to clipboard');
                      }}
                    >
                      <Copy />
                    </Button>
                  </div>

                  <div className='rounded-md border divide-y overflow-hidden'>
                    {Object.entries(outputFields).map(([key, value]) => (
                      <div
                        key={key}
                        className='grid grid-cols-3 gap-4 px-3 py-2 text-xs hover:bg-muted/30'
                      >
                        <div className='truncate font-mono text-muted-foreground'>
                          {key}
                        </div>

                        <div className='col-span-2 font-mono select-text'>
                          <pre className='whitespace-pre-wrap text-foreground'>
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
                    {errorCount > 0 && (
                      <Badge
                      // onClick={() => setShowOnlyErrors((v) => !v)}
                      // className='cursor-pointer'
                      >
                        {errorCount} Error{errorCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </h3>

                  {events.length === 0 ? (
                    <div className='text-muted-foreground'>
                      No events recorded
                    </div>
                  ) : (
                    <div className='relative'>
                      <div className='absolute left-[18px] top-0 bottom-0 w-px bg-border' />

                      {timeline.map((event) => (
                        <div
                          key={event.id}
                          className='relative flex gap-4 py-2 px-2'
                        >
                          <div className='mt-1 z-10 shrink-0'>
                            {eventIcon(event.kind)}
                          </div>

                          <div className='flex-1 space-y-2'>
                            <div className='flex items-center gap-2 text-xs font-mono text-muted-foreground'>
                              <span className='rounded border px-1.5 py-0.5 text-[10px] uppercase'>
                                {formatEventKind(event.kind)}
                              </span>
                              <span>
                                {event.time.toLocaleTimeString('en-GB', {
                                  hour12: false,
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  fractionalSecondDigits: 3,
                                })}
                              </span>
                            </div>

                            {(() => {
                              const extracted = extractOutputFieldsFromReturn(
                                event,
                                showRawErrors,
                              );

                              // SIMPLE RETURN LOG
                              if (extracted && !showRawErrors) {
                                return (
                                  <ReturnSummaryLog
                                    count={Object.keys(extracted).length}
                                    onShowRaw={() => setShowRawErrors(true)}
                                    onScrollToTable={() =>
                                      document
                                        .getElementById('execution-output')
                                        ?.scrollIntoView({
                                          behavior: 'smooth',
                                          block: 'start',
                                        })
                                    }
                                  />
                                );
                              }

                              // NORMAL / RAW LOG
                              if (event.message) {
                                return (
                                  <pre
                                    className={`rounded-md border px-3 py-1.5 font-mono text-xs whitespace-pre-wrap ${eventStyles(
                                      event.kind,
                                    )}`}
                                  >
                                    {showRawErrors
                                      ? event.message
                                      : formatExecutionError(event.message)}
                                  </pre>
                                );
                              }

                              return null;
                            })()}
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

        <ExecutionExportFooter
          execution={execution}
          events={events}
          showRawErrors={showRawErrors}
          setShowRawErrors={setShowRawErrors}
          errorCount={errorCount}
        />
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------
   Metric
------------------------------------- */

function Metric({ icon, label, value, colSpan, tone = 'default', onClick }) {
  const toneStyles = {
    default: 'border-border',
    success: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    error: 'border-red-500/30 bg-red-500/5',
  };

  return (
    <div
      onClick={onClick}
      className={`flex gap-3 rounded-md border p-3 transition ${
        toneStyles[tone]
      } ${colSpan ? 'col-span-2' : ''} ${
        onClick ? 'cursor-pointer hover:bg-muted/40' : ''
      }`}
    >
      <div className='text-muted-foreground'>{icon}</div>

      <div className='space-y-0.5'>
        <div className='text-xs text-muted-foreground'>{label}</div>
        <div className='font-medium tabular-nums'>{value}</div>
      </div>
    </div>
  );
}
