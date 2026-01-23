// components/actions/ActionMenu.jsx
'use client'

import { useState, useCallback } from 'react'
import { MoreHorizontal } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import { useActionMenu } from '@/lib/actions/action-menu'
import { EditActionDialog } from '@/components/edit-action-dialog'
import { DeleteActionDialog } from '@/components/delete-action-dialog'

export function ActionMenu({ action }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { selectAction } = useActionMenu(action)

  const stop = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  const handleSelect = useCallback(
    (e) => {
      stop(e)
      selectAction()
      setMenuOpen(false)
    },
    [selectAction, stop],
  )

  const handleEdit = useCallback(
    (e) => {
      stop(e)
      setMenuOpen(false)
      setEditOpen(true)
    },
    [stop],
  )

  const handleDelete = useCallback(
    (e) => {
      stop(e)
      setMenuOpen(false)
      setDeleteOpen(true)
    },
    [stop],
  )

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={stop}
            className="
              absolute right-2 top-2
              opacity-0 pointer-events-none
              transition-opacity
              group-hover/action:opacity-100
              group-hover/action:pointer-events-auto
            "
            aria-label="Action menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSelect}>
            Select
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleEdit}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive"
            onClick={handleDelete}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditActionDialog
        action={action}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteActionDialog
        action={action}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
