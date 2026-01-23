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
import { Toggle } from '@/components/ui/toggle'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

import {
  Braces,
  Terminal,
  Webhook,
  Building2,
  UserPlus,
  ChevronDown,
  Lock,
  Globe,
  Search,
} from 'lucide-react'

import { createActionFromTemplate } from '@/lib/actions/create-template'
import { ConfirmTemplateDialog } from '@/components/confirm-template-dialog'

/* -------------------------------------
   Supabase client
------------------------------------- */

const supabase = createSupabaseBrowserClient()

/* -------------------------------------
   Constants
------------------------------------- */

const SHOW_COMMUNITY_KEY = 'templates:show-community'

const DEFAULT_FILTERS = {
  languageFilter: 'all',
  objectFilter: 'ALL',
  categoryFilter: 'ALL',
  sortBy: 'name_asc',
  search: '',
  showCommunity: true,
}

/* -------------------------------------
   Icon map
------------------------------------- */

const ICON_MAP = {
  'create-deal': Building2,
  'update-contact': UserPlus,
  'sync-company': Building2,
  'webhook-forwarder': Webhook,
}

/* -------------------------------------
   Helpers
------------------------------------- */

function extractObjectType(eventJson) {
  const raw = eventJson?.object?.objectType
  if (!raw) return null
  if (raw.startsWith('p')) return 'CUSTOM'
  return raw.toUpperCase()
}

function sortTemplates(list, sortBy) {
  switch (sortBy) {
    case 'name_asc':
      return [...list].sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return [...list].sort((a, b) => b.name.localeCompare(a.name))
    case 'newest':
      return [...list].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      )
    case 'oldest':
      return [...list].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      )
    default:
      return list
  }
}

/* -------------------------------------
   Dropdown (width-locked)
------------------------------------- */

function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.id === value)

  return (
    <div className="relative">
      {/* Width anchor */}
      <span
        className="invisible absolute whitespace-nowrap px-3 py-1.5 text-sm"
        aria-hidden
      >
        {options.reduce(
          (longest, o) =>
            o.label.length > longest.length ? o.label : longest,
          '',
        )}
      </span>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-full items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted"
      >
        <span>{current?.label}</span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-full rounded-md border bg-popover shadow">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id)
                setOpen(false)
              }}
              className="flex w-full items-center px-3 py-2 text-sm hover:bg-muted"
            >
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
      onClick={() => onSelect(template)}
      tabIndex={0}
      className={cn(
        'group cursor-pointer p-4 transition-all',
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
      </div>
    </Card>
  )
}

/* -------------------------------------
   Section
------------------------------------- */

