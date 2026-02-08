'use client';

import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, KeyRound } from 'lucide-react';

import { fetchPortalSecrets } from '@/lib/settings/secrets';
import {
  fetchActionSecrets,
  setActionSecrets,
} from '@/lib/actions/action-secrets';

export function AssignSecretsDialog({
  open,
  onOpenChange,
  actionId,
  portalId,
}) {
  const [secrets, setSecrets] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* -------------------------------------------
     Load secrets + assignments
  ------------------------------------------- */

  useEffect(() => {
    if (!open || !actionId || !portalId) return;

    let mounted = true;

    async function load() {
      setLoading(true);

      try {
        const [allSecrets, assignedIds] = await Promise.all([
          fetchPortalSecrets(portalId),
          fetchActionSecrets(actionId),
        ]);

        if (!mounted) return;

        setSecrets(allSecrets);
        setSelected(new Set(assignedIds));
      } catch (err) {
        console.error('[AssignSecretsDialog] load failed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [open, actionId, portalId]);

  /* -------------------------------------------
     Toggle selection
  ------------------------------------------- */

  function toggle(secretId) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(secretId) ? next.delete(secretId) : next.add(secretId);
      return next;
    });
  }

  /* -------------------------------------------
     Save
  ------------------------------------------- */

  async function handleSave() {
    setSaving(true);

    try {
      await setActionSecrets(actionId, portalId, Array.from(selected));

      onOpenChange(false);
    } catch (err) {
      console.error('[AssignSecretsDialog] save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  /* -------------------------------------------
     Render
  ------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <KeyRound className='h-4 w-4' />
            Assign secrets
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <ScrollArea className='max-h-[320px] pr-2'>
            <div className='space-y-3'>
              {secrets.map((secret) => (
                <label
                  key={secret.id}
                  className='flex items-center gap-3 rounded-md border p-3 hover:bg-muted/40 cursor-pointer'
                >
                  <Checkbox
                    checked={selected.has(secret.id)}
                    onCheckedChange={() => toggle(secret.id)}
                  ></Checkbox>

                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>{secret.name}</span>

                    <span className='text-xs text-muted-foreground'>
                      Scope: {secret.scope}
                    </span>
                  </div>
                </label>
              ))}

              {secrets.length === 0 && (
                <div className='text-sm text-muted-foreground text-center py-6'>
                  No secrets available in this portal
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
