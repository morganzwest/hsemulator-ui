import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { ERROR_MESSAGES, createErrorResponse } from '@/lib/errors'

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL
const RUNTIME_SECRET = process.env.NEXT_PUBLIC_RUNTIME_SECRET

// Environment variable validation
if (!RUNTIME_URL) {
    throw new Error(ERROR_MESSAGES.MISSING_ENV_VAR('NEXT_PUBLIC_RUNTIME_URL'))
}
if (!RUNTIME_SECRET) {
    throw new Error(ERROR_MESSAGES.MISSING_ENV_VAR('NEXT_PUBLIC_RUNTIME_SECRET'))
}

// Debug: Log environment variable status (without exposing secrets)
logger.log('[cicd][POST /workflow/status] Environment check:', {
    hasRuntimeUrl: !!RUNTIME_URL,
    hasRuntimeSecret: !!RUNTIME_SECRET,
    runtimeSecretLength: RUNTIME_SECRET?.length || 0
})

/**
 * Handles POST requests to check the status of a workflow action
 * 
 * @param {Request} req - The incoming HTTP request object
 * @param {Object} params - Route parameters containing workflow_id
 * @returns {Promise<NextResponse>} JSON response with workflow status or error
 * 
 * @throws {Error} When required environment variables are missing
 * @throws {Error} When required parameters are missing or invalid
 * 
 * @example
 * // Request body:
 * {
 *   "cicd_secret_id": "secret-123",
 *   "source_code": "function handler() { return 'Hello'; }",
 *   "action_id": "action-456"
 * }
 */
export async function POST(req, { params }) {
    try {
        const { workflow_id } = await params
        const body = await req.json()

        const { cicd_secret_id, source_code, action_id } = body

        logger.log('[cicd][POST /workflow/status] →', {
            workflow_id,
            cicd_secret_id,
            action_id,
            has_source_code: !!source_code
        })

        // Validate required parameters
        if (!workflow_id || !cicd_secret_id || !action_id) {
            return NextResponse.json(
                createErrorResponse(ERROR_MESSAGES.MISSING_PARAMETERS(['workflow_id', 'cicd_secret_id', 'action_id']), 400),
                { status: 400 }
            )
        }

        // Build query parameters for runtime service
        const queryParams = new URLSearchParams({
            cicd_secret_id,
            action_id,
        })

        if (source_code) {
            queryParams.append('source_code', source_code)
        }

        const runtimeUrl = `${RUNTIME_URL}/cicd/workflow/${workflow_id}/status?${queryParams}`
        logger.debug('[cicd][POST /workflow/status] → Runtime URL:', runtimeUrl)

        const res = await fetch(runtimeUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RUNTIME_SECRET}`,
                'accept': 'application/json',
            },
        })

        const responseText = await res.text()
        logger.debug('[cicd][POST /workflow/status] ← Runtime response status:', res.status)
        // Log truncated response to avoid exposing sensitive data
        const truncatedResponse = responseText.length > 200
            ? responseText.substring(0, 200) + '...(truncated)'
            : responseText
        logger.debug('[cicd][POST /workflow/status] ← Runtime response (truncated):', truncatedResponse)

        let data
        try {
            data = JSON.parse(responseText)
        } catch {
            data = { detail: responseText }
        }

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        logger.error('[cicd][POST /workflow/status] ERROR', err)
        return NextResponse.json(
            createErrorResponse(err.message || ERROR_MESSAGES.FAILED_TO_CHECK_STATUS, 500),
            { status: 500 }
        )
    }
}
