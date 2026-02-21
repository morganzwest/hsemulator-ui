'use client'

import { toast } from 'sonner'

export async function deleteAction({
  supabase,
  ownerId,
  actionId,
}) {
  if (!ownerId || !actionId) {
    toast.error('Missing action details')
    throw new Error('Missing ownerId or actionId')
  }

  return toast.promise(
    (async () => {
      /* -------------------------------------
         Delete storage files (best-effort)
      ------------------------------------- */

      const { data: files, error: listError } = await supabase.storage
        .from('actions')
        .list(`${ownerId}/${actionId}`)

      if (listError) {
        throw new Error('Failed to read action storage')
      }

      if (files?.length) {
        const { error: removeError } = await supabase.storage
          .from('actions')
          .remove(
            files.map(f => `${ownerId}/${actionId}/${f.name}`)
          )

        if (removeError) {
          throw new Error('Failed to delete action files')
        }
      }

      /* -------------------------------------
         Mark action as soft deleted (preserve execution history)
      ------------------------------------- */

      const { error: deleteError } = await supabase
        .from('actions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', actionId)

      if (deleteError) {
        throw new Error(deleteError.message || 'Failed to delete action')
      }

      /* -------------------------------------
         Mark associated executions as having deleted action
      ------------------------------------- */

      const { error: executionsError } = await supabase
        .from('action_executions')
        .update({ action_deleted_at: new Date().toISOString() })
        .eq('action_id', actionId)

      if (executionsError) {
        console.warn('Warning: Failed to update action_executions deletion timestamp:', executionsError)
        // Don't throw error - action deletion is still successful
      }

      window.dispatchEvent(new Event('actions:resync'))
    })(),
    {
      loading: 'Deleting action…',
      success: 'Action deleted successfully',
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Failed to delete action',
    }
  )
}
