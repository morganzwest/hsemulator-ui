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

function handleOpenSettings() {
  window.dispatchEvent(new Event('settings:open'));
}
function handleUpgrade() {
  window.dispatchEvent(new Event('upgrade:open'));
}

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const supabase = createSupabaseBrowserClient();

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
              {/* <DropdownMenuItem
                onClick={handleUpgrade}
                className='
    relative overflow-hidden
    bg-gradient-to-br from-black/60 via-indigo-950/40 to-purple-950/30
    text-indigo-200
    border border-indigo-500/25
    backdrop-blur-xl
    transition-all duration-300
    hover:scale-[1.015]
    hover:ring-1 hover:ring-indigo-500/40
    hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]
  '
              >
                <span className='absolute inset-0 pointer-events-none rounded-md ring-1 ring-indigo-500/40 opacity-40' />

                <span
                  className='
      absolute inset-0 pointer-events-none
      bg-gradient-to-r from-transparent via-white/10 to-transparent
      opacity-0 hover:opacity-100
      transition-opacity duration-500
    '
                />

                <Sparkles className='text-indigo-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]' />

                <span className='tracking-wide font-medium'>
                  Upgrade your Plan
                </span>

                <span className='ml-auto text-[10px] uppercase tracking-widest text-indigo-300/80'>
                  FOUNDRY
                </span>
              </DropdownMenuItem> */}
              <DropdownMenuItem
                className='
    relative overflow-hidden
    bg-gradient-to-br from-black/60 via-indigo-950/40 to-purple-950/30
    text-indigo-200
    border border-indigo-500/25
    backdrop-blur-xl
    transition-all duration-300
    hover:scale-[1.015]
    hover:ring-1 hover:ring-indigo-500/40
    hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]
  '
              >
                {/* Glow ring layer */}
                <span className='absolute inset-0 pointer-events-none rounded-md ring-1 ring-indigo-500/40 opacity-40' />

                {/* Shine sweep */}
                <span
                  className='
      absolute inset-0 pointer-events-none
      bg-gradient-to-r from-transparent via-white/10 to-transparent
      opacity-0 hover:opacity-100
      transition-opacity duration-500
    '
                />

                <Sparkles className='text-indigo-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]' />

                <span className='tracking-wide font-medium'>Pilot Plan</span>

                <span className='ml-auto text-[10px] uppercase tracking-widest text-indigo-300/80'>
                  PILOT
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
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
