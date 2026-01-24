'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { createAction } from '@/lib/actions/create-action'
import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5'

function LanguageCard({ value, selected, onSelect, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'hover:bg-muted',
      )}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {value === 'javascript'
            ? 'Node.js execution environment'
            : 'Python runtime'}
        </span>
      </div>
    </button>
  )
}

export function CreateActionDialog({ open, onOpenChange, onCreated }) {
  const supabase = createSupabaseBrowserClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const action = await createAction({
        supabase,
        ownerId: user.id,
        name,
        description,
        language,
      })

      onCreated?.(action)
      onOpenChange(false)
      setName('')
      setDescription('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = name && description && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new action</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enrich contact"
              required
            />
            <p className="text-xs text-muted-foreground">
              Max 32 characters
            </p>
          </div>

          {/* Description (REQUIRED) */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              value={description}
              maxLength={64}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this action do?"
              required
            />
            <p className="text-xs text-muted-foreground">
              Required · Max 64 characters
            </p>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>Language</Label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <LanguageCard
                value="javascript"
                label="JavaScript"
                icon={IoLogoJavascript}
                selected={language === 'javascript'}
                onSelect={setLanguage}
              />

              <LanguageCard
                value="python"
                label="Python"
                icon={IoLogoPython}
                selected={language === 'python'}
                onSelect={setLanguage}
              />
            </div>
          </div>

          {/* Files */}
          <div className="rounded-md border bg-muted/30 p-3 text-xs">
            <div className="font-medium text-foreground">
              Files created automatically
            </div>
            <ul className="mt-1 list-disc pl-4 text-muted-foreground">
              <li>config.yaml (required)</li>
              <li>event.json (required)</li>
              <li>{language === 'javascript' ? 'action.js' : 'action.py'}</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleCreate}
            disabled={!canSubmit}
          >
            Create action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
