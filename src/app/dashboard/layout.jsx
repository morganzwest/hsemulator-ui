'use client'

import { useEffect } from 'react'
import {
  Plus,
  Shuffle,
  Pencil,
  LayoutTemplate,
  Settings,
} from 'lucide-react'
import { CommandProvider, useCommandStore } from '@/components/command-palette/command-store'
import { CommandPalette } from '@/components/command-palette/command-palette'

// export const metadata = { title: 'Action Editor' }

/* -------------------------------------
   Command registration
------------------------------------- */

export function RegisterCoreCommands() {
  const { registerCommand } = useCommandStore()

  useEffect(() => {
    /* ---------------------------------
       Actions (core object lifecycle)
    --------------------------------- */

    registerCommand({
      id: 'action:create',
      label: 'Create New Action',
      description: 'Start a new action from scratch',
      icon: Plus,
      groupId: 'actions',
      action: () => {
        window.dispatchEvent(new Event('action:create'))
      },
    })

    registerCommand({
      id: 'action:edit-current',
      label: 'Edit Current Action',
      description: 'Modify the currently active action',
      icon: Pencil,
      groupId: 'actions',
      action: () => {
        window.dispatchEvent(new Event('action:edit-current'))
      },
    })

    registerCommand({
      id: 'action:switch',
      label: 'Switch Action',
      description: 'Change the active action in this workspace',
      icon: Shuffle,
      groupId: 'actions',
      action: () => {
        window.dispatchEvent(new Event('action:change'))
      },
    })

    /* ---------------------------------
       Templates & reuse
    --------------------------------- */

    registerCommand({
      id: 'templates:open',
      label: 'Browse Templates',
      description: 'View and insert reusable action templates',
      icon: LayoutTemplate,
      groupId: 'templates',
      action: () => {
        window.dispatchEvent(new Event('templates:open'))
      },
    })

    // Future:
    // - Save as template
    // - Create from AI
    // - Import / export templates

    /* ---------------------------------
       Workspace & configuration
    --------------------------------- */

    registerCommand({
      id: 'settings:open',
      label: 'Open Settings',
      description: 'Configure preferences and system options',
      icon: Settings,
      groupId: 'settings',
      action: () => {
        window.dispatchEvent(new Event('settings:open'))
      },
    })

    // Future:
    // - Workspace switcher
    // - Portal settings
    // - Environment variables
  }, [registerCommand])

  return null
}

/* -------------------------------------
   Layout
------------------------------------- */

export default function DashboardLayout({ children }) {
  return (
    <CommandProvider>
      <RegisterCoreCommands />
      {children}
      <CommandPalette />
    </CommandProvider>
  )
}
