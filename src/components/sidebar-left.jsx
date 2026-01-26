'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Blocks,
  MessageCircleQuestion,
  Settings2,
  Plus,
  Search,
  AudioWaveform,
  GalleryVerticalEnd,
  Command,
  Terminal,
  Activity,
} from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Badge } from './ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { TeamSwitcher } from '@/components/team-switcher';
import { ActionListItem } from '@/components/action-list-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getActivePortalId } from '@/lib/portal-state'
import { CreateActionDialog } from '@/components/create-action-dialog';
import { TemplatesSheet } from '~/components/template-sheet';
import { SettingsSheet } from '@/components/settings/settings-sheet';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { cn } from '@/lib/utils';
import {
  initPortalState,
} from '@/lib/portal-state'
import { useSearchParams } from 'next/navigation'

/* -------------------------------------
   Sidebar
------------------------------------- */

function EmptyMuted({ onCreate, onImport }) {
  return (
    <Empty className='h-full'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Terminal />
        </EmptyMedia>

        <EmptyTitle>No Actions</EmptyTitle>

        <EmptyDescription className='text-pretty'>
          You have no actions here.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className='gap-2'>
        <Button onClick={onCreate} title='Create new action'>
          <Plus className='h-4 w-4' />
          Create an action
        </Button>

        <Button variant='outline' onClick={onImport}>
          Import Template
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function SidebarLeft({ onSelectAction, onActionsLoaded, ...props }) {
  const supabase = createSupabaseBrowserClient();

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
const [portals, setPortals] = useState([])
const [activePortal, setActivePortalState] = useState(null)
const [portalsLoaded, setPortalsLoaded] = useState(false)

  const [activeActionId, setActiveActionId] = useState(null);
  const [query, setQuery] = useState('');
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
const searchParams = useSearchParams()
const actionIdFromUrl = searchParams.get('actionId')

  /* -----------------------------
     Load actions
  ----------------------------- */
useEffect(() => {
  if (!actionIdFromUrl) return
  if (!actions.length) return

  const match = actions.find(a => a.id === actionIdFromUrl)
  if (!match) return

  setActiveActionId(match.id)
  onSelectAction?.(match)
}, [actionIdFromUrl, actions, onSelectAction])

  useEffect(() => {
  async function loadPortals() {
    let { data, error } = await supabase
  .from('portals')
  .select(`
    uuid,
    name,
    icon,
    color,
    created_at,
    created_by,
    profiles:created_by (
      plan
    )
  `)
  .order('created_at', { ascending: true });

    data =
  data?.map((portal) => ({
    ...portal,
    plan: portal.profiles?.plan === 'pro' ? 'Professional' : null,
  })) ?? [];


    if (error) {
      console.error('[SidebarLeft] Failed to load portals:', error)
      return
    }

    const activeUuid = initPortalState(data)
    const active = data.find(p => p.uuid === activeUuid)

    setPortals(data)
    setActivePortalState(active)
    setPortalsLoaded(true)
  }

  loadPortals()
}, [supabase])



  const loadActions = useCallback(async () => {
  if (!portalsLoaded) return

  setLoading(true)

  let portalId
  try {
    portalId = getActivePortalId()
  } catch {
    setLoading(false)
    return
  }

  const { data, error } = await supabase
    .from('actions')
    .select('id, owner_id, portal_id, name, description, language, updated_at')
    .eq('portal_id', portalId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[SidebarLeft] Failed to load actions:', error)
  } else {
    setActions(data ?? [])
    onActionsLoaded?.(data ?? [])
  }

  setLoading(false)
}, [supabase, onActionsLoaded, portalsLoaded])


  /* -----------------------------
     Initial load
  ----------------------------- */

  useEffect(() => {
  if (!portalsLoaded) return
  loadActions()
}, [portalsLoaded, loadActions])

  /* -----------------------------
     Global resync listener
  ----------------------------- */

useEffect(() => {
  function handleChangeAction() {
    setActiveActionId(null)
  }

  function handleEditCurrentAction() {
    if (!activeActionId) return

    window.dispatchEvent(
      new CustomEvent('action:edit', {
        detail: { actionId: activeActionId },
      })
    )
  }

  window.addEventListener('action:change', handleChangeAction)
  window.addEventListener('action:edit-current', handleEditCurrentAction)

  return () => {
    window.removeEventListener('action:change', handleChangeAction)
    window.removeEventListener('action:edit-current', handleEditCurrentAction)
  }
}, [actions, activeActionId, onSelectAction])



  useEffect(() => {
    function handleResync() {
      loadActions();
    }

    window.addEventListener('actions:resync', handleResync);
    return () => window.removeEventListener('actions:resync', handleResync);
  }, [loadActions]);


  useEffect(() => {
  function handlePortalChange() {
    loadActions()
  }

  window.addEventListener('portal:changed', handlePortalChange)
  return () =>
    window.removeEventListener('portal:changed', handlePortalChange)
}, [loadActions])


  /* -----------------------------
     Filter
  ----------------------------- */

  const filteredActions = actions.filter((action) =>
    action.name.toLowerCase().includes(query.toLowerCase()),
  );

  /* -----------------------------
     Render
  ----------------------------- */

  return (
    <Sidebar className='border-r-0' {...props}>
      {/* Header */}
      <SidebarHeader className='gap-3 pb-2'>
        {portalsLoaded && activePortal ? (
  <TeamSwitcher
    teams={portals}
    Icon={AudioWaveform}
  />
) : (
  <Skeleton className="h-9 w-full rounded-md" />
)}



        <div className='flex flex-col gap-2 px-1.5 pt-1'>
          <div className='flex items-center justify-between border-b pb-1'>
            <span className='text-xs font-medium text-muted-foreground'>
              Actions
            </span>

            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              title='Create new action'
              onClick={() => setCreateOpen(true)}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>

          <div className="relative">
  {/* Search icon */}
  <Search
    className="pointer-events-none absolute left-3 inset-y-0 my-auto h-4 w-4 text-muted-foreground"
  />

  <Input
    id="action-search"
    placeholder="Search actions…"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="
      h-9 pl-9 pr-9 text-sm
      bg-background
      focus-visible:ring-2 focus-visible:ring-ring
    "
  />

  {/* Clear button */}
  {query && (
    <button
      type="button"
      onClick={() => setQuery('')}
      aria-label="Clear search"
      className="
        absolute right-2 inset-y-0 my-auto
        inline-flex h-6 w-6 items-center justify-center
        rounded-md text-muted-foreground
        transition-colors
        hover:bg-accent hover:text-foreground
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
      "
    >
      <span className="text-base leading-none">×</span>
    </button>
  )}
</div>

        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className='flex h-full flex-col'>
        {/* Scrollable actions */}
        <div className='flex-1 min-h-0'>
          <ScrollArea className='h-full pr-2 px-1'>
            <div className='space-y-1 px-2'>
              {loading ? (
                <ActionListSkeleton />
              ) : filteredActions.length > 0 ? (
                filteredActions.map((action) => {
                  const active = action.id === activeActionId;

                  return (
                    <div key={action.id} className='relative'>
                      {active && (
                        <span className='absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-primary' />
                      )}

                      <ActionListItem
                        action={{
                          id: action.id,
                          owner_id: action.owner_id,
                          title: action.name,
                          description: action.description,
                          updatedAt: formatDistanceToNowStrict(
                            new Date(action.updated_at),
                            { addSuffix: true },
                          ),
                          type:
                            action.language === 'javascript'
                              ? 'JavaScript'
                              : 'Python',
                        }}
                        active={active}
                        className={cn(
                          'rounded-md px-2 py-2 transition',
                          active
                            ? 'bg-muted font-medium text-foreground'
                            : 'hover:bg-muted/50',
                        )}
                        onClick={() => {
                          setActiveActionId(action.id);
                          onSelectAction?.(action);
                        }}
                      />
                    </div>
                  );
                })
              ) : (
                <EmptyMuted
                  onCreate={() => setCreateOpen(true)}
                  onImport={() => setTemplatesOpen(true)}
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className='border-t bg-muted/30 px-3 py-2'>
          <div className='flex flex-col gap-1'>
            <SidebarFooterItem icon={Activity} label='Monitoring' badge="Coming Soon" />

            <SidebarFooterItem
              icon={Blocks}
              label='Templates'
              onClick={() => setTemplatesOpen(true)}
            />

            <SettingsSheet>
              <SidebarFooterItem icon={Settings2} label='Settings' emphasis />
            </SettingsSheet>

            <SidebarFooterItem icon={MessageCircleQuestion} label='Help' />
          </div>
        </div>

        {/* Modals */}
        <CreateActionDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={() => window.dispatchEvent(new Event('actions:resync'))}
        />

        <TemplatesSheet
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          onSelectTemplate={(template) =>
            console.log('Selected template:', template)
          }
        />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

/* -------------------------------------
   Skeleton
------------------------------------- */

function ActionListSkeleton() {
  return (
    <div className='space-y-2 px-2 py-2'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='flex flex-col gap-1 rounded-md px-2 py-2'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------
   Footer item
------------------------------------- */

function SidebarFooterItem({
  icon: Icon,
  label,
  onClick,
  emphasis,
  badge, // e.g. "Coming Soon" or undefined
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-xs text-muted-foreground transition',
        'hover:bg-muted hover:text-foreground',
        emphasis && 'font-medium',
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>

      {badge && (
        <Badge className="ml-auto text-muted-foreground" variant="outline">
          {badge}
        </Badge>
      )}
    </button>
  )
}