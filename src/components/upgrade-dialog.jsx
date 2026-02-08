'use client';

import * as React from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Shield,
  Activity,
  Users,
  Crown,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/* ---------------------------------------
   Pricing Config
--------------------------------------- */

const PRICES = {
  forge: { monthly: 0, annualMonthlyEquivalent: 0, annualTotal: 0 },
  foundry: { monthly: 49, annualMonthlyEquivalent: 39, annualTotal: 468 },
};

/* ---------------------------------------
   Utils
--------------------------------------- */

function formatGBP(n) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(n);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/* ---------------------------------------
   Count Up Hook
--------------------------------------- */

function useCountUp(value, duration = 350) {
  const [display, setDisplay] = React.useState(value);

  React.useEffect(() => {
    let raf;
    const start = performance.now();
    const from = display;
    const to = value;

    function tick(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (to - from) * eased);
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return display;
}

/* ---------------------------------------
   Small UI Pieces
--------------------------------------- */

function FeatureRow({ children, strong }) {
  return (
    <div className='flex items-start gap-2 text-sm'>
      <Check
        className={cn(
          'mt-0.5 size-4',
          strong ? 'text-indigo-200' : 'text-indigo-300',
        )}
      />
      <span className={cn(strong ? 'text-indigo-100' : 'text-indigo-200')}>
        {children}
      </span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className='flex items-center gap-2 text-xs uppercase text-indigo-300'>
      <Icon className='size-3.5' />
      {title}
    </div>
  );
}

function Pill({ children, variant = 'default' }) {
  return (
    <Badge
      className={cn(
        'rounded-full px-3 py-1 text-[11px]',
        variant === 'recommended' &&
          'bg-pink-500/20 border-pink-400/30 text-pink-100',
        variant === 'current' && 'bg-sky-500/20 border-sky-400/30 text-sky-100',
        variant === 'default' && 'bg-white/10 border-white/10 text-indigo-100',
      )}
    >
      {children}
    </Badge>
  );
}

function ComingSoonBadge({ className }) {
  return (
    <Badge
      className={cn(
        `
        ml-2
        text-[10px]
        px-2 py-[2px]
        rounded-full
        border border-white/20
        bg-white/5
        text-white
        backdrop-blur
        `,
        className,
      )}
    >
      Coming Soon
    </Badge>
  );
}

/* ---------------------------------------
   MAIN COMPONENT
--------------------------------------- */

export function GlobalUpgradeDialog() {
  const [open, setOpen] = React.useState(false);
  const [billingAnnual, setBillingAnnual] = React.useState(true);
  const [detail, setDetail] = React.useState(null);
  const [upgrading, setUpgrading] = React.useState(null);

  React.useEffect(() => {
    function handleOpen(e) {
      setDetail(e.detail || null);
      setOpen(true);
    }

    function handleClose() {
      setOpen(false);
      setDetail(null);
    }

    window.addEventListener('upgrade:open', handleOpen);
    window.addEventListener('upgrade:close', handleClose);

    return () => {
      window.removeEventListener('upgrade:open', handleOpen);
      window.removeEventListener('upgrade:close', handleClose);
    };
  }, []);

  const currentPlan = detail?.currentPlan || 'forge';

  const price = billingAnnual
    ? PRICES.foundry.annualMonthlyEquivalent
    : PRICES.foundry.monthly;

  const displayPrice = useCountUp(price);

  async function handleUpgrade(plan) {
    setUpgrading(plan);
    await new Promise((r) => setTimeout(r, 600));
    console.log('Upgrade clicked', plan);
    setUpgrading(null);
    setOpen(false);
  }

  /* ---------------------------------------
     UI
  --------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='fixed w-screen h-screen min-w-[100vw] max-w-none p-0 border-0 bg-gradient-to-br from-black via-indigo-950/60 to-purple-950/60 backdrop-blur-2xl text-indigo-100 [&>button]:hidden focus:outline-none'>
        <VisuallyHidden>
          <DialogTitle>Upgrade</DialogTitle>
        </VisuallyHidden>

        {/* Close */}
        <div className='absolute top-6 right-6'>
          <DialogClose asChild>
            <button className='p-2 hover:bg-white/10 rounded-md'>
              <X className='size-5' />
            </button>
          </DialogClose>
        </div>

        {/* Content */}
        <div className='flex flex-col h-full justify-center items-center px-6'>
          {/* Header */}
          <div className='text-center max-w-xl mb-10'>
            <h1 className='text-4xl font-semibold'>Upgrade to Foundry</h1>
            <p className='mt-3 text-indigo-300'>
              Premium runtime performance, observability and developer tooling.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className='flex items-center gap-3 mb-8'>
            <span className='text-sm'>Monthly</span>
            <Switch
              checked={billingAnnual}
              onCheckedChange={setBillingAnnual}
            />
            <span className='text-sm'>Annual (Save 20%)</span>
          </div>

          {/* Cards */}
          <div className='grid md:grid-cols-2 gap-8 w-full max-w-6xl'>
            {/* =========================
      FORGE
  ========================== */}
            <div
              className='
      rounded-3xl
      border border-white/10
      bg-white/[0.0]
      backdrop-blur-xl
      p-7
      transition hover:bg-white/[0.06]
    '
            >
              {/* Header */}
              <div className='flex justify-between items-start'>
                <div>
                  <div className='flex items-center gap-2'>
                    <h2 className='text-xl font-semibold text-indigo-50'>
                      Forge
                    </h2>
                    {currentPlan === 'forge' && (
                      <Pill variant='current'>Current</Pill>
                    )}
                  </div>

                  <p className='text-sm text-indigo-300 mt-1'>
                    Build and test automations in a safe web environment.
                  </p>
                </div>

                <div className='text-right'>
                  <div className='text-3xl font-semibold text-indigo-50'>
                    Free
                  </div>
                  <div className='text-xs text-indigo-300'>Starter tier</div>
                </div>
              </div>

              <Separator className='my-4 bg-white/10' />

              {/* Runtime */}
              <div className='space-y-1'>
                <SectionTitle icon={Shield} title='Local Runtime & Testing' />
                <FeatureRow>Manual execution testing only</FeatureRow>
                <FeatureRow>Local / emulator runtime environment</FeatureRow>
                <FeatureRow>Shared non-priority infrastructure</FeatureRow>
                <FeatureRow>
                  Designed for build & validation workflows
                </FeatureRow>
              </div>

              <Separator className='my-4 bg-white/10' />

              {/* Observability */}
              <div className='space-y-1'>
                <SectionTitle icon={Activity} title='Basic Debug Visibility' />
                <FeatureRow>Console style execution output</FeatureRow>
                <FeatureRow>Manual test run logs only</FeatureRow>
                <FeatureRow>No live production monitoring</FeatureRow>
                <FeatureRow>Limited execution history and retention</FeatureRow>
              </div>

              <Separator className='my-4 bg-white/10' />

              {/* Platform */}
              <div className='space-y-1'>
                <SectionTitle icon={Users} title='Developer Platform' />
                <FeatureRow>Limited to 1 User per Portal</FeatureRow>
                <FeatureRow>Maximum of 2 Portals</FeatureRow>
                <FeatureRow>Action development & template creation</FeatureRow>
                <FeatureRow>Local config + secret testing</FeatureRow>
                <FeatureRow>Single developer workflow focus</FeatureRow>
              </div>

              <div className='mt-7'>
                <Button disabled className='w-full'>
                  Current Plan
                </Button>
              </div>
            </div>

            {/* =========================
      FOUNDRY (HERO)
  ========================== */}
            <div
              className='
      relative
      rounded-3xl
      border border-white/10
      bg-gradient-to-br
      from-black/80
      via-indigo-950/50
      to-purple-950/40
      backdrop-blur-xl
      p-7
      shadow-[0_0_120px_rgba(99,102,241,0.45)]
      transition
      hover:shadow-[0_0_160px_rgba(99,102,241,0.55)]
    '
            >
              {/* Glow */}
              <div
                className='
      absolute -inset-[1px]
      rounded-[28px]
      bg-gradient-to-br
      from-indigo-500/40
      via-violet-500/30
      to-fuchsia-500/20
      opacity-70
      blur-[6px]
    '
              />
              <div
                className='
    pointer-events-none
    absolute inset-0
    rounded-3xl
    bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.35),transparent_60%)]
    opacity-70
  '
              />

              <div className='relative'>
                {/* Header */}
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h2 className='text-xl font-semibold text-indigo-50'>
                        Foundry
                      </h2>

                      <Badge
                        className='
    bg-gradient-to-r
    from-indigo-500/30
    via-violet-500/30
    to-fuchsia-500/30
    border border-indigo-400/40
    text-indigo-100
    shadow-[0_0_20px_rgba(139,92,246,0.35)]
  '
                      >
                        <Crown className='size-3 mr-1' />
                        Most Popular
                      </Badge>
                    </div>

                    <p className='text-sm text-indigo-200 mt-1'>
                      Your production execution platform for running, observing,
                      and managing live automation workloads.
                    </p>
                  </div>

                  <div className='text-right'>
                    <div className='text-4xl font-semibold text-white tracking-tight'>
                      {formatGBP(displayPrice)}
                      <span className='text-sm text-indigo-300'> /mo</span>
                    </div>

                    <div className='text-[11px] text-indigo-300 mt-1'>
                      Production runtime + CI/CD + observability
                    </div>
                  </div>
                </div>

                <Separator className='my-4 bg-white/10' />

                {/* Runtime */}
                <div className='space-y-1'>
                  <SectionTitle
                    icon={Zap}
                    title='Production Runtime Platform'
                  />
                  <FeatureRow strong>
                    CI/CD deployment directly to HubSpot
                  </FeatureRow>
                  <FeatureRow strong>
                    Live production execution runtime
                  </FeatureRow>
                  <FeatureRow strong>
                    Priority infrastructure & scaling
                  </FeatureRow>
                  <FeatureRow>Reduced cold start latency</FeatureRow>
                </div>

                <Separator className='my-4 bg-white/10' />

                {/* Observability */}
                <div className='space-y-1'>
                  <SectionTitle
                    icon={Activity}
                    title='Live Execution Observability'
                  />

                  <FeatureRow>Execution history & retention</FeatureRow>

                  <FeatureRow strong>Live log streaming</FeatureRow>
                  <FeatureRow strong>
                    Real-time execution telemetry <ComingSoonBadge />
                  </FeatureRow>
                  <FeatureRow strong>
                    Automatic error alerting <ComingSoonBadge />
                  </FeatureRow>
                  <FeatureRow>
                    Metrics dashboards & trends <ComingSoonBadge />
                  </FeatureRow>
                </div>
                <Separator className='my-4 bg-white/10' />

                {/* Platform */}
                <div className='space-y-1'>
                  <SectionTitle icon={Users} title='Platform & Team Scale' />
                  <FeatureRow strong>
                    Multi-portal production management
                  </FeatureRow>
                  <FeatureRow strong>
                    Advanced secrets & environment scoping
                  </FeatureRow>
                  <FeatureRow>Priority support & roadmap access</FeatureRow>
                </div>

                <div className='mt-8'>
                  <Button
                    onClick={() => handleUpgrade('foundry')}
                    className='
  relative overflow-hidden
  w-full h-11
  bg-gradient-to-r
  from-indigo-500 via-violet-500 to-fuchsia-500
  hover:from-indigo-400 hover:via-violet-400 hover:to-fuchsia-400
  text-white font-medium
  shadow-[0_20px_70px_rgba(139,92,246,0.45)]
  before:absolute before:inset-0
  before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)]
  before:translate-x-[-120%]
  hover:before:translate-x-[120%]
  before:transition before:duration-700
'
                  >
                    {upgrading
                      ? 'Redirecting to Checkout…'
                      : 'Upgrade to Foundry'}
                  </Button>

                  <p className='text-xs text-indigo-300 text-center mt-2'>
                    {billingAnnual && 'Billed annually • '}
                    Secure checkout • Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
