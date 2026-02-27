'use client';

import { useEffect } from 'react';
import { SettingsPage } from '../settings-page';
import { useSettingsContext as useSettings } from '@/lib/settings/settings-provider';
import { cn } from '@/lib/utils';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

import {
  setMonacoTheme,
  configureMonacoThemes,
} from '@/lib/editor/register-themes';

import { Minus, Plus, RotateCcw } from 'lucide-react';

/* -------------------------------------
   Defaults
------------------------------------- */

const EDITOR_DEFAULTS = {
  'editor.fontSize': 14,
  'editor.lineHeight': 22,
  'editor.theme': 'github-dark',
  'editor.minimap': false,
  'editor.wordWrap': false,
  'editor.smoothScrolling': true,
  'editor.renderWhitespace': false,
  'editor.bracketColorization': true,
  'editor.validateThemes': true,
};

/* -------------------------------------
   Theme metadata (UI only)
------------------------------------- */

const THEMES = [
  { id: 'githubdark', name: 'GitHub Dark', color: '#0d1117' },
  { id: 'monokai', name: 'Monokai', color: '#272822' },
  { id: 'dracula', name: 'Dracula', color: '#282a36' },
  { id: 'nightowl', name: 'Night Owl', color: '#011627' },

  { id: 'oceanicnext', name: 'Oceanic Next', color: '#1b2b34' },
  { id: 'cobalt2', name: 'Cobalt', color: '#193549' },
  { id: 'solarizeddark', name: 'Solarized Dark', color: '#002b36' },

  { id: 'merbivore', name: 'Merbivore', color: '#161616' },
  { id: 'monoindustrial', name: 'Mono Industrial', color: '#263238' },
  { id: 'amy', name: 'Amy', color: '#200020' },

  { id: 'github', name: 'GitHub Light', color: '#ffffff' },
  { id: 'merbivoresoft', name: 'High Contrast', color: '#000000' },
];

const VALID_THEMES = new Set(THEMES.map((t) => t.id));

/* -------------------------------------
   Stepper
------------------------------------- */

function Stepper({ value, min, max, step = 1, onChange }) {
  return (
    <div className='flex items-center gap-1'>
      <Button
        variant='outline'
        size='icon'
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
      >
        <Minus className='h-3 w-3' />
      </Button>

      <Input
        type='number'
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, Number(e.target.value))))
        }
        className='w-20 text-center'
      />

      <Button
        variant='outline'
        size='icon'
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
      >
        <Plus className='h-3 w-3' />
      </Button>
    </div>
  );
}

/* -------------------------------------
   Toggle row (composition only)
------------------------------------- */

function CheckboxRow({ label, description, checked, onCheckedChange }) {
  function toggle() {
    onCheckedChange(!checked);
  }

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-md border p-4 transition-colors',
        'hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'border-primary bg-accent/40' : 'border-border',
      )}
    >
      {/* Left: text only */}
      <div className='flex-1 space-y-1'>
        <Label className='cursor-pointer text-sm font-medium'>{label}</Label>

        {description && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}
      </div>

      {/* Right: checkbox pinned to edge */}
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        onClick={(e) => e.stopPropagation()}
        aria-label={label}
        className='shrink-0 scale-110'
      />
    </div>
  );
}

/* -------------------------------------
   Page
------------------------------------- */

export function EditorSettingsPage() {
  const { settings, set } = useSettings();

  /* ---------------------------------
     Theme validation config
  --------------------------------- */

  useEffect(() => {
    configureMonacoThemes({
      validate: settings['editor.validateThemes'],
    });
  }, [settings['editor.validateThemes']]);

  /* ---------------------------------
     Apply theme changes
  --------------------------------- */

  useEffect(() => {
    const theme = settings['editor.theme'];
    if (!VALID_THEMES.has(theme)) return;
    if (!window?.monaco) return;

    setMonacoTheme(window.monaco, theme);
  }, [settings['editor.theme']]);

  function resetToDefaults() {
    for (const [key, value] of Object.entries(EDITOR_DEFAULTS)) {
      set(key, value);
    }
  }

  return (
    <SettingsPage
      title='Editor'
      description='Control the appearance and behaviour of the code editor.'
    >
      <section className='space-y-4'>
        {/* Theme */}
        <section className='space-y-6 rounded-lg border p-4 md:p-6'>
          <div className='space-y-1'>
            <h3 className='text-sm font-semibold'>Theme</h3>
          </div>

          <div className='space-y-4'>
            <div className='grid gap-3 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]'>
              {THEMES.map((theme) => {
                const active = settings['editor.theme'] === theme.id;

                return (
                  <button
                    key={theme.id}
                    onClick={() => set('editor.theme', theme.id)}
                    className={cn(
                      'group flex items-center gap-3 rounded-md border p-3 text-left transition',
                      'hover:border-muted-foreground/40 hover:shadow-sm',
                      active &&
                        'border-primary ring-2 ring-primary scale-[1.01]',
                    )}
                  >
                    <div
                      className='relative h-9 w-9 shrink-0 rounded-md border overflow-hidden'
                      style={{ backgroundColor: theme.color }}
                    />

                    <div className='min-w-0'>
                      <span className='block truncate text-sm font-medium'>
                        {theme.name}
                      </span>
                      {/* <span className='text-xs text-muted-foreground'>
                        {theme.id}
                      </span> */}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className='space-y-6 rounded-lg border p-4 md:p-6'>
          <div className='space-y-1'>
            <h3 className='text-sm font-semibold'>Typography</h3>
          </div>

          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center'>
              <Label>Font size</Label>
              <Stepper
                value={settings['editor.fontSize']}
                min={12}
                max={22}
                onChange={(v) => set('editor.fontSize', v)}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center'>
              <Label>Line height</Label>
              <Stepper
                value={settings['editor.lineHeight']}
                min={18}
                max={32}
                step={2}
                onChange={(v) => set('editor.lineHeight', v)}
              />
            </div>
          </div>
        </section>

        {/* Behaviour */}
        <section className='space-y-6 rounded-lg border p-4 md:p-6'>
          <div className='space-y-1'>
            <h3 className='text-sm font-semibold'>Behaviour</h3>
          </div>

          <div className='space-y-4'>
            <div className='grid gap-3 md:grid-cols-2'>
              <CheckboxRow
                label='Minimap'
                description='Show a code overview on the right-hand side'
                checked={settings['editor.minimap']}
                onCheckedChange={(v) => set('editor.minimap', !!v)}
              />

              <CheckboxRow
                label='Word wrap'
                description='Wrap long lines instead of horizontal scrolling'
                checked={settings['editor.wordWrap']}
                onCheckedChange={(v) => set('editor.wordWrap', !!v)}
              />

              <CheckboxRow
                label='Smooth scrolling'
                description='Animate vertical scrolling'
                checked={settings['editor.smoothScrolling']}
                onCheckedChange={(v) => set('editor.smoothScrolling', !!v)}
              />

              <CheckboxRow
                label='Render whitespace'
                description='Visualise spaces and tabs'
                checked={settings['editor.renderWhitespace']}
                onCheckedChange={(v) => set('editor.renderWhitespace', !!v)}
              />
            </div>
          </div>
        </section>

        {/* Reset */}
        <div className='flex justify-end'>
          <Button variant='outline' size='sm' onClick={resetToDefaults}>
            <RotateCcw className='mr-2 h-4 w-4' />
            Reset to defaults
          </Button>
        </div>
      </section>
    </SettingsPage>
  );
}
