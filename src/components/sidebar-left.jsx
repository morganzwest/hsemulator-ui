'use client'

import {
  Blocks,
  MessageCircleQuestion,
  Settings2,
  Plus,
} from 'lucide-react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { TeamSwitcher } from "@/components/team-switcher"
import { ActionListItem } from '@/components/action-list-item'
import { Button } from '@/components/ui/button'

const projects = [
  { id: 'proj-1', name: 'Marketing Automation' },
  { id: 'proj-2', name: 'CRM Sync' },
  { id: 'proj-3', name: 'Billing Pipelines' },
]

const data = {
  projects: [
    {
      name: "Demo Portal",
      logo: GalleryVerticalEnd,
      id: "123456789",
    },
    {
      name: "Portal B",
      logo: AudioWaveform,
      id: "123456789",
    },
    {
      name: "Sandbox Portal",
      logo: Command,
      id: "123456789",
    },
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
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="gap-3">
        <TeamSwitcher teams={data.projects} />

        {/* Actions header + create button */}
        <div className="flex items-center justify-between px-3">
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
      </SidebarHeader>

      <SidebarContent className="gap-0 divide-y">
        {actions.map((action) => (
          <ActionListItem key={action.id} action={action} />
        ))}

        {/* Footer */}
        <div className="mt-auto px-3 py-2">
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
    <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{label}</span>
    </button>
  )
}
