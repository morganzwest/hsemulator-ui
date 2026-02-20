// secret-row.jsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Globe,
  Zap,
  Settings,
} from 'lucide-react';
import { updateSecret } from '~/lib/settings/secrets';
import { cn } from '@/lib/utils';
import { DeleteSecretDialog } from './delete-secret-dialog';

function getScopeInfo(scope) {
  switch (scope) {
    case 'portal':
      return {
        icon: Globe,
        label: 'Portal',
        color: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
        description: 'Available to all actions within this portal',
      };
    case 'action':
      return {
        icon: Zap,
        label: 'Action',
        color: 'bg-green-900/50 text-green-300 border-green-700/50',
        description: 'Available only to specific actions',
      };
    case 'cicd':
      return {
        icon: Settings,
        label: 'CICD',
        color: 'bg-orange-900/50 text-orange-300 border-orange-700/50',
        description: 'Used for automating workflow updates and imports',
      };
    default:
      return {
        icon: Globe,
        label: 'Unknown',
        color: 'bg-gray-800/50 text-gray-400 border-gray-700/50',
        description: '',
      };
  }
}

export function SecretRow({ secret, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const scopeInfo = getScopeInfo(secret.scope);

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
    <TooltipProvider>
      <>
        <div
          className={cn(
            'group flex items-center gap-3 rounded-md border p-3',
            'hover:bg-muted/40',
          )}
        >
          {/* Key and Scope */}
          <div className='flex flex-1 items-center gap-3'>
            <div className='font-mono text-sm'>{secret.name}</div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
                    scopeInfo.color,
                  )}
                >
                  <scopeInfo.icon className='h-3 w-3' />
                  <span>{scopeInfo.label}</span>
                </div>
              </TooltipTrigger>
              {scopeInfo.description && (
                <TooltipContent>
                  <p className='text-xs max-w-xs'>{scopeInfo.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
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
    </TooltipProvider>
  );
}
