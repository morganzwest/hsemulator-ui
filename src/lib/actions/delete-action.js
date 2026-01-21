'use client'

export async function deleteAction({
  supabase,
  ownerId,
  actionId,
}) {
  // 1. Delete storage files
  const { data: files } = await supabase.storage
    .from('actions')
    .list(`${ownerId}/${actionId}`)

  if (files?.length) {
    await supabase.storage
      .from('actions')
      .remove(files.map(f => `${ownerId}/${actionId}/${f.name}`))
  }

  // 2. Delete DB record
  const { error } = await supabase
    .from('actions')
    .delete()
    .eq('id', actionId)

  window.dispatchEvent(new Event('actions:resync'));

  if (error) throw error
}
