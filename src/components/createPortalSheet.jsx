'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import {
  PORTAL_ICONS,
  PORTAL_COLORS,
  resolvePortalIcon,
  resolvePortalColor,
} from '@/lib/portal-icons';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import {
  setActivePortal,
  getAvailablePortals,
  addAvailablePortal,
} from '~/lib/portal-state';
import { getActiveAccountId } from '~/lib/account-state';
import {
  checkLimitsWithUpgradeInfo,
  navigateToPricing,
} from '@/lib/account-limits';

const supabase = createSupabaseBrowserClient();

export function CreatePortalSheet({ open, onOpenChange }) {
  const [name, setName] = React.useState('');
  const [portalId, setPortalId] = React.useState('');
  const [icon, setIcon] = React.useState('briefcase');
  const [color, setColor] = React.useState('blue');
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState(() => {
    // Try to get cached plan from localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('user_plan');
      return cached || 'Free';
    }
    return 'Free';
  });
  const [accountReady, setAccountReady] = React.useState(false);
  const [planLoading, setPlanLoading] = React.useState(false);
  const [portalLimitCheck, setPortalLimitCheck] = React.useState({
    canProceed: true,
    loading: true,
    error: null,
    upgradeUrl: null,
  });

  // Memoize color and other values
  const c = React.useMemo(() => resolvePortalColor(color), [color]);
  const isPremiumColor = Boolean(c?.premium);
  const isPro = plan.toLowerCase() === 'pro';

  // Check if user can proceed (both plan limits and color limits)
  const allowedToProgress = !isPremiumColor || isPro;
  const canCreatePortal =
    allowedToProgress &&
    portalLimitCheck.canProceed &&
    accountReady &&
    !portalLimitCheck.loading;

  // Check portal limits when sheet opens or account changes
  React.useEffect(() => {
    async function checkPortalLimits() {
      if (!accountReady) return;

      setPortalLimitCheck((prev) => ({ ...prev, loading: true }));

      try {
        const result = await checkLimitsWithUpgradeInfo('portal');
        setPortalLimitCheck({
          canProceed: result.canProceed,
          loading: false,
          error: result.error,
          upgradeUrl: result.upgradeUrl,
        });
      } catch (error) {
        console.error(
          '[CreatePortalSheet] Error checking portal limits:',
          error,
        );
        setPortalLimitCheck({
          canProceed: false,
          loading: false,
          error: 'Failed to check portal limits',
          upgradeUrl: '/pricing',
        });
      }
    }

    if (open) {
      checkPortalLimits();
    }
  }, [open, accountReady]);

  /* ---------------------------------
     Check account state on mount
  --------------------------------- */

  React.useEffect(() => {
    async function checkAccountState() {
      try {
        const accountId = getActiveAccountId();
        if (accountId) {
          setAccountReady(true);
        }
      } catch {
        // Account state not initialized, try to initialize
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: accountData } = await supabase
            .from('account_users')
            .select('account_id')
            .eq('user_id', user.id)
            .limit(1);

          if (accountData && accountData.length > 0) {
            setAccountReady(true);
          }
        }
      }
    }

    if (open) {
      checkAccountState();
    }
  }, [open]);

  /* ---------------------------------
     Load user plan from account
  --------------------------------- */

  React.useEffect(() => {
    async function loadPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Try to get plan from initialized state first
      try {
        const availableAccounts = getAvailableAccounts();
        if (availableAccounts.length > 0) {
          const accountId = getActiveAccountId();
          console.log(
            '[CreatePortalSheet] Loading plan for account:',
            accountId,
          );
          const { data } = await supabase
            .from('accounts')
            .select('plan')
            .eq('id', accountId)
            .single();

          console.log('[CreatePortalSheet] Plan data from DB:', data);
          if (data?.plan) {
            const planDisplay = data.plan === 'pro' ? 'Pro' : 'Free';
            console.log(
              '[CreatePortalSheet] Setting plan display to:',
              planDisplay,
            );
            setPlan(planDisplay);
          }
          return;
        }
      } catch {
        console.log(
          '[CreatePortalSheet] Account state not ready, using direct lookup',
        );
      }

      // Fallback: Direct account lookup if state not ready
      const { data: accountData } = await supabase
        .from('account_users')
        .select(
          `
          account_id,
          account:accounts (
            plan
          )
        `,
        )
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .limit(1);

      if (accountData && accountData.length > 0) {
        const plan = accountData[0].account.plan;
        const planDisplay = plan === 'pro' ? 'Pro' : 'Free';
        console.log(
          '[CreatePortalSheet] Direct lookup - setting plan to:',
          planDisplay,
        );
        setPlan(planDisplay);
        setPlanLoading(false);

        // Also update cache immediately
        if (typeof window !== 'undefined' && planDisplay !== 'Free') {
          localStorage.setItem('user_plan', planDisplay);
        }
      }
    }

    loadPlan();
  }, [open]); // Re-run when sheet opens to ensure fresh data

  // Additional immediate plan loading on first mount
  React.useEffect(() => {
    async function loadPlanImmediately() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Force immediate plan check
      const { data: accountData } = await supabase
        .from('account_users')
        .select(
          `
          account_id,
          account:accounts (
            plan
          )
        `,
        )
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .limit(1);

      if (accountData && accountData.length > 0) {
        const plan = accountData[0].account.plan;
        const planDisplay = plan === 'pro' ? 'Pro' : 'Free';
        console.log(
          '[CreatePortalSheet] IMMEDIATE lookup - setting plan to:',
          planDisplay,
        );
        setPlan(planDisplay);

        // Also update cache immediately
        if (typeof window !== 'undefined' && planDisplay !== 'Free') {
          localStorage.setItem('user_plan', planDisplay);
        }
      }
    }

    loadPlanImmediately();
  }, []); // Run once on mount

  async function handleCreate() {
    if (
      !name ||
      !allowedToProgress ||
      !accountReady ||
      !portalLimitCheck.canProceed
    )
      return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Get the active account for the current user
    let accountId;
    try {
      accountId = getActiveAccountId();
    } catch (error) {
      console.error(
        'Account state not initialized, trying to get account directly:',
        error,
      );

      // Fallback: Get user's account directly
      const { data: accountData } = await supabase
        .from('account_users')
        .select('account_id')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .limit(1)
        .single();

      if (accountData) {
        accountId = accountData.account_id;
      } else {
        console.error('No account found for user');
        setLoading(false);
        return;
      }
    }

    /* -------------------------------
     1. Create portal
  -------------------------------- */

    const { data: portal, error: insertError } = await supabase
      .from('portals')
      .insert({
        name,
        type: 'portal',
        id: Number(portalId) || null,
        icon,
        color,
        account_id: accountId,
      })
      .select('uuid')
      .single();

    if (insertError) {
      console.error(insertError);
      setLoading(false);
      return;
    }

    setLoading(false);

    addAvailablePortal({
      uuid: portal.uuid,
      name,
      type,
      icon,
      color,
      plan,
    });

    setActivePortal(portal.uuid);

    window.dispatchEvent(new CustomEvent('portal:created', { detail: portal }));

    onOpenChange(false);
    window.location.reload();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} className=''>
      <SheetContent
        side='left'
        className='p-0 flex flex-col h-full gap-0 xl:min-w-[30vw] lg:min-w-[50vw] md:min-w-[70vw]'
      >
        {/* Header */}
        <SheetHeader className='border-b'>
          <SheetTitle>Create portal</SheetTitle>
          <SheetDescription>
            Create a new HubSpot portal for your account.
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className='flex-1 min-h-0'>
          <div className='space-y-2 px-6 py-4'>
            {/* Identity */}
            <Card className='p-4'>
              <div className='space-y-4'>
                {/* Identity */}
                <div className='space-y-3'>
                  <div className='space-y-1.5'>
                    <Label>Portal Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='My HubSpot Portal'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label>HubSpot Portal ID (Optional)</Label>
                    <Input
                      value={portalId}
                      onChange={(e) => {
                        // Strip all non-numeric characters
                        const numericOnly = e.target.value.replace(/\D+/g, '');
                        setPortalId(numericOnly);
                      }}
                      inputMode='numeric'
                      maxLength={11}
                      pattern='[0-9]*'
                      placeholder='1234567890'
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Icon */}
            <Card className='p-4'>
              <div className='space-y-3'>
                <Label>Icon</Label>

                <div className='grid grid-cols-10 gap-2'>
                  {Object.entries(PORTAL_ICONS).map(([key, I]) => (
                    <button
                      key={key}
                      onClick={() => setIcon(key)}
                      className={cn(
                        'grid aspect-square place-items-center rounded-md border',
                        icon === key
                          ? 'border-primary ring-1 ring-primary'
                          : 'hover:bg-muted',
                      )}
                    >
                      <I className='size-5 m-2' />
                    </button>
                  ))}
                </div>
              </div>

              <div className='space-y-3'>
                <Label>Color</Label>

                <div className='grid grid-cols-10 gap-2'>
                  {Object.entries(PORTAL_COLORS).map(([key, value]) => {
                    const isSelected = color === key;

                    return (
                      <button
                        key={key}
                        onClick={() => setColor(key)}
                        className={cn(
                          'h-10 rounded-md border transition',
                          value.container,
                          isSelected && 'ring-1 ring-primary',
                          !isSelected &&
                            value.premium &&
                            'ring-1 ring-white/20',
                        )}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className='space-y-3'>
                <Label>Preview</Label>

                <div
                  className={cn(
                    'relative flex items-center gap-3 rounded-md border p-3',
                    c.glow,
                  )}
                >
                  <div
                    className={cn(
                      'grid size-9 place-items-center rounded-md border',
                      c.container,
                    )}
                  >
                    {React.createElement(resolvePortalIcon(icon), {
                      className: 'size-4',
                    })}
                  </div>

                  <div className='min-w-0'>
                    <div className='truncate text-sm font-medium'>
                      {name || 'Portal name'}
                    </div>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <span className='font-light text-foreground/80'>
                        {plan}
                      </span>
                      <span>~</span>
                      <span>Portal</span>
                    </div>

                    {isPremiumColor && !allowedToProgress && (
                      <span className='absolute right-2 top-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600'>
                        Pro required to create
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='space-y-3'>
                <Label>Plan</Label>

                <div className='flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5'>
                  <div className='flex items-center gap-3'>
                    {planLoading ? (
                      <div className='grid size-8 place-items-center rounded-md bg-muted text-muted-foreground'>
                        <Sparkles className='size-4' />
                      </div>
                    ) : plan === 'Pro' ? (
                      <div className='grid size-8 place-items-center rounded-md bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-cyan-400/15'>
                        <Sparkles className='size-4' />
                      </div>
                    ) : (
                      <div className='grid size-8 place-items-center rounded-md bg-muted text-muted-foreground'>
                        <Sparkles className='size-4' />
                      </div>
                    )}

                    <div className='leading-tight'>
                      <div className='text-sm font-medium'>
                        {planLoading ? 'Loading...' : plan}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Early access
                      </div>
                    </div>
                  </div>

                  <span className='rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600'>
                    Active
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className='border-t px-6 py-4'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                onClick={handleCreate}
                disabled={
                  loading ||
                  !name ||
                  !allowedToProgress ||
                  !accountReady ||
                  portalLimitCheck.loading ||
                  !portalLimitCheck.canProceed
                }
              >
                {loading
                  ? 'Creating...'
                  : !allowedToProgress
                    ? 'Upgrade to use this color'
                    : !accountReady
                      ? 'Loading account...'
                      : portalLimitCheck.loading
                        ? 'Checking limits...'
                        : !portalLimitCheck.canProceed
                          ? 'Portal limit reached'
                          : 'Create portal'}
              </Button>
            </PopoverTrigger>

            {!portalLimitCheck.canProceed &&
              !portalLimitCheck.loading &&
              portalLimitCheck.error && (
                <PopoverContent className='w-80' align='end'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2 text-sm font-medium text-orange-600'>
                      <AlertCircle className='size-4' />
                      Portal Limit Reached
                    </div>

                    <p className='text-sm text-muted-foreground'>
                      {portalLimitCheck.error}
                    </p>

                    {portalLimitCheck.upgradeUrl && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full'
                        onClick={() =>
                          navigateToPricing(
                            {
                              source: 'portal_limit',
                              currentPlan: plan.toLowerCase(),
                              operation: 'portal',
                              feature: 'create_portal',
                              location: 'create_portal_sheet',
                            },
                            supabase,
                          )
                        }
                      >
                        <ExternalLink className='size-4 mr-2' />
                        Upgrade Plan
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              )}
          </Popover>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
