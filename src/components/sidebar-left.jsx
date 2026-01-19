'use client'

import { useState } from 'react'
import {
  Blocks,
  MessageCircleQuestion,
  Settings2,
  Plus,
  Search,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { TeamSwitcher } from '@/components/team-switcher'
import { ActionListItem } from '@/components/action-list-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  AudioWaveform,
  GalleryVerticalEnd,
  Command,
} from 'lucide-react'

const data = {
  projects: [
    { name: 'Demo Portal', logo: GalleryVerticalEnd, id: '1' },
    { name: 'Portal B', logo: AudioWaveform, id: '2' },
    { name: 'Sandbox Portal', logo: Command, id: '3' },
  ],
}

const actions = [
  {
    id: 'action-1',
    title: 'Create Ticket',
    description: 'Creates a HubSpot ticket when a form is submitted',
    updatedAt: '2 hours ago',
    type: 'JavaScript',
  },
  {
    id: 'action-2',
    title: 'Enrich Contact',
    description: 'Adds enrichment data to contacts from Clearbit',
    updatedAt: 'Yesterday',
    type: 'Python',
  },
  {
    id: 'action-3',
    title: 'Sync Deal',
    description: 'Synchronises deal stages across pipelines',
    updatedAt: '3 days ago',
    type: 'JavaScript',
  },
]

export function SidebarLeft(props) {
  const [query, setQuery] = useState('')

  const filteredActions = actions.filter((action) =>
    action.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Sidebar className="border-r-0" {...props}>
      {/* Header */}
      <SidebarHeader className="gap-4">
        <TeamSwitcher className="w-full" teams={data.projects} />

        {/* Actions toolbar */}
        <div className="flex flex-col gap-2 px-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Actions
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Create new action"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="flex flex-col">
        <div className="flex-1 overflow-auto px-1">
          {filteredActions.length > 0 ? (
            filteredActions.map((action) => (
              <ActionListItem key={action.id} action={action} />
            ))
          ) : (
            <div className="px-4 py-6 text-xs text-muted-foreground">
              No actions found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2">
          <div className="flex flex-col gap-1">
            <SidebarFooterItem icon={Settings2} label="Settings" />
            <SidebarFooterItem icon={Blocks} label="Templates" />
            <SidebarFooterItem
              icon={MessageCircleQuestion}
              label="Help"
            />
          </div>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

/* Footer item helper */
function SidebarFooterItem({ icon: Icon, label }) {
  return (
    <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}
