'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import { NavUser } from '@/components/nav-user'
import { ExecutionMiniCard } from '@/components/execution-mini-card'
import { useActionExecutions } from '@/lib/useActionExecutions'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const supabase = createSupabaseBrowserClient()

export function SidebarRight({ activeAction, ...props }) {
  const [user, setUser] = React.useState(null)
  const [onlyThisAction, setOnlyThisAction] =
    React.useState(false)

  const executions = useActionExecutions({
    limit: 17,
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

  if (!user) return null

  return (
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
      <SidebarContent className="flex-1 space-y-3 p-3 overflow-y-auto overflow-x-hidden min-w-0">
        <div className="text-xs font-medium text-muted-foreground">
          Recent executions
        </div>

        <div className="
  space-y-2
  max-h-full
  overflow-hidden
  [@media(max-height:700px)]:hidden
">
  {executions.length === 0 ? (
    <div className="text-xs text-muted-foreground">
      No executions yet
    </div>
  ) : (
    executions.map(exec => (
      <ExecutionMiniCard
        key={exec.id}
        execution={exec}
        isCurrentAction={
    activeAction && exec.action_id === activeAction.id
  }
      />
    ))
  )}
</div>


        {/* Toggle
        {activeAction && (
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={onlyThisAction}
              onChange={e =>
                setOnlyThisAction(e.target.checked)
              }
              className="accent-primary"
            />
            Show only executions for this action
          </label>
        )} */}
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer */}
      <SidebarFooter className="border-t px-3 py-2">
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
</SidebarFooter>

    </Sidebar>
  )
}
