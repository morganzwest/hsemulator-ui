'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

/* -------------------------------------------------
   Internal helpers (CLIENT → SERVER)
------------------------------------------------- */

async function apiRequest(path, { method, body }) {
    const hasBody = body !== undefined && body !== null

    const res = await fetch(path, {
        method,
        headers: hasBody
            ? { 'Content-Type': 'application/json' }
            : undefined,
        body: hasBody ? JSON.stringify(body) : undefined,
    })

    let data = null
    try {
        data = await res.json()
    } catch { }

    if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`)
    }

    return data
}


/* -------------------------------------------------
   Validation (UNCHANGED)
------------------------------------------------- */

function validateCreateSecret(input) {
    console.log('[secrets][validateCreateSecret] input:', input)

    if (!input) throw new Error('Payload is required')

    const { scope, portal_id, action_id = null, name, value } = input

    if (!['portal', 'action', 'cicd'].includes(scope)) {
        throw new Error(`Invalid scope: ${scope}`)
    }

    if (!portal_id) {
        throw new Error('portal_id is required')
    }

    if (scope === 'action' && !action_id) {
        throw new Error('action_id is required for action-scoped secrets')
    }

    if (!name || typeof name !== 'string') {
        throw new Error('Secret name is required')
    }

    if (!value || typeof value !== 'string') {
        throw new Error('Secret value is required')
    }

    return {
        scope,
        portal_id,
        action_id: scope === 'action' ? action_id : null,
        name: name.trim(),
        value,
    }
}

function validateUpdateSecret(input) {
    console.log('[secrets][validateUpdateSecret] input:', input)

    if (!input?.value || typeof input.value !== 'string') {
        throw new Error('New secret value is required')
    }

    return {
        value: input.value,
    }
}

/* -------------------------------------------------
   Public API
------------------------------------------------- */
/**
 * Supabase READ (client-safe)
 */
export async function fetchPortalSecrets(portalId) {
    console.log('[secrets][fetchPortalSecrets] portalId:', portalId)

    if (!portalId) {
        throw new Error('portalId is required')
    }

    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
        .from('secrets')
        .select('id, name, scope, action_id, portal_id')
        .eq('portal_id', portalId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('[secrets][fetchPortalSecrets] Supabase error:', error)
        throw new Error(error.message)
    }

    console.log('[secrets][fetchPortalSecrets] rows:', data)

    return data ?? []
}

/**
 * CREATE secret (SERVER)
 */
export async function createSecret(input) {
    console.log('[secrets][createSecret] called')

    const payload = validateCreateSecret(input)

    const res = await apiRequest('/api/runtime/secrets', {
        method: 'POST',
        body: payload,
    })

    if (!res?.secret_id) {
        console.error('[secrets][createSecret] unexpected response:', res)
        throw new Error('Secret creation failed')
    }

    return res
}

/**
 * DELETE secret (SERVER)
 */
export async function deleteSecret(secretId, ctx) {
    if (!secretId) throw new Error('secretId is required')
    if (!ctx?.portal_id || !ctx?.user_id) {
        throw new Error('portal_id and user_id are required for delete')
    }

    await apiRequest(
        `/api/runtime/secrets/${secretId}`,
        {
            method: 'DELETE',
            body: {
                portal_id: ctx.portal_id,
                user_id: ctx.user_id,
            },
        }
    )

    // explicit return
    return { secret_id: secretId }
}



/**
 * UPDATE secret (SERVER)
 */
export async function updateSecret(secretId, input) {
    console.log('[secrets][updateSecret] secretId:', secretId)

    if (!secretId) {
        throw new Error('secretId is required')
    }

    const payload = validateUpdateSecret(input)

    const res = await apiRequest(`/api/runtime/secrets/${secretId}`, {
        method: 'PUT',
        body: payload,
    })

    return res
}
