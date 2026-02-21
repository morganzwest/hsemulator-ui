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
import { Eye, EyeOff, Plus, AlertCircle, HelpCircle } from 'lucide-react';
import { createSecret, CICD_ERROR_TYPES } from '~/lib/settings/secrets';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ErrorNotice,
  WarningNotice,
} from '@/components/settings/settings-notice';

const MAX_DESC_LENGTH = 128;

export function NewSecretRow({ portalId, onCreated, secrets = [] }) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('portal');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Check if a CICD secret already exists
  const hasCicdSecret = secrets.some((secret) => secret.scope === 'cicd');

  // Validate key input - only allow letters and underscores
  const handleKeyChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Only allow letters (A-Z) and underscores
    const sanitized = value.replace(/[^A-Z_]/g, '');
    setName(sanitized);
  };

  async function save() {
    if (saving) return;

    // Clear previous errors
    setError(null);
    setShowGuidance(false);

    const key = name.trim().toUpperCase();
    const val = value.trim();
    const desc = description.trim();

    if (!key || !val) return;
    if (!portalId) throw new Error('portalId is required');
    if (desc.length > MAX_DESC_LENGTH) return;

    // Prevent creating CICD secret if one already exists
    if (scope === 'cicd' && hasCicdSecret) {
      toast.error('Only one CICD secret is allowed per portal');
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

      // Show success toast
      toast.success('Secret created successfully');
    } catch (error) {
      console.error('[NewSecretRow] Error creating secret:', error);

      // Set error state for inline display and show guidance immediately
      setError(error);
      setShowGuidance(true);

      // Show appropriate toast notification based on error type
      if (error.type === CICD_ERROR_TYPES.INVALID_SECRET) {
        toast.error(error.message, {
          description: 'See below for detailed guidance',
        });
      } else if (error.type === CICD_ERROR_TYPES.MISSING_SCOPE) {
        toast.error(error.message, {
          description: 'Contact your administrator for help',
        });
      } else {
        toast.error(error.message || 'Failed to create secret');
      }
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
          onChange={handleKeyChange}
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

      {/* Inline Error Notices */}
      {error &&
        scope === 'cicd' &&
        (error.type === CICD_ERROR_TYPES.MISSING_SCOPE ? (
          <WarningNotice
            title={error.message}
            description={error.guidance}
            action={
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  // Open help guide - you can customize this URL
                  window.open(
                    'https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview',
                    '_blank',
                  );
                }}
                className='text-xs'
              >
                Help Guide
              </Button>
            }
          />
        ) : (
          <ErrorNotice
            title={error.message}
            description={error.guidance}
            action={
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  // Open help guide - you can customize this URL
                  window.open(
                    'https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview',
                    '_blank',
                  );
                }}
                className='text-xs'
              >
                Help Guide
              </Button>
            }
          />
        ))}

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
