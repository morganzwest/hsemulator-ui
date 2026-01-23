'use client';

import * as React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { EditorSettingsPage } from '@/components/settings/pages/editor-settings';

import {
  Settings,
  Users,
  Shield,
  Code2,
  Layout,
  Sparkles,
  Cpu,
  Key,
  Terminal,
  Plug,
} from 'lucide-react';

export const SETTINGS_TABS = [
  // { key: 'general', label: 'General', icon: Settings },
  // { key: 'team', label: 'Team & Access', icon: Users },
  // { key: 'security', label: 'Security', icon: Shield },
  { key: 'editor', label: 'Editor', icon: Code2, page: 'editor' },
  // { key: 'templates', label: 'Templates', icon: Layout },
  // { key: 'ai', label: 'AI Assistance', icon: Sparkles },
  // { key: 'runtime', label: 'Runtime', icon: Cpu },
  // { key: 'secrets', label: 'Secrets & Environment', icon: Key },
  // { key: 'cli', label: 'CLI & CI', icon: Terminal },
  // { key: 'integrations', label: 'Integrations', icon: Plug },
];

export function SettingsSheet({ children }) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(SETTINGS_TABS[0].key);

  const activeTabDef = SETTINGS_TABS.find((t) => t.key === activeTab);

  return (
    <Drawer
      direction='right'
      open={open}
      onOpenChange={setOpen}
      dismissible={false}
      closeOnOutsideClick
    >
      <DrawerTrigger asChild>
        <span onClick={() => setOpen(true)}>{children}</span>
      </DrawerTrigger>

      <DrawerContent className='fixed inset-y-0 right-0 min-w-[65vw] w-full p-0 flex flex-col rounded-none'>
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
              <section className="flex-1 overflow-y-auto">
  {activeTabDef.page === 'editor' && (
    <EditorSettingsPage />
  )}
</section>
            </div>
          </section>
        </div>

        {/* Footer */}
        {/* <DrawerFooter className='border-t px-6 py-3'>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save changes</Button>
          </div>
        </DrawerFooter> */}
      </DrawerContent>
    </Drawer>
  );
}
