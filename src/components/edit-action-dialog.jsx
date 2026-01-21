'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { updateAction } from '@/lib/actions/update-action'

export function EditActionDialog({ action, open, onOpenChange }) {
  const supabase = createSupabaseBrowserClient()

  const [name, setName] = useState(action.title)
  const [description, setDescription] = useState(action.description)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      await updateAction({
        supabase,
        actionId: action.id,
        name,
        description,
      })
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit action</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              maxLength={64}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Locked fields */}
          <div className="rounded-md border bg-muted/30 p-3 text-xs">
            <p className="font-medium">Locked settings</p>
            <p className="text-muted-foreground">
              Language, runtime, and files cannot be changed after creation.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={loading || !name || !description}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
