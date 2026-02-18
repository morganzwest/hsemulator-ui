import { logger } from '@/lib/logger'
import { ERROR_MESSAGES } from '@/lib/errors'

/**
 * Discover workflows from external portal
 * 
 * @param {Object} params - Discovery parameters
 * @param {string} params.secret_id - UUID of the secret to use for authentication
 * @param {string} params.portal_id - UUID of the portal
 * @param {string} params.owner_id - UUID of the current user (portal owner)
 * @param {number} params.portal_id_int - Numeric portal ID
 * @param {boolean} params.process_actions - Whether to process discovered actions
 * @returns {Promise<Object>} Discovery response with workflow and action data
 */
export async function discoverWorkflows({
    secret_id,
    portal_id,
    owner_id,
    portal_id_int,
    process_actions = false
}) {
    // Validate required parameters
    if (!secret_id || !portal_id || !owner_id || !portal_id_int) {
        throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS(['secret_id', 'portal_id', 'owner_id', 'portal_id_int']))
    }

    logger.log('[discoverWorkflows] →', {
        secret_id,
        portal_id,
        owner_id,
        portal_id_int,
        process_actions
    })

    try {
        const res = await fetch('/api/migration/workflows', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret_id,
                portal_id,
                owner_id,
                portal_id_int,
                process_actions
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error || ERROR_MESSAGES.FAILED_TO_DISCOVER_WORKFLOWS)
        }

        logger.log('[discoverWorkflows] ←', {
            status: res.status,
            success: res.ok,
            total_workflows: data.total_workflows,
            total_code_actions: data.total_code_actions,
            actions_count: data.actions?.length || 0
        })

        return data
    } catch (err) {
        logger.error('[discoverWorkflows] ERROR', err)
        
        // Provide more specific error messages
        let errorMessage = err.message || ERROR_MESSAGES.FAILED_TO_DISCOVER_WORKFLOWS
        if (err.status === 401) {
            errorMessage = 'Authentication failed. Please check your credentials.'
        } else if (err.status === 403) {
            errorMessage = 'Access denied. You may not have permission to access this portal.'
        } else if (err.status === 404) {
            errorMessage = 'Portal not found. Please verify the portal ID.'
        } else if (err.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.'
        } else if (err.status >= 500) {
            errorMessage = 'Server error. Please try again in a few moments.'
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.'
        }

        throw new Error(errorMessage)
    }
}
