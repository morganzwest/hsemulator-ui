'use client';

import { useEffect, useState } from 'react';

import { SidebarLeft } from '@/components/sidebar-left';
import { SidebarRight } from '@/components/sidebar-right';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { EditorPanel } from '@/components/editor-panel';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/* -------------------------------------
   Runtime status indicator (inline)
------------------------------------- */
function RuntimeStatus({ healthy, checking }) {
  let color = 'bg-muted';
  let label = 'Checking runtime';

  if (!checking) {
    if (healthy) {
      color = 'bg-emerald-500';
      label = 'Runtime healthy';
    } else {
      color = 'bg-red-500';
      label = 'Runtime offline';
    }
  }

  return (
    <div
      className='flex items-center gap-2 text-xs text-muted-foreground'
      title={label}
    >
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

export default function Page() {
  const [healthy, setHealthy] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);

  // Health check (header-level, single source of truth)
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_RUNTIME_URL}/health`,
        );
        setHealthy(res.ok);
      } catch {
        setHealthy(false);
      } finally {
        setCheckingHealth(false);
      }
    }

    checkHealth();
  }, []);

  return (
    <SidebarProvider>
      <SidebarLeft />

      <SidebarInset>
        {/* Header */}
        <header className='sticky top-0 z-10 flex h-14 items-center bg-background'>
          <div className='flex w-full items-center justify-between px-4'>
            {/* Left: breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className='line-clamp-1'>
                    Code Action Editor
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Right: runtime status */}

            <Tooltip>
              <TooltipTrigger>
                <RuntimeStatus healthy={healthy} checking={checkingHealth} />
              </TooltipTrigger>
              
              {/* Hide tooltip if healthy is true */}
              {!healthy && !checkingHealth && (
                <TooltipContent sideOffset={4}>
                  The server is offline. You can run a local runtime.
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </header>

        {/* Main content */}
        <div className='flex flex-1 flex-col p-4'>
          <EditorPanel />
        </div>
      </SidebarInset>

      <SidebarRight />
    </SidebarProvider>
  );
}
