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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import {
  PORTAL_ICONS,
  PORTAL_COLORS,
  resolvePortalIcon,
  resolvePortalColor,
} from '@/lib/portal-icons';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Sparkles } from 'lucide-react';
import { setActivePortal, getAvailablePortals, addAvailablePortal } from '~/lib/portal-state';

const supabase = createSupabaseBrowserClient();

export function CreatePortalSheet({ open, onOpenChange }) {
  const [type, setType] = React.useState('workspace');
  const [name, setName] = React.useState('');
  const [portalId, setPortalId] = React.useState('');
  const [icon, setIcon] = React.useState('briefcase');
  const [color, setColor] = React.useState('blue');
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState('Free');

  const Icon = resolvePortalIcon(icon);
  const c = resolvePortalColor(color);
  const isPremiumColor = Boolean(c?.premium);
  const isPro = plan.toLowerCase() === 'pro';

  // 🔑 single gate
  const allowedToProgress = !isPremiumColor || isPro;

  /* ---------------------------------
     Load user plan
  --------------------------------- */

  React.useEffect(() => {
    async function loadPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (data?.plan) {
        setPlan(data.plan === 'pro' ? 'Pro' : 'Free');
      }
    }

    loadPlan();
  }, []);

  async function handleCreate() {
    if (!name || !allowedToProgress) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    /* -------------------------------
       1. Create portal
    -------------------------------- */

    const { data: portal, error: insertError } = await supabase
      .from('portals')
      .insert({
        name,
        type,
        id: type === 'portal' ? Number(portalId) : null,
        icon,
        color,
        created_by: user.id,
      })
      .select('uuid')
      .single();

    if (insertError) {
      console.error(insertError);
      setLoading(false);
      return;
    }

    /* -------------------------------
       2. Append portal UUID to profile
    -------------------------------- */

    const { error: appendError } = await supabase.rpc(
      'append_portal_uuid_to_profile',
      {
        p_user_id: user.id,
        p_portal_uuid: portal.uuid,
      },
    );

    if (appendError) {
      console.error(appendError);
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
            Create a workspace or link an external portal.
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className='flex-1 min-h-0'>
          <div className='space-y-2 px-6 py-4'>
            {/* Identity */}
            <Card className='p-4'>
              <div className='space-y-4'>
                {/* Type */}
                <div className='space-y-2'>
                  <Label className='text-xs text-muted-foreground'>
                    Workspace type
                  </Label>

                  <RadioGroup
                    value={type}
                    onValueChange={setType}
                    className='grid grid-cols-2 gap-2'
                  >
                    {[
                      { id: 'workspace', label: 'Workspace' },
                      { id: 'portal', label: 'HubSpot portal' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition',
                          'focus-within:ring-1 focus-within:ring-primary',
                          type === opt.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted',
                        )}
                      >
                        <RadioGroupItem value={opt.id} />
                        <span className='font-medium'>{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Identity */}
                <div className='space-y-3'>
                  <div className='space-y-1.5'>
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='My HubSpot Portal'
                    />
                  </div>

                  {type === 'portal' && (
                    <div className='space-y-1.5'>
                      <Label>HubSpot Portal ID</Label>
                      <Input
                        value={portalId}
                        onChange={(e) => {
                          // Strip all non-numeric characters
                          const numericOnly = e.target.value.replace(
                            /\D+/g,
                            '',
                          );
                          setPortalId(numericOnly);
                        }}
                        inputMode='numeric'
                        maxLength={11}
                        pattern='[0-9]*'
                        placeholder='1234567890'
                      />
                    </div>
                  )}
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
                    <Icon className='size-4' />
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
                      <span>{type === 'portal' ? 'Portal' : 'Workspace'}</span>
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
                    {plan === 'Pro' ? (
                      <div className='grid size-8 place-items-center rounded-md bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-cyan-400/15'>
                        <Sparkles className='size-4' />
                      </div>
                    ) : (
                      <div className='grid size-8 place-items-center rounded-md bg-muted text-muted-foreground'>
                        <Sparkles className='size-4' />
                      </div>
                    )}

                    <div className='leading-tight'>
                      <div className='text-sm font-medium'>{plan} plan</div>
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
          <Button
            onClick={handleCreate}
            disabled={loading || !name || !allowedToProgress}
          >
            {!allowedToProgress ? 'Upgrade to use this color' : 'Create portal'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
