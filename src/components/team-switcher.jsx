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
import { isAbleToAddPortal, getAccountLimits } from '@/lib/account-limits';
import { CreatePortalSheet } from './createPortalSheet';
import { LimitReachedDialog } from './limit-reached-dialog';
import { formatLimitNumber } from '@/lib/utils/number-formatting';

export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(null);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [showLimitDialog, setShowLimitDialog] = React.useState(false);
  const [checkingLimits, setCheckingLimits] = React.useState(false);
  const [limitInfo, setLimitInfo] = React.useState({ current: 0, max: 0 });

  React.useEffect(() => {
    try {
      setActiveTeam(getActivePortal());
    } catch {}
  }, [teams]);

  const handleAddPortalClick = async () => {
    setCheckingLimits(true);

    try {
      const canCreate = await isAbleToAddPortal();

      if (canCreate) {
        setOpenCreate(true);
      } else {
        // Get account limits to show current usage
        try {
          const limits = await getAccountLimits();
          const maxPortals = formatLimitNumber(limits.max_portals);
          setLimitInfo({
            current: limits.actual_portals || 0,
            max: maxPortals.value,
            plan: limits.plan || 'Free',
          });
          setShowLimitDialog(true);
        } catch (limitsError) {
          console.error(
            '[TeamSwitcher] Error getting account limits:',
            limitsError,
          );
          // Set default values on error
          setLimitInfo({ current: 0, max: 1, plan: 'Free' });
          setShowLimitDialog(true);
        }
      }
    } catch (error) {
      console.error('[TeamSwitcher] Error checking portal limits:', error);
      // Set default values on error
      setLimitInfo({ current: 0, max: 1, plan: 'Free' });
      setShowLimitDialog(true);
    } finally {
      setCheckingLimits(false);
    }
  };

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
              onClick={handleAddPortalClick}
              disabled={checkingLimits}
              className='flex items-center gap-3'
            >
              <div className='grid size-8 place-items-center rounded-md border'>
                {checkingLimits ? (
                  <div className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                ) : (
                  <Plus className='size-4' />
                )}
              </div>

              <span className='text-sm'>
                {checkingLimits ? 'Checking...' : 'Add portal'}
              </span>
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

      <LimitReachedDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        type='portal'
        current={limitInfo.current}
        max={limitInfo.max}
        plan={limitInfo.plan}
      />
    </SidebarMenu>
  );
}
