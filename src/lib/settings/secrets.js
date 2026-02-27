'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

/* -------------------------------------------------
   Error Types and Messages
------------------------------------------------- */

const CICD_ERROR_TYPES = {
    INVALID_SECRET: 'CICD_SECRET_INVALID',
    MISSING_SCOPE: 'CICD_SCOPE_MISSING',
    GENERIC: 'GENERIC'
};

const CICD_ERROR_MESSAGES = {
    [CICD_ERROR_TYPES.INVALID_SECRET]: {
        message: 'Private app token could not be verified',
        guidance:
            'HubSpot rejected the token during validation. Check the following:\n' +
            '• The token is copied exactly with no extra spaces or characters\n' +
            '• The token is still active and has not been regenerated\n' +
            '• The token belongs to the intended HubSpot portal\n' +
            '• The prefix is correct (typically "pat-")\n\n' +
            'If the issue persists, generate a new token in HubSpot and retry.',
        recoverable: true,
    },

    [CICD_ERROR_TYPES.MISSING_SCOPE]: {
        message: 'Token missing required permissions',
        guidance:
            'The token is valid but does not include the permissions needed for CI/CD.\n\n' +
            'Update your HubSpot private app scopes to include:\n' +
            '• Automation\n\n' +
            'After saving the scope changes, retry the operation.',
        recoverable: false,
    },

    [CICD_ERROR_TYPES.GENERIC]: {
        message: 'Unable to create secret',
        guidance:
            'Something unexpected prevented the secret from being created.\n\n' +
            'Recommended steps:\n' +
            '• Retry the action\n' +
            '• Confirm HubSpot and network connectivity\n' +
            '• Verify the token is still valid\n\n' +
            'If this continues, contact support with the error details.',
        recoverable: true,
    },
};

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
        // Create structured error object
        let errorMessage = data?.message || `Request failed (${res.status})`
        let errorType = CICD_ERROR_TYPES.GENERIC
        let guidance = CICD_ERROR_MESSAGES[CICD_ERROR_TYPES.GENERIC].guidance
        let recoverable = CICD_ERROR_MESSAGES[CICD_ERROR_TYPES.GENERIC].recoverable

        // Classify error type for CICD secrets
        if (res.status === 401) {
            errorType = CICD_ERROR_TYPES.INVALID_SECRET
            errorMessage = CICD_ERROR_MESSAGES[CICD_ERROR_TYPES.INVALID_SECRET].message
            guidance = CICD_ERROR_MESSAGES[CICD_ERROR_TYPES.INVALID_SECRET].guidance
            recoverable = CICD_ERROR_MESSAGES[CICD_ERROR_TYPES.INVALID_SECRET].recoverable
        } else if (res.status === 403) {
            errorType = CICD_ERROR_TYPES.MISSING_SCOPE
            errorMessage = CICD_ERROR_MESSAGES[CICD_ERROR_TYPES.MISSING_SCOPE].message
            guidance = CICD_ERROR_MESSAGES[CICD_ERROR_TYPES.MISSING_SCOPE].guidance
            recoverable = CICD_ERROR_MESSAGES[CICD_ERROR_TYPES.MISSING_SCOPE].recoverable
        }

        const error = new Error(errorMessage)
        error.status = res.status
        error.type = errorType
        error.guidance = guidance
        error.recoverable = recoverable
        error.data = data

        throw error
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

    // First get the secrets
    const { data: secrets, error: secretsError } = await supabase
        .from('secrets')
        .select('id, name, scope, action_id, portal_id')
        .eq('portal_id', portalId)
        .order('created_at', { ascending: true })

    if (secretsError) {
        console.error('[secrets][fetchPortalSecrets] Supabase error:', secretsError)
        throw new Error(secretsError.message)
    }

    // Then get usage counts for these secrets
    const secretIds = secrets?.map(s => s.id) || []
    let usageCounts = {}

    if (secretIds.length > 0) {
        const { data: usageData, error: usageError } = await supabase
            .from('action_secrets')
            .select('secret_id')
            .eq('portal_id', portalId)
            .in('secret_id', secretIds)

        if (usageError) {
            console.error('[secrets][fetchPortalSecrets] Usage count error:', usageError)
        } else {
            // Count occurrences by secret_id
            usageCounts = {}
            usageData?.forEach(row => {
                usageCounts[row.secret_id] = (usageCounts[row.secret_id] || 0) + 1
            })
        }
    }

    // Combine secrets with usage counts
    const secretsWithUsage = secrets?.map(secret => ({
        ...secret,
        usage_count: usageCounts[secret.id] || 0
    })) || []

    console.log('[secrets][fetchPortalSecrets] rows with usage:', secretsWithUsage)

    return secretsWithUsage
}

/**
 * CREATE secret (SERVER)
 */
export async function createSecret(input) {
    console.log('[secrets][createSecret] called')

    const payload = validateCreateSecret(input)

    try {
        const res = await apiRequest('/api/runtime/secrets', {
            method: 'POST',
            body: payload,
        })

        if (!res?.secret_id) {
            console.error('[secrets][createSecret] unexpected response:', res)
            throw new Error('Secret creation failed')
        }

        return res
    } catch (error) {
        // Log the full error for debugging
        console.error('[secrets][createSecret] Error:', {
            message: error.message,
            status: error.status,
            type: error.type,
            data: error.data
        })

        // Re-throw the structured error for component handling
        throw error
    }
}

// Export error constants for component use
export { CICD_ERROR_TYPES, CICD_ERROR_MESSAGES }

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
