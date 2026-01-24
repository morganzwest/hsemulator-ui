import {
    Briefcase,
    Building2,
    Home,
    Boxes,
    Cpu,
    Folder,
    GlobeLock,
    Users,
    Database,
    Layers,
    Server,
    Workflow,
    BarChart3,
    ShieldCheck,
    FileText,
    GitBranch,
    Cloud,
    Brain,
    Rocket, Sparkles
} from 'lucide-react'

/* -------------------------------------
   Icon registry
------------------------------------- */

export const PORTAL_ICONS = {
    /* Primary / common */
    home: Home,
    briefcase: Briefcase,
    building: Building2,
    users: Users,
    boxes: Boxes,
    workflow: Workflow,
    analytics: BarChart3,
    database: Database,
    server: Server,
    cloud: Cloud,
    cpu: Cpu,
    layers: Layers,
    branching: GitBranch,
    brain: Brain,
    rocket: Rocket,
    sparkles: Sparkles,
    documents: FileText,
    folder: Folder,
    security: ShieldCheck,
    globelock: GlobeLock,
}


/* -------------------------------------
   Color tokens (soft UI-first)
------------------------------------- */

export const PORTAL_COLORS = {
    /* Default (brand-safe) */
    default: {
        container: 'bg-violet-500/10 text-violet-600 border-violet-500/25',
        glow: 'ring-violet-500/20',
    },

    /* Core colours */
    blue: {
        container: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
        glow: 'ring-blue-500/20',
    },
    indigo: {
        container: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30',
        glow: 'ring-indigo-500/20',
    },
    purple: {
        container: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
        glow: 'ring-purple-500/20',
    },
    cyan: {
        container: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30',
        glow: 'ring-cyan-500/20',
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
    pink: {
        container: 'bg-pink-500/15 text-pink-600 border-pink-500/30',
        glow: 'ring-pink-500/20',
    },
    fuchsia: {
        container: 'bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/30',
        glow: 'ring-fuchsia-500/20',
    },

    //   PREMIUM OPTIONS
    ion: {
        container:
            'bg-gradient-to-br from-cyan-600/30 via-blue-700/30 to-indigo-900/40 ' +
            'text-cyan-200 border-cyan-400/30',
        glow: 'ring-cyan-400/40',
        premium: true,
    },
    ember: {
        container:
            'bg-gradient-to-br from-orange-600/25 via-red-500/15 to-amber-500/10 ' +
            'text-orange-700 border-orange-500/35',
        glow: 'ring-orange-500/30',
        premium: true
    },
    verdant: {
        container:
            'bg-gradient-to-br from-emerald-600/35 via-green-500/20 to-lime-400/10 ' +
            'text-emerald-200 border-emerald-400/30',
        glow: 'ring-emerald-400/30',
        premium: true,
    },
    aurora: {
        container:
            'bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-cyan-400/15 ' +
            'text-violet-200 border-violet-400/30',
        glow: 'ring-fuchsia-500/30',
        premium: true,
    },
    nebula: {
        container:
            'bg-gradient-to-br from-purple-700/35 via-indigo-600/25 to-blue-500/15 ' +
            'text-indigo-200 border-indigo-400/30',
        glow: 'ring-indigo-400/35',
        premium: true,
    },
    obsidian: {
        container:
            'bg-gradient-to-br from-neutral-950/50 via-slate-900/35 to-zinc-800/25 ' +
            'text-slate-100 border-slate-500/30',
        glow: 'ring-slate-500/35',
        premium: true,
    },
    plasma: {
        container:
            'bg-gradient-to-br from-fuchsia-600/35 via-purple-600/25 to-pink-500/15 ' +
            'text-fuchsia-200 border-fuchsia-400/30',
        glow: 'ring-fuchsia-400/35',
        premium: true,
    },
    arctic: {
        container:
            'bg-gradient-to-br from-cyan-500/30 via-sky-400/20 to-blue-300/10 ' +
            'text-cyan-400 border-cyan-300/40',
        glow: 'ring-cyan-300/35',
        premium: true,
    },
    umbra: {
        container:
            'bg-[linear-gradient(135deg,theme(colors.indigo.950/60),theme(colors.slate.950/80)),linear-gradient(225deg,theme(colors.indigo.800/20),transparent_70%)] ' +
            'bg-blend-overlay text-slate-200 border-indigo-800/25',
        glow: 'ring-indigo-700/20',
        premium: true,
        founder: true
    },
    void: {
        container:
            'bg-gradient-to-br from-black/60 via-indigo-950/40 to-purple-950/30 ' +
            'text-indigo-200 border-indigo-500/25',
        glow: 'ring-indigo-500/40',
        premium: true,
        founder: true
    }


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
