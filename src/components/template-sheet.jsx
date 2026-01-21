'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

import {
  Braces,
  Terminal,
  Webhook,
  Building2,
  UserPlus,
  ChevronDown,
} from 'lucide-react'

import { createActionFromTemplate } from '@/lib/actions/create-template'
import { ConfirmTemplateDialog } from '@/components/confirm-template-dialog'

/* -------------------------------------
   Supabase client (CREATE ONCE)
------------------------------------- */

const supabase = createSupabaseBrowserClient()

/* -------------------------------------
   Icon map (controlled, safe)
------------------------------------- */

const ICON_MAP = {
  'create-deal': Building2,
  'update-contact': UserPlus,
  'sync-company': Building2,
  'webhook-forwarder': Webhook,
}

/* -------------------------------------
   Language icon
------------------------------------- */

function LanguageIcon({ lang }) {
  if (lang === 'javascript')
    return <Braces className="h-3.5 w-3.5 text-yellow-500" />

  if (lang === 'python')
    return <Terminal className="h-3.5 w-3.5 text-blue-500" />

  return null
}

/* -------------------------------------
   Tag badge
------------------------------------- */

function TagBadge({ tag }) {
  if (!tag) return null

  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    pink: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        colorMap[tag.color] ?? colorMap.blue,
      )}
    >
      {tag.name}
    </span>
  )
}

/* -------------------------------------
   Language filter dropdown
------------------------------------- */

function LanguageFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)

  const options = [
    { id: 'all', label: 'All Languages' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
  ]

  const current = options.find((o) => o.id === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted"
      >
        {value !== 'all' && <LanguageIcon lang={value} />}
        <span>{current?.label}</span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-popover shadow">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
            >
              {opt.id !== 'all' && <LanguageIcon lang={opt.id} />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------
   Template card
------------------------------------- */

function TemplateCard({ template, onSelect }) {
  const Icon = template.icon ?? Building2

  return (
    <Card
      onClick={() => onSelect?.(template)}
      tabIndex={0}
      className={cn(
        'group relative cursor-pointer p-4 transition-all',
        'hover:-translate-y-0.5 hover:shadow-md',
        'hover:border-primary/40',
        'focus-visible:ring-2 focus-visible:ring-primary',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex p-2 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h4 className="text-sm font-semibold leading-tight">
              {template.name}
            </h4>

            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>

        <TagBadge tag={template.tag} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {template.languages.map((lang) => (
            <div
              key={lang}
              className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground"
            >
              <LanguageIcon lang={lang} />
              <span className="capitalize">{lang}</span>
            </div>
          ))}
        </div>

        <span className="text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
          Select →
        </span>
      </div>
    </Card>
  )
}

/* -------------------------------------
   Templates sheet (DB-backed)
------------------------------------- */

export function TemplatesSheet({ open, onOpenChange, portalId }) {
  const [userId, setUserId] = useState(null)

  const [languageFilter, setLanguageFilter] = useState('all')
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // Hard guard to prevent repeated fetches (even in StrictMode dev double-effect)
  const userLoadedRef = useRef(false)

  /* -----------------------------
     Load authenticated user ONCE
  ----------------------------- */

  useEffect(() => {
    if (userLoadedRef.current) return
    userLoadedRef.current = true

    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error('[TemplatesSheet] Failed to get user', error)
        setUserId(null)
        return
      }
      setUserId(data?.user?.id ?? null)
    })

    // Optional: keep userId in sync without re-fetching
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => {
      sub?.subscription?.unsubscribe()
    }
  }, [])

  /* -----------------------------
     Load templates when opened
  ----------------------------- */

  useEffect(() => {
    if (!open) return

    async function loadTemplates() {
      setLoading(true)

      const { data, error } = await supabase
        .from('action_templates')
        .select(
          `
          id,
          slug,
          name,
          description,
          languages,
          tag_name,
          tag_color,
          js_action,
          py_action,
          event_json,
          config_yaml_js,
          config_yaml_py
        `,
        )
        .order('name')

      if (error) {
        console.error('[TemplatesSheet] Failed to load templates', error)
        setTemplates([])
      } else {
        setTemplates(
          (data ?? []).map((t) => ({
            ...t,
            icon: ICON_MAP[t.slug],
            tag: t.tag_name
              ? { name: t.tag_name, color: t.tag_color }
              : null,
          })),
        )
      }

      setLoading(false)
    }

    loadTemplates()
  }, [open])

  const filteredTemplates = useMemo(() => {
    if (languageFilter === 'all') return templates
    return templates.filter((t) =>
      t.languages.includes(languageFilter),
    )
  }, [templates, languageFilter])

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full min-w-[75vw] p-6">
          <SheetHeader>
            <SheetTitle>Templates</SheetTitle>
            <SheetDescription>
              Start from a pre-built action template and customise it for
              your workflow.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 flex items-center justify-between">
            <LanguageFilter
              value={languageFilter}
              onChange={setLanguageFilter}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading templates…
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={(t) => {
                    setSelectedTemplate(t)
                    setConfirmOpen(true)
                  }}
                />
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmTemplateDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        template={selectedTemplate}
        onConfirm={async (language) => {
          if (!userId) {
            console.error('[TemplatesSheet] No authenticated user')
            return
          }

          await createActionFromTemplate({
            supabase,
            ownerId: userId,
            portalId,
            template: selectedTemplate,
            language,
            name: selectedTemplate.name,
            description: selectedTemplate.description,
          })

          setConfirmOpen(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
