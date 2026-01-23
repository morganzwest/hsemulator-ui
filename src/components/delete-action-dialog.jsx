'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { deleteAction } from '@/lib/actions/delete-action'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DeleteActionDialog({ action, open, onOpenChange }) {
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [confirmValue, setConfirmValue] = useState('')

  /**
   * Generate a short-lived confirmation code
   * Regenerates every time the dialog opens
   */
  const confirmationCode = useMemo(() => {
    if (!open) return ''
    return Math.floor(100000 + Math.random() * 900000).toString()
  }, [open])

  const canDelete =
    confirmValue === confirmationCode && !loading && !!confirmationCode

  async function handleDelete() {
    if (!canDelete) return

    setLoading(true)
    try {
      await deleteAction({
        supabase,
        ownerId: action.owner_id,
        actionId: action.id,
      })

      onOpenChange(false)
      setConfirmValue('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setConfirmValue('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete action
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            You are about to permanently delete{' '}
            <span className="font-medium text-foreground">
              {action.title}
            </span>
            . All associated data will be removed.
          </p>

          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  This action is permanent
                </p>
                <p className="text-sm text-muted-foreground">
                  Please confirm carefully before continuing.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To confirm, type the number below:
            </p>

            {/* Code display (copy & select blocked) */}
            <div
              className="flex select-none items-center justify-center rounded-md border bg-muted px-3 py-2 font-mono text-sm tracking-[0.3em] text-foreground cursor-not-allowed"
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              {confirmationCode}
            </div>

            <Input
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter confirmation code"
              value={confirmValue}
              onChange={(e) => {
                // Allow numbers only
                const numeric = e.target.value.replace(/\D/g, '')
                setConfirmValue(numeric)
              }}
              onPaste={(e) => {
                // Block non-numeric paste
                const pasted = e.clipboardData.getData('text')
                if (!/^\d+$/.test(pasted)) {
                  e.preventDefault()
                }
              }}
              className={cn(
                'font-mono tracking-widest',
                confirmValue.length > 0 &&
                  confirmValue !== confirmationCode &&
                  'border-destructive/50 focus-visible:ring-destructive/40',
                confirmValue === confirmationCode &&
                  'border-emerald-500/50 focus-visible:ring-emerald-500/40',
              )}
            />

            {confirmValue && confirmValue !== confirmationCode && (
              <p className="text-xs text-muted-foreground">
                Code must match exactly to enable deletion.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!canDelete}
            onClick={handleDelete}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
