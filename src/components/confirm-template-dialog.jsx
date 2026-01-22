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
import { Braces, Terminal } from 'lucide-react'

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

export function ConfirmTemplateDialog({
  open,
  onOpenChange,
  template,
  onConfirm,
}) {
  const [language, setLanguage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!template) return

    if (template.languages.length === 1) {
      setLanguage(template.languages[0])
    } else {
      setLanguage(null)
    }

    // reset when template or dialog changes
    setSubmitting(false)
  }, [template, open])

  if (!template) return null

  const canConfirm = !!language && !submitting

  function handleConfirm() {
    if (submitting) return
    setSubmitting(true)
    onConfirm(language)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Confirm creation?</DialogTitle>
          <DialogDescription>
            This will create a new action from the template
            <span className="font-medium"> {template.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {template.languages.length > 1 && (
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

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {submitting ? 'Creating…' : 'Create action'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