function TemplateSection({ title, templates, empty, onSelect }) {
  return (
    <div className="space-y-3">
      <div className="px-1 text-xs font-medium uppercase text-muted-foreground">
        {title}
      </div>

      {templates.length === 0 ? (
        <div className="px-1 text-sm text-muted-foreground">
          {empty}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------
   Templates sheet
------------------------------------- */

export function TemplatesSheet({ open, onOpenChange, portalId }) {
  const [userId, setUserId] = useState(null)

  const [languageFilter, setLanguageFilter] = useState(DEFAULT_FILTERS.languageFilter)
  const [objectFilter, setObjectFilter] = useState(DEFAULT_FILTERS.objectFilter)
  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_FILTERS.categoryFilter)
  const [sortBy, setSortBy] = useState(DEFAULT_FILTERS.sortBy)
  const [search, setSearch] = useState(DEFAULT_FILTERS.search)
  const [showCommunity, setShowCommunity] = useState(DEFAULT_FILTERS.showCommunity)

  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  /* -----------------------------
     Reset filters
  ----------------------------- */

  function resetFilters() {
    setLanguageFilter(DEFAULT_FILTERS.languageFilter)
    setObjectFilter(DEFAULT_FILTERS.objectFilter)
    setCategoryFilter(DEFAULT_FILTERS.categoryFilter)
    setSortBy(DEFAULT_FILTERS.sortBy)
    setSearch(DEFAULT_FILTERS.search)
    setShowCommunity(DEFAULT_FILTERS.showCommunity)

    localStorage.setItem(
      SHOW_COMMUNITY_KEY,
      String(DEFAULT_FILTERS.showCommunity),
    )
  }

  /* -----------------------------
     Load user
  ----------------------------- */

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null)
    })
  }, [])

  /* -----------------------------
     Load templates
  ----------------------------- */

  useEffect(() => {
    if (!open) return

    async function loadTemplates() {
      setLoading(true)

      const { data } = await supabase
        .from('action_templates')
        .select(
          `
          id,
          slug,
          name,
          description,
          languages,
          visibility,
          category,
          created_at,
          event_json
        `,
        )

      setTemplates(
        (data ?? []).map((t) => ({
          ...t,
          icon: ICON_MAP[t.slug],
          objectType: extractObjectType(t.event_json),
        })),
      )

      setLoading(false)
    }

    loadTemplates()
  }, [open])

  /* -----------------------------
     Derived categories
  ----------------------------- */

  const categories = useMemo(() => {
    return Array.from(
      new Set(templates.map((t) => t.category).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
  }, [templates])

  /* -----------------------------
     Filtering
  ----------------------------- */

  const filtered = useMemo(() => {
    let list = templates.filter((t) => {
      if (
        search &&
        !`${t.name} ${t.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false

      if (
        languageFilter !== 'all' &&
        !t.languages.includes(languageFilter)
      )
        return false

      if (
        objectFilter !== 'ALL' &&
        t.objectType !== objectFilter
      )
        return false

      if (
        categoryFilter !== 'ALL' &&
        t.category !== categoryFilter
      )
        return false

      return true
    })

    return sortTemplates(list, sortBy)
  }, [
    templates,
    languageFilter,
    objectFilter,
    categoryFilter,
    sortBy,
    search,
  ])

  const privateTemplates = filtered.filter(
    (t) => t.visibility === 'private',
  )
  const publicTemplates = filtered.filter(
    (t) => t.visibility === 'public',
  )

  const visibleCount =
    privateTemplates.length +
    (showCommunity ? publicTemplates.length : 0)

  /* -----------------------------
     Render
  ----------------------------- */

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

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Dropdown
              value={languageFilter}
              onChange={setLanguageFilter}
              options={[
                { id: 'all', label: 'All languages' },
                { id: 'javascript', label: 'JavaScript' },
                { id: 'python', label: 'Python' },
              ]}
            />

            <Dropdown
              value={objectFilter}
              onChange={setObjectFilter}
              options={[
                { id: 'ALL', label: 'All objects' },
                { id: 'CONTACT', label: 'Contact' },
                { id: 'DEAL', label: 'Deal' },
                { id: 'COMPANY', label: 'Company' },
                { id: 'TICKET', label: 'Ticket' },
                { id: 'SERVICE', label: 'Service' },
                { id: 'CUSTOM', label: 'Custom' },
              ]}
            />

            <Dropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { id: 'ALL', label: 'All categories' },
                ...categories.map((c) => ({
                  id: c,
                  label: c,
                })),
              ]}
            />

            <Dropdown
              value={sortBy}
              onChange={setSortBy}
              options={[
                { id: 'name_asc', label: 'Name (A–Z)' },
                { id: 'name_desc', label: 'Name (Z–A)' },
                { id: 'newest', label: 'Newest first' },
                { id: 'oldest', label: 'Oldest first' },
              ]}
            />

            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Toggle
              pressed={showCommunity}
              onPressedChange={setShowCommunity}
              className="flex items-center gap-2"
            >
              {showCommunity ? (
                <>
                  <Globe className="h-4 w-4" />
                  Community
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Yours only
                </>
              )}
            </Toggle>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Reset filters"
            >
              ✕
            </button>
            
              <span className="tabular-nums text-xs">
                {visibleCount} templates found
              </span>
          </div>

          {/* Content */}
          <div className="mt-6 flex-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-10 pb-6">
                {loading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading templates…
                  </div>
                ) : (
                  <>
                    <TemplateSection
                      title="Your Templates"
                      templates={privateTemplates}
                      empty="You haven’t created any templates yet."
                      onSelect={(t) => {
                        setSelectedTemplate(t)
                        setConfirmOpen(true)
                      }}
                    />

                    {showCommunity && (
                      <TemplateSection
                        title="Community Templates"
                        templates={publicTemplates}
                        empty="No community templates available."
                        onSelect={(t) => {
                          setSelectedTemplate(t)
                          setConfirmOpen(true)
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmTemplateDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        template={selectedTemplate}
        onConfirm={async (language) => {
          if (!userId) return

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
