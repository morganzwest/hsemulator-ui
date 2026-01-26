import { createContext, useContext, useState, useCallback } from 'react'

const CommandContext = createContext(null)

export function CommandProvider({ children }) {
  const [commands, setCommands] = useState([])
  const [groups, setGroups] = useState({})

  /* -------------------------------------
     Groups
  ------------------------------------- */

  const registerGroup = useCallback((group) => {
    setGroups(prev => {
      if (prev[group.id]) return prev
      return {
        ...prev,
        [group.id]: {
          id: group.id,
          label: group.label,
          order: group.order ?? 0,
        },
      }
    })
  }, [])

  const unregisterGroup = useCallback((id) => {
    setGroups(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  /* -------------------------------------
     Commands
  ------------------------------------- */

  const registerCommand = useCallback((command) => {
    setCommands(prev => {
      if (prev.some(c => c.id === command.id)) return prev

      return [
        ...prev,
        {
          id: command.id,
          label: command.label,
          description: command.description ?? null,
          icon: command.icon ?? null,
          shortcut: command.shortcut ?? null,
          disabled: command.disabled ?? false,
          groupId: command.groupId ?? command.group ?? 'default',
          action: command.action,
        },
      ]
    })
  }, [])

  const unregisterCommand = useCallback((id) => {
    setCommands(prev => prev.filter(c => c.id !== id))
  }, [])

  return (
    <CommandContext.Provider
      value={{
        commands,
        groups,
        registerGroup,
        unregisterGroup,
        registerCommand,
        unregisterCommand,
      }}
    >
      {children}
    </CommandContext.Provider>
  )
}

export function useCommandStore() {
  const ctx = useContext(CommandContext)
  if (!ctx) {
    throw new Error('useCommandStore must be used within CommandProvider')
  }
  return ctx
}
