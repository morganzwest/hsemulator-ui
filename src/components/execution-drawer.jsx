'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useExecutionDetails } from '@/lib/use-execution-details'

function kindStyles(kind) {
  if (kind === 'Stdout')
    return 'text-foreground'
  if (kind === 'Stderr')
    return 'text-red-500'
  if (kind === 'ExecutionCreated')
    return 'text-muted-foreground'
  return 'text-muted-foreground'
}

export function ExecutionDrawer({
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="font-mono">
            Execution {executionId?.slice(0, 12)}
          </DrawerTitle>

          {execution && (
            <DrawerDescription>
              {execution.action_name}
            </DrawerDescription>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 text-sm">
          {loading && (
            <div className="text-muted-foreground">
              Loading execution…
            </div>
          )}

          {error && (
            <div className="text-red-500">
              Failed to load execution
            </div>
          )}

          {execution && (
            <div className="space-y-6">
              {/* Metadata */}
              <section className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge>{execution.status}</Badge>
                  {execution.ok && <Badge>OK</Badge>}
                  {execution.snapshots_ok === false && (
                    <Badge variant="destructive">
                      Snapshots failed
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground">
                      Created
                    </div>
                    <div>
                      {new Date(
                        execution.created_at
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">
                      Updated
                    </div>
                    <div>
                      {new Date(
                        execution.updated_at
                      ).toLocaleString()}
                    </div>
                  </div>

                  {execution.duration_ms != null && (
                    <div>
                      <div className="text-muted-foreground">
                        Duration
                      </div>
                      <div>
                        {execution.duration_ms} ms
                      </div>
                    </div>
                  )}

                  {execution.max_memory_kb != null && (
                    <div>
                      <div className="text-muted-foreground">
                        Max memory
                      </div>
                      <div>
                        {execution.max_memory_kb} KB
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-muted-foreground">
                      Owner
                    </div>
                    <div>{execution.owner_name}</div>
                  </div>
                </div>

                {execution.action_description && (
                  <>
                    <Separator />
                    <p className="text-muted-foreground">
                      {execution.action_description}
                    </p>
                  </>
                )}
              </section>

              <Separator />

              {/* Events / Logs */}
              <section className="space-y-2">
                <h3 className="font-medium">
                  Execution events
                </h3>

                {events.length === 0 ? (
                  <div className="text-muted-foreground">
                    No events recorded
                  </div>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {events.map(ev => (
                      <div
                        key={ev.id}
                        className={kindStyles(ev.kind)}
                      >
                        <span className="mr-2 text-muted-foreground">
                          [
                          {new Date(
                            ev.event_time
                          ).toLocaleTimeString()}
                          ]
                        </span>
                        {ev.message ?? ev.kind}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
