// new-secret-row.jsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { createSecret } from '~/lib/settings/secrets';
import { cn } from '@/lib/utils';

const MAX_DESC_LENGTH = 128;

export function NewSecretRow({ portalId, onCreated, secrets = [] }) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('portal');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if a CICD secret already exists
  const hasCicdSecret = secrets.some((secret) => secret.scope === 'cicd');

  async function save() {
    if (saving) return;

    const key = name.trim().toUpperCase();
    const val = value.trim();
    const desc = description.trim();

    if (!key || !val) return;
    if (!portalId) throw new Error('portalId is required');
    if (desc.length > MAX_DESC_LENGTH) return;

    // Prevent creating CICD secret if one already exists
    if (scope === 'cicd' && hasCicdSecret) {
      alert('Only one CICD secret is allowed per portal');
      return;
    }

    setSaving(true);

    try {
      const res = await createSecret({
        scope,
        portal_id: portalId,
        name: key,
        value: val,
        description: desc || null,
      });

      onCreated({
        id: res.secret_id,
        name: key,
        description: desc || null,
        scope,
        action_id: null,
      });

      setName('');
      setValue('');
      setDescription('');
      setVisible(false);
    } catch (error) {
      console.error('[NewSecretRow] Error creating secret:', error);
      alert(`Failed to create secret: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='rounded-md border border-dashed p-3 space-y-2'>
      <div className='flex items-center gap-3 mb-0'>
        <Select value={scope} onValueChange={setScope} disabled={saving}>
          <SelectTrigger className='w-30'>
            <SelectValue placeholder='Scope' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='cicd' disabled={hasCicdSecret}>
              CICD {hasCicdSecret && '(already exists)'}
            </SelectItem>
            <SelectItem value='portal'>Portal</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder='KEY_NAME'
          value={name}
          disabled={saving}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          className='font-mono'
        />

        <Input
          type={visible ? 'text' : 'password'}
          placeholder='Value'
          value={value}
          disabled={saving}
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

        <Button size='icon' onClick={save} disabled={saving}>
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      {/* TODO: Add Description input to DB and API route */}
      {/* Description */}
      {/* <div className='space-y-1'>
        <Input
          placeholder='Description (optional)'
          value={description}
          disabled={saving}
          maxLength={MAX_DESC_LENGTH}
          onChange={(e) => setDescription(e.target.value)}
          className={cn(
            description.length === MAX_DESC_LENGTH &&
              'border-destructive focus-visible:ring-destructive',
          )}
        />

        <div className='flex justify-between text-xs text-muted-foreground'>
          <span>Optional, shown only in settings</span>
          <span>
            {description.length}/{MAX_DESC_LENGTH}
          </span>
        </div>
      </div> */}
    </div>
  );
}
