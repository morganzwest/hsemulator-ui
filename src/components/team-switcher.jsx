"use client"

import * as React from "react"
import { ChevronDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "./ui/badge"

import {
  getActivePortal,
  setActivePortal,
} from "@/lib/portal-state"

export function TeamSwitcher({ teams, Icon }) {
  const [activeTeam, setActiveTeam] = React.useState(null)

  /* -------------------------------------
     Sync from portal-state
  ------------------------------------- */

  React.useEffect(() => {
    try {
      const portal = getActivePortal()
      setActiveTeam(portal)
    } catch {
      // Portal state not ready yet
    }
  }, [teams])

  if (!activeTeam) return null

  /* -------------------------------------
     Render
  ------------------------------------- */

  return (
    <SidebarMenu className="w-full">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full justify-between px-1.5">
              <div className="flex gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-5 items-center justify-center rounded-md">
                  {/* <activeTeam.logo className="size-3" /> */}
                </div>
                <span className="truncate font-medium">{activeTeam.name}</span>
              </div>

              <ChevronDown className="opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Portals and Workspaces
            </DropdownMenuLabel>

            {teams.map((team) => (
              <DropdownMenuItem
                key={team.uuid}
                className="gap-2 p-2"
                onClick={() => {
                  console.debug('[TeamSwitcher] switching to →', team.uuid)

                  setActivePortal(team.uuid)
                  setActiveTeam(team)

                  window.dispatchEvent(
                    new CustomEvent('portal:changed', { detail: team })
                  )
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-xs border">
                  {/* <team.logo className="size-4 shrink-0" /> */}
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add Portal
                <Badge className="ml-2" variant="outline">
                  Coming Soon
                </Badge>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
