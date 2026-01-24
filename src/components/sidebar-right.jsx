'use client'

import * as React from 'react'

import { NavUser } from '@/components/nav-user'
import { ExecutionMiniCard } from '@/components/execution-mini-card'
import { ExecutionSheet } from '@/components/execution-drawer'
import { useActionExecutions } from '@/lib/useActionExecutions'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'

import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const supabase = createSupabaseBrowserClient()

const STATUS_FILTERS = ['all', 'success', 'failed']

export function SidebarRight({ activeAction, ...props }) {
  /* -----------------------------
     State
  ----------------------------- */

  const [user, setUser] = React.useState(null)
  const [onlyThisAction, setOnlyThisAction] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [openExecution, setOpenExecution] = React.useState(null)

  /* -----------------------------
     Data
  ----------------------------- */

  const executions = useActionExecutions({
    limit: 35,
    actionId:
      onlyThisAction && activeAction
        ? activeAction.id
        : null,
  })

  /* -----------------------------
     Load current user
  ----------------------------- */

  React.useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted || error || !data?.user) return

      const u = data.user

      setUser({
        name:
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          'User',
        email: u.email,
        avatar:
          u.user_metadata?.avatar_url ||
          '/avatars/default.jpg',
      })
    })

    return () => {
      mounted = false
    }
  }, [])

  /* -----------------------------
     Derived data
  ----------------------------- */

  const filteredExecutions = React.useMemo(() => {
    if (statusFilter === 'all') return executions

    return executions.filter(exec => {
      if (statusFilter === 'executed') {
        return exec.status === 'success'
      }
      if (statusFilter === 'failed') {
        return exec.status === 'failed'
      }
      return true
    })
  }, [executions, statusFilter])

  /* -----------------------------
     Render
  ----------------------------- */

  return (
    <>
      {user && (
        <Sidebar
          collapsible="none"
          className="sticky top-0 hidden h-svh border-l lg:flex overflow-hidden"
          {...props}
        >
          {/* Header */}
          <SidebarHeader className="border-sidebar-border h-16 border-b">
            <NavUser user={user} />
          </SidebarHeader>

          {/* Content */}
          <ScrollArea className="flex-1 h-0">
            <SidebarContent className="flex-1 space-y-3 py-3 px-4 overflow-y-auto overflow-x-hidden min-w-0">
              <div className="
  sticky top-1 z-10
  bg-sidebar
  px-0 pb-2
  border-b
  text-xs font-medium
  text-muted-foreground
">
  <span className='pb-1'>Recent executions</span>
</div>


              <div
                className="
                  space-y-2
                  max-h-full
                  overflow-hidden
                  [@media(max-height:700px)]:hidden
                "
              >
                {filteredExecutions.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    No executions
                  </div>
                ) : (
                  filteredExecutions.map(exec => (
                    <ExecutionMiniCard
                      key={exec.id}
                      execution={exec}
                      isCurrentAction={
                        activeAction &&
                        exec.action_id === activeAction.id
                      }
                      onOpen={setOpenExecution}
                    />
                  ))
                )}
              </div>
            </SidebarContent>
          </ScrollArea>

          <SidebarSeparator />

          {/* Footer */}
          <SidebarFooter className="border-t px-3 py-2">
            {/* Scope toggle */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Execution scope</span>

              <button
                onClick={() => setOnlyThisAction(v => !v)}
                className="
                  rounded-md border px-2 py-1
                  text-xs font-medium
                  hover:bg-sidebar-accent
                "
              >
                {onlyThisAction ? 'This action' : 'All actions'}
              </button>
            </div>

            {/* Status filter */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Status
              </span>

              <div className="flex rounded-md border overflow-hidden">
                {STATUS_FILTERS.map(key => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`
                      px-2 py-1 text-xs font-medium transition-colors
                      ${
                        statusFilter === key
                          ? 'bg-sidebar-accent text-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/60'
                      }
                    `}
                  >
                    {key === 'all'
                      ? 'All'
                      : key === 'success'
                      ? 'Success'
                      : 'Failed'}
                  </button>
                ))}
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      )}

      {/* Execution drawer (mounted once) */}
      <ExecutionSheet
        executionId={openExecution?.id}
        open={!!openExecution}
        onOpenChange={open => {
          if (!open) setOpenExecution(null)
        }}
      />
    </>
  )
}
