'use client'

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCommandPalette } from './use-command-palette'
import { useCommandStore } from './command-store'
import { Command as CommandIcon } from 'lucide-react'

function capitalise(label) {
  if (!label) return ''
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const { commands, groups } = useCommandStore()

  /* -------------------------------------
     Group resolution
  ------------------------------------- */

  const grouped = commands.reduce((acc, cmd) => {
    const groupId = cmd.groupId || cmd.group || 'default'
    if (!acc[groupId]) acc[groupId] = []
    acc[groupId].push(cmd)
    return acc
  }, {})

  const orderedGroups = Object.entries(grouped)
    .map(([id, items]) => ({
      id,
      items,
      label: capitalise(groups[id]?.label ?? id),
      order: groups[id]?.order ?? 999,
    }))
    .sort((a, b) => a.order - b.order)

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border shadow-lg">
        {/* Header */}
        <div className="border-b px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CommandIcon className="h-3.5 w-3.5 text-muted-foreground" />
            Command Palette
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Type a command or search…
          </p>
        </div>

        <CommandInput
          placeholder="Type a command…"
          className="h-9 text-xs"
        />

        {/* Scrollable command list */}
        <ScrollArea className="">
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>

            {orderedGroups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && <CommandSeparator />}

                <CommandGroup heading={group.label}>
                  {group.items.map(cmd => {
                    const Icon = cmd.icon || CommandIcon

                    return (
                      <CommandItem
                        key={cmd.id}
                        value={`${cmd.label} ${cmd.description ?? ''}`}
                        disabled={cmd.disabled}
                        onSelect={() => {
                          if (cmd.disabled) return
                          setOpen(false)
                          cmd.action()
                        }}
                        className="py-1.5 cursor-pointer"
                      >
                        <Icon className="mx-2 h-4 w-4 shrink-0" />

                        <div className="flex min-w-0 flex-col">
                          <span className="text-xs leading-tight">
                            {cmd.label}
                          </span>

                          {cmd.description && (
                            <span className="truncate text-[11px] leading-tight text-muted-foreground">
                              {cmd.description}
                            </span>
                          )}
                        </div>

                        {cmd.shortcut && (
                          <CommandShortcut>
                            {cmd.shortcut}
                          </CommandShortcut>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1">⌘</kbd>
          <kbd className="ml-0.5 rounded bg-muted px-1">K</kbd> or
          <kbd className="ml-1 rounded bg-muted px-1">Ctrl</kbd>
          <kbd className="ml-0.5 rounded bg-muted px-1">K</kbd>
        </div>
      </Command>
    </CommandDialog>
  )
}
