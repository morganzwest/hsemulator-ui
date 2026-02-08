'use client';

import * as React from 'react';
import { ChevronsUpDown, Plus, Check } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { getActivePortal, setActivePortal } from '@/lib/portal-state';
import { resolvePortalIcon, resolvePortalColor } from '@/lib/portal-icons';
import { CreatePortalSheet } from './createPortalSheet';

export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(null);
  const [openCreate, setOpenCreate] = React.useState(false);

  React.useEffect(() => {
    try {
      setActiveTeam(getActivePortal());
    } catch {}
  }, [teams]);

  if (!activeTeam) return null;

  const ActiveIcon = resolvePortalIcon(activeTeam.icon);
  const color = resolvePortalColor(activeTeam.color);
  const plan = activeTeam.plan || 'Free';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              id='portal-switcher'
              size='lg'
              className={cn(
                'relative flex items-center gap-3  ',
                'hover:bg-sidebar-accent',
                'data-[state=open]:ring-2',
                color.glow,
              )}
            >
              <div
                className={cn(
                  'grid size-9 place-items-center rounded-md border',
                  color.container,
                )}
              >
                <ActiveIcon className='size-4.5' />
              </div>

              <div className='flex-1 overflow-hidden'>
                <div className='truncate text-sm font-semibold'>
                  {activeTeam.name}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {plan} workspace
                </div>
              </div>

              <ChevronsUpDown className='size-4 opacity-70' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={6}
            className='w-72 rounded-xl'
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Your portals
            </DropdownMenuLabel>

            <div className='space-y-1'>
              {teams.map((team) => {
                const Icon = resolvePortalIcon(team.icon);
                const c = resolvePortalColor(team.color);
                const isActive = team.uuid === activeTeam.uuid;

                return (
                  <DropdownMenuItem
                    key={team.uuid}
                    onClick={() => {
                      setActivePortal(team.uuid);
                      setActiveTeam(team);
                      window.dispatchEvent(
                        new CustomEvent('portal:changed', { detail: team }),
                      );
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-2 py-2',
                      isActive && 'bg-muted',
                    )}
                  >
                    <div
                      className={cn(
                        'grid size-8 place-items-center rounded-md border',
                        c.container,
                      )}
                    >
                      <Icon className='size-4 text-white/80' />
                    </div>

                    <div className='flex-1 overflow-hidden'>
                      <div className='truncate text-sm font-medium'>
                        {team.name}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {team.plan || 'Free'}
                      </div>
                    </div>

                    {isActive && <Check className='size-4 mr-2 text-primary' />}
                  </DropdownMenuItem>
                );
              })}
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setOpenCreate(true)}
              className='flex items-center gap-3'
            >
              <div className='grid size-8 place-items-center rounded-md border'>
                <Plus className='size-4' />
              </div>

              <span className='text-sm'>Add portal</span>
            </DropdownMenuItem>

            {/* <DropdownMenuItem
              disabled
              className="flex items-center gap-3 opacity-70"
            >
              <div className="grid size-8 place-items-center rounded-md border">
                <Plus className="size-4" />
              </div>

              <span className="flex items-center gap-2 text-sm">
                Add portal
                <Badge variant="outline">Coming soon</Badge>
              </span>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <CreatePortalSheet open={openCreate} onOpenChange={setOpenCreate} />
    </SidebarMenu>
  );
}
