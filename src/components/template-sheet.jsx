'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { toast } from 'sonner';

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
  CodeXml,
} from 'lucide-react';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';

import { createActionFromTemplate } from '@/lib/actions/create-template';
import { ConfirmTemplateDialog } from '@/components/confirm-template-dialog';

/* -------------------------------------
   Supabase client
------------------------------------- */

const supabase = createSupabaseBrowserClient();

/* -------------------------------------
   Constants
------------------------------------- */

const SHOW_COMMUNITY_KEY = 'templates:show-community';

const DEFAULT_FILTERS = {
  languageFilter: 'all',
  objectFilter: 'ALL',
  categoryFilter: 'ALL',
  sortBy: 'name_asc',
  search: '',
  showCommunity: true,
};

/* -------------------------------------
   Icon map
------------------------------------- */

const ICON_MAP = {
  'create-deal': Building2,
  'update-contact': UserPlus,
  'sync-company': Building2,
  'webhook-forwarder': Webhook,
};

/* -------------------------------------
   Helpers
------------------------------------- */

function extractObjectType(eventJson) {
  const raw = eventJson?.object?.objectType;
  if (!raw) return null;
  if (raw.startsWith('p')) return 'CUSTOM';
  return raw.toUpperCase();
}

function sortTemplates(list, sortBy) {
  switch (sortBy) {
    case 'name_asc':
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return [...list].sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      return [...list].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    case 'oldest':
      return [...list].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );
    default:
      return list;
  }
}

/* -------------------------------------
   Dropdown (width-locked)
------------------------------------- */

function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value);

  return (
    <div className="relative">
      {/* Width anchor */}
      <span
        className="invisible absolute whitespace-nowrap px-3 py-1.5 text-sm"
        aria-hidden
      >
        {options.reduce(
          (longest, o) => (o.label.length > longest.length ? o.label : longest),
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
                onChange(opt.id);
                setOpen(false);
              }}
              className="flex w-full items-center px-3 py-2 text-sm hover:bg-muted"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------
   Template card
------------------------------------- */
function TemplateCard({ template, onSelect, onRequestDelete, userId }) {
  const Icon = template.icon ?? CodeXml;
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner =
    template.visibility === 'private' && template.created_by === userId;

  return (
    <ContextMenu open={menuOpen} onOpenChange={setMenuOpen}>
      {/* Card = left click action, right click menu */}
      <ContextMenuTrigger asChild>
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
              <div className="mt-0.5 flex items-center justify-center rounded-md bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <h4 className="text-sm font-semibold leading-tight">
                  {template.name}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
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
      </ContextMenuTrigger>

      {/* Context menu (right-click only) */}
      <ContextMenuContent onClick={(e) => e.stopPropagation()}>
        <ContextMenuItem
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(false);
            onSelect?.(template);
          }}
        >
          Create
        </ContextMenuItem>

        <ContextMenuItem disabled onSelect={(e) => e.preventDefault()}>
          Edit
        </ContextMenuItem>

        <ContextMenuItem
          disabled={!isOwner}
          className="text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(false);
            onRequestDelete?.(template);
          }}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function TagBadge({ tag }) {
  if (!tag) return null;

  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    pink: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        colorMap[tag.color] ?? colorMap.blue,
      )}
    >
      {tag.name}
    </span>
  );
}

function LanguageIcon({ lang }) {
  if (lang === 'javascript')
    return <Braces className="h-3.5 w-3.5 text-yellow-500" />;

  if (lang === 'python')
    return <Terminal className="h-3.5 w-3.5 text-blue-500" />;

  return null;
}

/* -------------------------------------
   Section
------------------------------------- */

