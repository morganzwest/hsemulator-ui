'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import { Calendars } from '@/components/calendars'
import { DatePicker } from '@/components/date-picker'
import { NavUser } from '@/components/nav-user'
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

export function SidebarRight(props) {
  const [user, setUser] = React.useState(null)

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

  if (!user) return null // or a skeleton/loading state

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <NavUser user={user} />
      </SidebarHeader>

      <SidebarContent>
        <DatePicker />
        <SidebarSeparator className="mx-0" />
        <Calendars
          calendars={[
            {
              name: 'Options',
              items: ['Snapshots', 'Assertions', 'Other'],
            },
          ]}
        />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
