'use client'

import { toast } from 'sonner'

const MAX_NAME = 32
const MAX_DESC = 64

export async function updateAction({
  supabase,
  actionId,
  name,
  description,
}) {
  /* -------------------------------------
     Validation (Warnings)
  ------------------------------------- */

  if (!name) {
    toast.warning('Action name is required')
    throw new Error('Missing name')
  }

  if (name.length > MAX_NAME) {
    toast.warning(`Action name must be ≤ ${MAX_NAME} characters`)
    throw new Error('Name too long')
  }

  if (description && description.length > MAX_DESC) {
    toast.warning(`Description must be ≤ ${MAX_DESC} characters`)
    throw new Error('Description too long')
  }

  if (!actionId) {
    toast.error('Action ID is missing')
    throw new Error('Missing actionId')
  }

  /* -------------------------------------
     Update action (Promise Toast)
  ------------------------------------- */

  return toast.promise(
    (async () => {
      const { error } = await supabase
        .from('actions')
        .update({
          name,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', actionId)

      if (error) {
        throw new Error(error.message || 'Failed to update action')
      }

      window.dispatchEvent(new Event('actions:resync'))
    })(),
    {
      loading: 'Saving changes…',
      success: 'Action updated successfully',
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Failed to update action',
    }
  )
}
