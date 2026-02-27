// secret-row.jsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { updateSecret } from '~/lib/settings/secrets';
import { cn } from '@/lib/utils';
import { DeleteSecretDialog } from './delete-secret-dialog';

export function SecretRow({ secret, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function save() {
    if (saving) return;

    const nextValue = value.trim();
    if (!nextValue) return;

    setSaving(true);
    try {
      await updateSecret(secret.id, { value: nextValue });
      setValue('');
      setVisible(false);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-md border p-3',
          'hover:bg-muted/40',
        )}
      >
        {/* Key */}
        <div className='flex-1 font-mono text-sm'>
          {secret.name}
          {secret.usage_count > 0 && (
            <span className='ml-2 text-xs text-muted-foreground'>
              ({secret.usage_count} use{secret.usage_count !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Editor */}
        {editing && (
          <div className='flex flex-1 items-center gap-2'>
            <Input
              type={visible ? 'text' : 'password'}
              value={value}
              disabled={saving}
              placeholder='Enter new value'
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />

            <Button
              size='icon'
              variant='ghost'
              disabled={saving}
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </Button>

            <Button size='sm' onClick={save} disabled={saving}>
              Save
            </Button>
          </div>
        )}

        {/* Hover actions */}
        {!editing && (
          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100'>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => setEditing(true)}
            >
              <Pencil className='h-4 w-4' />
            </Button>

            <Button
              size='icon'
              variant='ghost'
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className='h-4 w-4 text-destructive' />
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <DeleteSecretDialog
        secret={secret}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={onDeleted}
      />
    </>
  );
}
