// components/actions/ActionMenu.jsx
'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useActionMenu } from '@/lib/actions/action-menu';
import { EditActionDialog } from '@/components/edit-action-dialog';
import { DeleteActionDialog } from '@/components/delete-action-dialog';

export function ActionMenu({ action }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { selectAction, openEdit, openDelete } = useActionMenu(action);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='
    absolute right-2 top-2
    opacity-0
    transition-opacity
    pointer-events-none
    group-hover/action:opacity-100
    group-hover/action:pointer-events-auto
  '
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={selectAction}>Select</DropdownMenuItem>
          <DropdownMenuItem onClick={() => openEdit(setEditOpen)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className='text-destructive'
            onClick={() => openDelete(setDeleteOpen)}
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
  );
}
