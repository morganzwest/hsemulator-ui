'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { deleteAction } from '@/lib/actions/delete-action'
import { useState } from 'react'

export function DeleteActionDialog({ action, open, onOpenChange }) {
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteAction({
        supabase,
        ownerId: action.owner_id,
        actionId: action.id,
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
          <DialogTitle>Delete action</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          This will permanently delete <strong>{action.title}</strong>.
          This action cannot be undone.
        </p>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
