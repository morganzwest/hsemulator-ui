'use client'

import { useEffect } from 'react'
import { SettingsPage } from '../settings-page'
import { useSettings } from '@/lib/settings/use-settings'
import { cn } from '@/lib/utils'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import {
  setMonacoTheme,
  configureMonacoThemes,
} from '@/lib/editor/register-themes'

import { Minus, Plus, RotateCcw } from 'lucide-react'

/* -------------------------------------
   Defaults
------------------------------------- */

const EDITOR_DEFAULTS = {
  'editor.fontSize': 14,
  'editor.lineHeight': 22,
  'editor.theme': 'vs-dark',
  'editor.minimap': false,
  'editor.wordWrap': false,
  'editor.smoothScrolling': true,
  'editor.renderWhitespace': false,
  'editor.bracketColorization': true,
  'editor.validateThemes': true,
}

/* -------------------------------------
   Theme metadata (UI only)
------------------------------------- */

const THEMES = [
  // Most popular / default expectations
  { id: 'github-dark', name: 'GitHub Dark', color: '#0d1117' }, // GitHub Dark default bg
  { id: 'monokai', name: 'Monokai', color: '#272822' },        // Classic Monokai
  { id: 'dracula', name: 'Dracula', color: '#282a36' },        // Dracula bg
  { id: 'night-owl', name: 'Night Owl', color: '#011627' },    // Night Owl deep navy

  // Popular but slightly more opinionated
  { id: 'oceanic-next', name: 'Oceanic Next', color: '#1b2b34' }, // Oceanic Next bg
  { id: 'cobalt2', name: 'Cobalt 2', color: '#193549' },          // Cobalt 2 deep blue
  { id: 'solarized-dark', name: 'Solarized Dark', color: '#002b36' }, // Solarized base03

  // Niche / stylistic
  { id: 'merbivore', name: 'Merbivore', color: '#161616' },        // Near-black Merbivore
  { id: 'monoindustrial', name: 'Mono Industrial', color: '#263238' }, // Industrial blue-grey
  { id: 'amy', name: 'Amy', color: '#200020' },                    // Amy purple-black

  // Light + accessibility
  { id: 'github', name: 'GitHub Light', color: '#ffffff' },        // GitHub Light bg
  { id: 'merbivore-soft', name: 'High Contrast', color: '#000000' }, // True black for HC
]



const VALID_THEMES = new Set(THEMES.map(t => t.id))

/* -------------------------------------
   Stepper
------------------------------------- */

function Stepper({ value, min, max, step = 1, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>

      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, Number(e.target.value))))
        }
        className="w-20 text-center"
      />

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}

/* -------------------------------------
   Page
------------------------------------- */



export function EditorSettingsPage() {
  const { settings, set } = useSettings()

  /* ---------------------------------
     Theme validation config
  --------------------------------- */

  useEffect(() => {
    configureMonacoThemes({
      validate: settings['editor.validateThemes'],
    })
  }, [settings['editor.validateThemes']])

  /* ---------------------------------
     Apply theme changes
  --------------------------------- */

  useEffect(() => {
    const theme = settings['editor.theme']
    if (!VALID_THEMES.has(theme)) return
    if (!window?.monaco) return

    setMonacoTheme(window.monaco, theme)
  }, [settings['editor.theme']])

  function resetToDefaults() {
    for (const [key, value] of Object.entries(EDITOR_DEFAULTS)) {
      set(key, value)
    }
  }

  return (
    <SettingsPage
      title="Editor"
      description="Control the appearance and behaviour of the code editor."
    >
      <section className="space-y-10">

        {/* Typography */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold">Typography</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Font size</Label>
              <Stepper
                value={settings['editor.fontSize']}
                min={12}
                max={22}
                onChange={(v) => set('editor.fontSize', v)}
              />
            </div>

            <div className="flex items-center justify-between">
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
        </div>

        {/* Theme */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Theme</h3>

          <div className="grid grid-cols-4 gap-3">
            {THEMES.map((theme) => {
              const active = settings['editor.theme'] === theme.id

              return (
                <button
                  key={theme.id}
                  onClick={() => set('editor.theme', theme.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-md border p-3 text-left transition',
                    active
                      ? 'border-primary ring-2 ring-primary'
                      : 'hover:border-muted-foreground/40'
                  )}
                >
                  <div
                    className="h-8 w-8 rounded-md border"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-sm font-medium">
                    {theme.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Behaviour */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Behaviour</h3>

          <Toggle
            label="Minimap"
            value={settings['editor.minimap']}
            onChange={(v) => set('editor.minimap', v)}
          />

          <Toggle
            label="Word wrap"
            value={settings['editor.wordWrap']}
            onChange={(v) => set('editor.wordWrap', v)}
          />

          <Toggle
            label="Smooth scrolling"
            value={settings['editor.smoothScrolling']}
            onChange={(v) => set('editor.smoothScrolling', v)}
          />

          <Toggle
            label="Render whitespace"
            value={settings['editor.renderWhitespace']}
            onChange={(v) => set('editor.renderWhitespace', v)}
          />

          {/* <Toggle
            label="Bracket pair colorization"
            value={settings['editor.bracketColorization']}
            onChange={(v) =>
              set('editor.bracketColorization', v)
            }
          /> */}

          {/* <Toggle
            label="Validate editor themes"
            value={settings['editor.validateThemes']}
            onChange={(v) => set('editor.validateThemes', v)}
          /> */}
        </div>

        {/* Reset */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset editor settings
          </Button>
        </div>
      </section>
    </SettingsPage>
  )
}

/* -------------------------------------
   Small helper
------------------------------------- */

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={!!value} onCheckedChange={onChange} />
    </div>
  )
}
