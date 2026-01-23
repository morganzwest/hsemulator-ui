'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Braces, Terminal, AlertTriangle } from 'lucide-react'

/* -------------------------------------
   Language radio
------------------------------------- */

function LanguageRadio({ value, selected, onSelect }) {
  const Icon = value === 'javascript' ? Braces : Terminal

  return (
    <Card
      onClick={() => onSelect(value)}
      className={cn(
        'cursor-pointer p-4 transition border',
        selected
          ? 'border-primary ring-2 ring-primary'
          : 'hover:border-primary/40',
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span className="font-medium capitalize">{value}</span>
      </div>
    </Card>
  )
}

/* -------------------------------------
   Confirm dialog
------------------------------------- */

export function ConfirmTemplateDialog({
  open,
  onOpenChange,
  template,
  onConfirm,

  /* -------- Optional overrides -------- */

  title = 'Confirm creation?',
  description,
  confirmLabel = 'Create action',
  confirmLoadingLabel = 'Creating…',
  cancelLabel = 'Cancel',

  /**
   * default | destructive
   */
  variant = 'default',

  /**
   * If false, language selection is skipped entirely
   * (forced to false for destructive actions)
   */
  requireLanguage = true,
}) {
  const [language, setLanguage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isDestructive = variant === 'destructive'
  const effectiveRequireLanguage =
    isDestructive ? false : requireLanguage

  /* -----------------------------
     Reset state on open/template
  ----------------------------- */

  useEffect(() => {
    if (!template) return

    if (
      effectiveRequireLanguage &&
      template.languages?.length === 1
    ) {
      setLanguage(template.languages[0])
    } else {
      setLanguage(null)
    }

    setSubmitting(false)
  }, [template, open, effectiveRequireLanguage])

  if (!template) return null

  const canConfirm =
    !submitting &&
    (!effectiveRequireLanguage || !!language)

  function handleConfirm() {
    if (submitting) return
    setSubmitting(true)

    onConfirm(
      effectiveRequireLanguage ? language : undefined,
    )
  }

  /* -----------------------------
     Description resolution
  ----------------------------- */

  const resolvedDescription =
    typeof description === 'function'
      ? description(template)
      : description ?? (
          <>
            This will create a new action from the template
            <span className="font-medium">
              {' '}
              {template.name}
            </span>
            .
          </>
        )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle
            className={cn(
              isDestructive && 'text-destructive',
            )}
          >
            {title}
          </DialogTitle>

          <DialogDescription>
            {resolvedDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Destructive warning */}
        {isDestructive && (
          <div className="mt-4 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div>
              <div className="font-medium text-destructive">
                This action is permanent
              </div>
              <div className="text-muted-foreground">
                This cannot be undone. All associated data will
                be removed.
              </div>
            </div>
          </div>
        )}

        {/* Language selection (optional) */}
        {effectiveRequireLanguage &&
          template.languages?.length > 1 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">
                Choose language
              </div>

              <div className="grid grid-cols-2 gap-3">
                {template.languages.map((lang) => (
                  <LanguageRadio
                    key={lang}
                    value={lang}
                    selected={language === lang}
                    onSelect={setLanguage}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {submitting
              ? confirmLoadingLabel
              : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