function TemplateSection({
  title,
  templates,
  empty,
  onSelect,
  onRequestDelete,
  userId,
}) {
  return (
    <div className="space-y-3">
      <div className="px-1 text-xs font-medium uppercase text-muted-foreground">
        {title}
      </div>

      {templates.length === 0 ? (
        <div className="px-1 text-sm text-muted-foreground">{empty}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
              onDelete={() => {}}
              onRequestDelete={onRequestDelete}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------
   Templates sheet
------------------------------------- */

export function TemplatesSheet({ open, onOpenChange, portalId }) {
  const [userId, setUserId] = useState(null);

  const [languageFilter, setLanguageFilter] = useState(
    DEFAULT_FILTERS.languageFilter,
  );
  const [objectFilter, setObjectFilter] = useState(
    DEFAULT_FILTERS.objectFilter,
  );
  const [categoryFilter, setCategoryFilter] = useState(
    DEFAULT_FILTERS.categoryFilter,
  );
  const [sortBy, setSortBy] = useState(DEFAULT_FILTERS.sortBy);
  const [search, setSearch] = useState(DEFAULT_FILTERS.search);
  const [showCommunity, setShowCommunity] = useState(
    DEFAULT_FILTERS.showCommunity,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  /* -----------------------------
     Reset filters
  ----------------------------- */

  function resetFilters() {
    setLanguageFilter(DEFAULT_FILTERS.languageFilter);
    setObjectFilter(DEFAULT_FILTERS.objectFilter);
    setCategoryFilter(DEFAULT_FILTERS.categoryFilter);
    setSortBy(DEFAULT_FILTERS.sortBy);
    setSearch(DEFAULT_FILTERS.search);
    setShowCommunity(DEFAULT_FILTERS.showCommunity);

    localStorage.setItem(
      SHOW_COMMUNITY_KEY,
      String(DEFAULT_FILTERS.showCommunity),
    );
  }

  /* -----------------------------
     Load user
  ----------------------------- */

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  /* -----------------------------
     Fetch templates (reusable)
  ----------------------------- */

  async function fetchTemplates() {
    setLoading(true);

    const { data, error } = await supabase.from('action_templates').select(`
  id,
  slug,
  name,
  description,
  js_action,
  py_action,
  config_yaml_js,
  config_yaml_py,
  visibility,
  category,
  created_at,
  event_json,
  created_by
`)

const t = data[1];

console.log('TEMPLATE RAW', {
  id: t.id,
  py_action: !!t.py_action,
  config_yaml_py: t.config_yaml_py,
  config_yaml_py_type: typeof t.config_yaml_py,
})



    if (error) {
      toast.error('Failed to load templates');
      setTemplates([]);
      setLoading(false);
      return;
    }

    setTemplates(
  (data ?? []).map((t) => {
    const supportedLanguages = []

    if (t.js_action) supportedLanguages.push('javascript')
    if (t.py_action) supportedLanguages.push('python')

    return {
      ...t,
      languages: supportedLanguages,
      icon: ICON_MAP[t.slug],
      objectType: extractObjectType(t.event_json),
    }
  }),
)

    setLoading(false);
  }

  /* -----------------------------
     Load templates
  ----------------------------- */

  useEffect(() => {
    if (!open) return;

    fetchTemplates();
  }, [open]);

  /* -----------------------------
     Delete template (Sonner + refresh)
  ----------------------------- */

  async function deleteTemplateRow(template) {
    if (!template) return;
    if (!userId) return;
    if (template.created_by !== userId) return;
    if (template.visibility !== 'private') return;

    const toastId = toast.loading('Deleting template…');

    const { error } = await supabase
      .from('action_templates')
      .delete()
      .eq('id', template.id);

    if (error) {
      toast.error('Failed to delete template', { id: toastId });
      return;
    }

    toast.success('Template deleted', { id: toastId });

    setDeleteOpen(false);
    setTemplateToDelete(null);

    await fetchTemplates();
  }

  /* -----------------------------
     Derived categories
  ----------------------------- */

  const categories = useMemo(() => {
    return Array.from(
      new Set(templates.map((t) => t.category).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [templates]);

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
        return false;

      if (languageFilter !== 'all' && !t.languages.includes(languageFilter))
        return false;

      if (objectFilter !== 'ALL' && t.objectType !== objectFilter) return false;

      if (categoryFilter !== 'ALL' && t.category !== categoryFilter)
        return false;

      return true;
    });

    return sortTemplates(list, sortBy);
  }, [templates, languageFilter, objectFilter, categoryFilter, sortBy, search]);

  const privateTemplates = filtered.filter((t) => t.visibility === 'private');
  const publicTemplates = filtered.filter((t) => t.visibility === 'public');

  const visibleCount =
    privateTemplates.length + (showCommunity ? publicTemplates.length : 0);

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
              Start from a pre-built action template and customise it for your
              workflow.
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
          <div className="mt-6 min-h-0 flex-1">
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
                      userId={userId}
                      onSelect={(t) => {
                        setSelectedTemplate(t);
                        setConfirmOpen(true);
                      }}
                      onRequestDelete={(t) => {
                        setTemplateToDelete(t);
                        setDeleteOpen(true);
                      }}
                    />

                    {showCommunity && (
                      <TemplateSection
                        title="Community Templates"
                        templates={publicTemplates}
                        empty="No community templates available."
                        userId={userId}
                        onSelect={(t) => {
                          setSelectedTemplate(t);
                          setConfirmOpen(true);
                        }}
                        onRequestDelete={(t) => {
                          setTemplateToDelete(t);
                          setDeleteOpen(true);
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
          if (!userId) return;

          await createActionFromTemplate({
            supabase,
            ownerId: userId,
            portalId,
            template: selectedTemplate,
            language,
            name: selectedTemplate.name,
            description: selectedTemplate.description,
          });

          setConfirmOpen(false);
          onOpenChange(false);
        }}
      />
      <ConfirmTemplateDialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  template={templateToDelete}
  title="Delete template?"
  description={(t) => (
    <>
      This will permanently delete
      <span className="font-medium"> {t.name}</span>.
      This action cannot be undone.
    </>
  )}
  confirmLabel="Delete"
  confirmLoadingLabel="Deleting…"
  requireLanguage={false}
  onConfirm={() => deleteTemplateRow(templateToDelete)}
/>

    </>
  );
}
