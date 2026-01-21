'use client'

const MAX_NAME = 32
const MAX_DESC = 64

export async function updateAction({
  supabase,
  actionId,
  name,
  description,
}) {
  if (!name || name.length > MAX_NAME) {
    throw new Error('Invalid name')
  }

  if (description && description.length > MAX_DESC) {
    throw new Error('Invalid description')
  }

  const { error } = await supabase
    .from('actions')
    .update({
      name,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', actionId)


  window.dispatchEvent(new Event('actions:resync'));

  if (error) throw error
}
