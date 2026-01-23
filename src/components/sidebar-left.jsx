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
} from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

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
import { IconBell } from '@tabler/icons-react';
import { RefreshCcwIcon } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { cn } from '@/lib/utils';

/* -------------------------------------
   Demo data
------------------------------------- */

const data = {
  projects: [
    { name: 'Personal Portal', logo: AudioWaveform, id: '1' },
    { name: 'Demo Portal', logo: GalleryVerticalEnd, id: '2' },
    { name: 'Client Portal', logo: Command, id: '3' },
  ],
};

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
          You have no actions yet.
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

  const [activeActionId, setActiveActionId] = useState(null);
  const [query, setQuery] = useState('');
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -----------------------------
     Load actions
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
    return () => window.removeEventListener('actions:resync', handleResync);
  }, [loadActions]);

  /* -----------------------------
     Keyboard shortcuts
  ----------------------------- */

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('action-search')?.focus();
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setCreateOpen(true);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
        <TeamSwitcher className='w-full' teams={data.projects} />

        <div className='flex flex-col gap-2 px-3 pt-1'>
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
              id='action-search'
              placeholder='Search actions…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='h-9 pl-8 pr-7 text-sm focus-visible:ring-2'
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground'
              >
                ×
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
            <div className='space-y-1'>
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
          portalId='1234567'
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

function SidebarFooterItem({ icon: Icon, label, onClick, emphasis }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition',
        'hover:bg-muted hover:text-foreground',
        emphasis && 'font-medium',
      )}
    >
      <Icon className='h-4 w-4' />
      <span>{label}</span>
    </button>
  );
}
