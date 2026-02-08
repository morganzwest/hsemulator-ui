'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

/* -------------------------------------------
   Fetch assigned secrets for an action
------------------------------------------- */
export async function fetchActionSecrets(actionId) {
    if (!actionId) throw new Error('actionId required')

    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
        .from('action_secrets')
        .select('secret_id')
        .eq('action_id', actionId)

    if (error) {
        throw new Error(error.message)
    }

    return data.map((row) => row.secret_id)
}

/* -------------------------------------------
   Replace assigned secrets for an action
------------------------------------------- */
export async function setActionSecrets(actionId, portalId, secretIds) {
    if (!actionId || !portalId) {
        throw new Error('actionId and portalId required')
    }

    const supabase = createSupabaseBrowserClient()

    /* 1. Remove existing assignments */
    const { error: deleteError } = await supabase
        .from('action_secrets')
        .delete()
        .eq('action_id', actionId)

    if (deleteError) {
        throw new Error(deleteError.message)
    }

    /* 2. Insert new assignments */
    if (secretIds.length > 0) {
        const rows = secretIds.map((secretId) => ({
            action_id: actionId,
            secret_id: secretId,
            portal_id: portalId,
        }))

        const { error: insertError } = await supabase
            .from('action_secrets')
            .insert(rows)

        if (insertError) {
            throw new Error(insertError.message)
        }
    }

    return true
}
