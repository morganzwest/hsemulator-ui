'use client';

import * as React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, X } from 'lucide-react';
import { EditorSettingsPage } from '@/components/settings/pages/editor-settings';

import { Code2, Key } from 'lucide-react';

import { PortalSecretsSettingsPage } from './pages/secret-settings';
import { getActivePortalId } from '@/lib/portal-state';
import { IoPeople } from 'react-icons/io5';
import { TeamMembersSettingsPage } from './pages/team-settings';

/* -------------------------------------
   Tabs
------------------------------------- */

export const SETTINGS_TABS = [
  { key: 'editor', label: 'Editor', icon: Code2, page: 'editor' },
  {
    key: 'secrets',
    label: 'Secrets & Environment',
    icon: Key,
    page: 'secrets',
  },
  {
    key: 'team',
    label: 'Team',
    icon: Users,
    page: 'team',
  },
];

export function SettingsSheet({ children }) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(SETTINGS_TABS[0].key);
  const [portalId, setPortalId] = React.useState(null);

  const activeTabDef = SETTINGS_TABS.find((t) => t.key === activeTab);

  /* ---------------------------------
     Open listener
  --------------------------------- */

  React.useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('settings:open', openHandler);
    return () => window.removeEventListener('settings:open', openHandler);
  }, []);

  /* ---------------------------------
     Resolve active portal on open
  --------------------------------- */

  React.useEffect(() => {
    if (!open) return;

    try {
      const id = getActivePortalId();
      setPortalId(id);
    } catch (err) {
      console.warn('[SettingsSheet] portal not ready yet');
      setPortalId(null);
    }
  }, [open]);

  return (
    <Drawer
      direction='right'
      open={open}
      onOpenChange={setOpen}
      dismissible
      closeOnOutsideClick
    >
      <DrawerTrigger asChild>
        <span onClick={() => setOpen(true)}>{children}</span>
      </DrawerTrigger>

      <DrawerContent className='fixed inset-y-0 right-0 xl:min-w-[70vw] lg:min-w-[80vw] md:min-w-[100vw] w-full p-0 flex flex-col rounded-none'>
        {/* Header */}
        <DrawerHeader className='border-b px-6 py-4 flex flex-row items-center justify-between'>
          <DrawerTitle className='text-base'>Settings</DrawerTitle>

          <Button variant='ghost' size='icon' onClick={() => setOpen(false)}>
            <X className='h-4 w-4' />
          </Button>
        </DrawerHeader>

        {/* Body */}
        <div className='flex flex-1 min-h-0'>
          {/* Sidebar */}
          <aside className='w-55 shrink-0 border-r bg-muted/30 p-2'>
            <nav className='flex flex-col gap-1.5'>
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition text-left',
                      activeTab === tab.key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className='h-4 w-4 shrink-0' />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <section className='flex-1 overflow-y-auto'>
            <div className='w-full px-4 py-4 space-y-6'>
              {activeTabDef.page === 'editor' && <EditorSettingsPage />}

              {activeTabDef.page === 'secrets' &&
                (portalId ? (
                  <PortalSecretsSettingsPage portalId={portalId} />
                ) : (
                  <div className='text-sm text-muted-foreground'>
                    Loading portal…
                  </div>
                ))}

              {activeTabDef.page === 'team' &&
                (portalId ? (
                  <TeamMembersSettingsPage portalId={portalId} />
                ) : (
                  <div className='text-sm text-muted-foreground'>
                    Loading portal…
                  </div>
                ))}
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
