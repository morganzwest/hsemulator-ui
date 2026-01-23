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
} from 'lucide-react';

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
import { formatDistanceToNowStrict } from 'date-fns';
import { CreateActionDialog } from '@/components/create-action-dialog';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { TemplatesSheet } from '~/components/template-sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

/* -------------------------------------
   Demo data
------------------------------------- */

const data = {
  projects: [
    { name: 'Demo Portal', logo: GalleryVerticalEnd, id: '1' },
    { name: 'Portal B', logo: AudioWaveform, id: '2' },
    { name: 'Sandbox Portal', logo: Command, id: '3' },
  ],
};

/* -------------------------------------
   Sidebar
------------------------------------- */

export function SidebarLeft({ onSelectAction, onActionsLoaded, ...props }) {
  const supabase = createSupabaseBrowserClient();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null);
  const [query, setQuery] = useState('');
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  /* -----------------------------
     Load actions (reusable)
  ----------------------------- */

  const loadActions = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('actions')
      .select('id, owner_id, name, description, language, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[SidebarLeft] Failed to load actions:', error);
    } else {
      setActions(data ?? []);
      onActionsLoaded?.(data ?? []);
    }

    setLoading(false);
  }, [supabase, onActionsLoaded]);

  /* -----------------------------
     Initial load
  ----------------------------- */

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  /* -----------------------------
     Global resync listener
  ----------------------------- */

  useEffect(() => {
    function handleResync() {
      loadActions();
    }

    window.addEventListener('actions:resync', handleResync);
    return () => {
      window.removeEventListener('actions:resync', handleResync);
    };
  }, [loadActions]);

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
      <SidebarHeader className='gap-4'>
        <TeamSwitcher className='w-full' teams={data.projects} />

        <div className='flex flex-col gap-2 px-3'>
          <div className='flex items-center justify-between'>
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

          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search actions…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='h-9 pl-8 text-sm'
            />
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="flex flex-col h-full">
  {/* ---------------------------------
     Actions list (ONLY scrollable)
  --------------------------------- */}
  <div className="flex-1 min-h-0">
    <ScrollArea className="h-full px-1">
      <div className="space-y-1">
        {loading ? (
          <ActionListSkeleton />
        ) : filteredActions.length > 0 ? (
          filteredActions.map((action) => (
            <ActionListItem
              key={action.id}
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
              active={action.id === activeActionId}
              onClick={() => {
                setActiveActionId(action.id)
                onSelectAction?.(action)
              }}
            />
          ))
        ) : (
          <div className="px-4 py-6 text-xs text-muted-foreground">
            No actions found
          </div>
        )}
      </div>
    </ScrollArea>
  </div>

  {/* ---------------------------------
     Footer (NON-scrollable)
  --------------------------------- */}
  <div className="border-t px-3 py-2">
    <div className="flex flex-col gap-1">
      <SidebarFooterItem
        icon={Blocks}
        label="Templates"
        onClick={() => setTemplatesOpen(true)}
      />
      <SidebarFooterItem
        icon={Settings2}
        label="Settings"
      />
      <SidebarFooterItem
        icon={MessageCircleQuestion}
        label="Help"
      />
    </div>
  </div>

  {/* ---------------------------------
     Modals / Sheets (portals)
  --------------------------------- */}
  <CreateActionDialog
    open={createOpen}
    onOpenChange={setCreateOpen}
    onCreated={() => {
      window.dispatchEvent(new Event('actions:resync'))
    }}
  />

  <TemplatesSheet
    open={templatesOpen}
    onOpenChange={setTemplatesOpen}
    onSelectTemplate={(template) => {
      console.log('Selected template:', template)
    }}
  />
</SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

/* -------------------------------------
   Footer item helper
------------------------------------- */

function ActionListSkeleton() {
  return (
    <div className="space-y-2 px-2 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 rounded-md px-2 py-2"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}


function SidebarFooterItem({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className='flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground'
    >
      <Icon className='h-4 w-4' />
      <span>{label}</span>
    </button>
  );
}
