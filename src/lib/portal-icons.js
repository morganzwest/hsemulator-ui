import {
  Briefcase,
  Building2,
  Home,
  Boxes,
  Cpu,
  Folder,
} from 'lucide-react'

/* -------------------------------------
   Icon registry
------------------------------------- */

export const PORTAL_ICONS = {
  briefcase: Briefcase,
  building: Building2,
  home: Home,
  boxes: Boxes,
  cpu: Cpu,
  folder: Folder,
}

/* -------------------------------------
   Color tokens (soft UI-first)
------------------------------------- */

export const PORTAL_COLORS = {
  blue: {
    container: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    glow: 'ring-blue-500/20',
  },
  purple: {
    container: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    glow: 'ring-purple-500/20',
  },
  emerald: {
    container: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    glow: 'ring-emerald-500/20',
  },
  amber: {
    container: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    glow: 'ring-amber-500/20',
  },
  rose: {
    container: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
    glow: 'ring-rose-500/20',
  },
  default: {
    container: 'bg-muted text-foreground border-border',
    glow: 'ring-muted',
  },
}

/* -------------------------------------
   Resolvers
------------------------------------- */

export function resolvePortalIcon(name) {
  return PORTAL_ICONS[name] || Briefcase
}

export function resolvePortalColor(name) {
  return PORTAL_COLORS[name] || PORTAL_COLORS.blue
}
