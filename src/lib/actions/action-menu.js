// lib/actions/action-menu.js
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function useActionMenu(action) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function selectAction() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('actionId', action.id)
    router.push(`?${params.toString()}`)
  }

  function openEdit(setEditOpen) {
    setEditOpen(true)
  }

  function openDelete(setDeleteOpen) {
    setDeleteOpen(true)
  }

  return {
    selectAction,
    openEdit,
    openDelete,
  }
}
