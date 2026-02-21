'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  MessageCircleQuestion,
  Settings2,
  ActivityIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getCurrentPlan } from '@/lib/account-limits';
import { getActiveAccountId } from '@/lib/account-state';
import { AccountSwitcher } from '@/components/account-switcher';
import { Activity } from 'react';
import * as React from 'react';

function handleOpenSettings() {
  window.dispatchEvent(new Event('settings:open'));
}
function handleUpgrade() {
  window.dispatchEvent(new Event('upgrade:open'));
}

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const supabase = createSupabaseBrowserClient();
  const [currentPlan, setCurrentPlan] = React.useState('pilot');
  const [loadingPlan, setLoadingPlan] = React.useState(true);
  const [accountReady, setAccountReady] = React.useState(false);

  // Check if account state is ready
  React.useEffect(() => {
    try {
      getActiveAccountId();
      setAccountReady(true);
    } catch (error) {
      console.warn(
        '[NavUser] Account state not yet initialized:',
        error.message,
      );
      setAccountReady(false);
    }
  }, []);

  React.useEffect(() => {
    async function loadPlan() {
      if (!accountReady) {
        console.warn(
          '[NavUser] Account state not ready, skipping plan loading',
        );
        return;
      }

      try {
        const plan = await getCurrentPlan();
        setCurrentPlan(plan);
      } catch (error) {
        console.error('[NavUser] Error loading plan:', error);
        setCurrentPlan('pilot'); // fallback
      } finally {
        setLoadingPlan(false);
      }
    }

    loadPlan();
  }, [accountReady]);

  const getPlanDisplayInfo = (plan) => {
    switch (plan) {
      case 'pilot':
        return {
          label: 'Pilot Plan',
          badge: 'PILOT',
          icon: Sparkles,
          bgGradient:
            'bg-gradient-to-br from-black/60 via-indigo-950/40 to-purple-950/30',
          borderColor: 'border-indigo-500/25',
          textColor: 'text-indigo-200',
          iconColor: 'text-indigo-300',
          badgeColor: 'text-indigo-300/80',
          hoverRing: 'hover:ring-indigo-500/40',
          hoverShadow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]',
        };
      case 'professional':
        return {
          label: 'Professional Plan',
          badge: 'PRO',
          icon: Sparkles,
          bgGradient:
            'bg-gradient-to-br from-black/60 via-emerald-950/40 to-cyan-950/30',
          borderColor: 'border-emerald-500/25',
          textColor: 'text-emerald-200',
          iconColor: 'text-emerald-300',
          badgeColor: 'text-emerald-300/80',
          hoverRing: 'hover:ring-emerald-500/40',
          hoverShadow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
        };
      case 'enterprise':
        return {
          label: 'Enterprise Plan',
          badge: 'ENTERPRISE',
          icon: Sparkles,
          bgGradient:
            'bg-gradient-to-br from-black/60 via-amber-950/40 to-orange-950/30',
          borderColor: 'border-amber-500/25',
          textColor: 'text-amber-200',
          iconColor: 'text-amber-300',
          badgeColor: 'text-amber-300/80',
          hoverRing: 'hover:ring-amber-500/40',
          hoverShadow: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.25)]',
        };
      default:
        return getPlanDisplayInfo('pilot');
    }
  };

  async function handleLogout() {
    await supabase.auth.signOut();

    // redirect to login page
    window.location.href = '/login';
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='rounded-lg'>
                  {user.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>

              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user.name}</span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>

              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-70 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='start'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className='rounded-lg'>
                    {user.name?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{user.name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className={`relative overflow-hidden ${getPlanDisplayInfo(currentPlan).bgGradient} ${getPlanDisplayInfo(currentPlan).textColor} border ${getPlanDisplayInfo(currentPlan).borderColor} backdrop-blur-xl transition-all duration-300 hover:scale-[1.015] ${getPlanDisplayInfo(currentPlan).hoverRing} ${getPlanDisplayInfo(currentPlan).hoverShadow}`}
              >
                {/* Glow ring layer */}
                <span
                  className={`absolute inset-0 pointer-events-none rring-1 ring-current opacity-40`}
                />

                {/* Shine sweep */}
                <span className='absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500' />

                <Sparkles
                  className={`${getPlanDisplayInfo(currentPlan).iconColor} drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]`}
                />

                <span className='tracking-wide font-medium'>
                  {getPlanDisplayInfo(currentPlan).label}
                </span>

                <span
                  className={`ml-auto text-[10px] uppercase tracking-widest ${getPlanDisplayInfo(currentPlan).badgeColor}`}
                >
                  {getPlanDisplayInfo(currentPlan).badge}
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {/* <DropdownMenuItem>
                <AccountSwitcher />
              </DropdownMenuItem> */}

              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>

              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleOpenSettings}>
                <Settings2 />
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  // Open status page in new tab
                  window.open('https://novocode.betteruptime.com/', '_blank');
                }}
              >
                <ActivityIcon />
                Status
              </DropdownMenuItem>

              <DropdownMenuItem>
                <MessageCircleQuestion />
                Help
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
