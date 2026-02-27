'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { SidebarLeft } from '@/components/sidebar-left';
import { SidebarRight } from '@/components/sidebar-right';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { EditorPanel } from '@/components/editor-panel';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

/* -------------------------------------
   Combined Runtime & Connection status indicator
------------------------------------- */

function CombinedStatus({
  healthy,
  checking,
  connectionState,
  connectionInfo,
}) {
  let label = 'Checking';
  let color = 'bg-muted';
  let tooltip = 'Checking runtime health...';

  if (!checking) {
    const connectionStateInfo = connectionInfo || {};
    const { state: connState, reason, retries } = connectionStateInfo;

    // Priority: Error/Offline > Reconnecting > Ready
    if (!healthy) {
      label = 'Offline';
      color = 'bg-red-500';
      tooltip = 'Runtime server is offline';
    } else if (connState === 'error' || connState === 'disconnected') {
      label = 'Offline';
      color = 'bg-red-500';
      tooltip = `Connection error: ${reason || 'Unknown error'}`;
    } else if (connState === 'reconnecting') {
      label = 'Reconnecting';
      color = 'bg-yellow-500';
      tooltip = `Runtime ready • Reconnecting (attempt ${retries || 0})`;
    } else if (connState === 'connecting') {
      label = 'Connecting';
      color = 'bg-yellow-500';
      tooltip = 'Runtime ready • Connecting to realtime...';
    } else if (connState === 'connected') {
      label = 'Ready';
      color = 'bg-emerald-500';
      tooltip = 'Runtime ready • Realtime connected';
    } else {
      label = 'Ready';
      color = 'bg-emerald-500';
      tooltip = 'Runtime ready';
    }
  }

  return (
    <div
      className='flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground'
      title={tooltip}
    >
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

/* -------------------------------------
   Client Page
------------------------------------- */

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const actionIdFromUrl = searchParams.get('actionId');

  const [actions, setActions] = useState([]);
  const [activeAction, setActiveAction] = useState(null);

  const [healthy, setHealthy] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [connectionInfo, setConnectionInfo] = useState({
    reason: null,
    retries: 0,
    timestamp: null,
    channelName: null,
  });

  /* -----------------------------
     Runtime health check
  ----------------------------- */

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

  /* -----------------------------
     URL → activeAction
  ----------------------------- */

  useEffect(() => {
    if (!actionIdFromUrl) return;
    if (!actions.length) return;
    if (activeAction?.id === actionIdFromUrl) return;

    const match = actions.find((a) => a.id === actionIdFromUrl);

    if (match) {
      setActiveAction(match);
    } else {
      console.warn('[Dashboard] Invalid actionId:', actionIdFromUrl);
    }
  }, [actionIdFromUrl, actions]);

  /* -----------------------------
     activeAction → URL
  ----------------------------- */

  useEffect(() => {
    if (!activeAction) return;
    if (actionIdFromUrl === activeAction.id) return;

    const params = new URLSearchParams(searchParams);
    params.set('actionId', activeAction.id);

    router.replace(`/dashboard?${params.toString()}`);
  }, [activeAction]);

  /* -----------------------------
     Render
  ----------------------------- */

  return (
    <SidebarProvider>
      <SidebarLeft
        onSelectAction={setActiveAction}
        onActionsLoaded={setActions}
      />

      <SidebarInset className='min-w-0 flex flex-col'>
        <header className='sticky top-0 z-10 flex h-14 items-center bg-background'>
          <div className='flex w-full items-center justify-between px-4'>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <SidebarTrigger className='-ml-1' />
                  <Separator
                    orientation='vertical'
                    className='mr-2 data-[orientation=vertical]:h-4'
                  />
                  <BreadcrumbPage className='line-clamp-1'>
                    Code Action Editor
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Tooltip>
              <TooltipTrigger>
                <CombinedStatus
                  healthy={healthy}
                  checking={checkingHealth}
                  connectionState={connectionState}
                  connectionInfo={connectionInfo}
                />
              </TooltipTrigger>

              {!healthy && !checkingHealth && (
                <TooltipContent sideOffset={4}>
                  The server is offline. You can run a local runtime.
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </header>

        <div className='flex flex-1 min-w-0 flex-col p-4'>
          <EditorPanel
            runtimeHealthy={healthy}
            activeAction={activeAction}
            onConnectionChange={(state, info) => {
              setConnectionState(state);
              setConnectionInfo(info);
            }}
          />
        </div>
      </SidebarInset>

      <SidebarRight activeAction={activeAction} />
    </SidebarProvider>
  );
}
