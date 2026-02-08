'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '~/lib/supabase/browser';
import { deleteSecret } from '~/lib/settings/secrets';

export function DeleteSecretDialog({ secret, open, onOpenChange, onDeleted }) {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');

  const confirmationCode = useMemo(() => {
    if (!open) return '';
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, [open]);

  const canDelete =
    confirmValue === confirmationCode && !loading && !!confirmationCode;

  async function handleDelete() {
    if (!canDelete) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      await deleteSecret(secret.id, {
        portal_id: secret.portal_id,
        user_id: user.id,
      });

      onDeleted?.(secret.id);
      onOpenChange(false);
      setConfirmValue('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) setConfirmValue('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md md:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            Delete secret
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          <p className='text-sm text-muted-foreground'>
            You are about to permanently delete the secret{' '}
            <span className='font-mono font-medium text-foreground'>
              {secret.name}
            </span>
            . Any services depending on it may break.
          </p>

          <div className='rounded-md border border-destructive/40 bg-destructive/5 p-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='mt-0.5 h-4 w-4 text-destructive' />
              <div className='space-y-1'>
                <p className='text-sm font-medium text-destructive'>
                  Permanent deletion
                </p>
                <p className='text-sm text-muted-foreground'>
                  This secret will be removed immediately and cannot be
                  recovered.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>
              To confirm, type the number below:
            </p>

            <div
              className='flex select-none items-center justify-center rounded-md border bg-muted px-3 py-2 font-mono text-sm tracking-[0.3em] cursor-not-allowed'
              onCopy={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            >
              {confirmationCode}
            </div>

            <Input
              autoFocus
              inputMode='numeric'
              pattern='[0-9]*'
              maxLength={6}
              placeholder='Enter confirmation code'
              value={confirmValue}
              onChange={(e) =>
                setConfirmValue(e.target.value.replace(/\D/g, ''))
              }
              className={cn(
                'font-mono tracking-widest',
                confirmValue &&
                  confirmValue !== confirmationCode &&
                  'border-destructive/50 focus-visible:ring-destructive/40',
                confirmValue === confirmationCode &&
                  'border-emerald-500/50 focus-visible:ring-emerald-500/40',
              )}
            />

            {confirmValue && confirmValue !== confirmationCode && (
              <p className='text-xs text-muted-foreground'>
                Code must match exactly to enable deletion.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className='mt-4 gap-2 sm:gap-0'>
          <Button
            variant='ghost'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            disabled={!canDelete}
            onClick={handleDelete}
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Delete secret
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
