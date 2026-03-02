import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { ERROR_MESSAGES, createErrorResponse } from '@/lib/errors'

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL
const RUNTIME_SECRET = process.env.NEXT_PUBLIC_RUNTIME_SECRET

// TODO: This is temporary for a mock implementation and must be revisited when the real external API call is implemented
// Environment variable validation
if (!RUNTIME_URL) {
    throw new Error(ERROR_MESSAGES.MISSING_ENV_VAR('NEXT_PUBLIC_RUNTIME_URL'))
}
if (!RUNTIME_SECRET) {
    throw new Error(ERROR_MESSAGES.MISSING_ENV_VAR('NEXT_PUBLIC_RUNTIME_SECRET'))
}

/**
 * Handles GET requests to fetch workflow details from the runtime service
 * 
 * @param {Request} req - The incoming HTTP request object
 * @param {Object} params - Route parameters containing workflow_id
 * @returns {Promise<NextResponse>} JSON response with workflow details or error
 * 
 * @throws {Error} When required environment variables are missing
 * @throws {Error} When required parameters are missing or invalid
 * @throws {Error} When runtime service is unavailable
 * 
 * @example
 * // Query parameters:
 * // ?cicd_secret_id=secret-123
 */
export async function GET(req, { params }) {
    try {
        const { workflow_id } = await params
        const { searchParams } = new URL(req.url)

        // Get cicd_secret_id from query parameters
        const cicd_secret_id = searchParams.get('cicd_secret_id')

        logger.log('[cicd][GET /workflow] →', { workflow_id, cicd_secret_id })

        // Validate required parameters
        if (!workflow_id) {
            return NextResponse.json(
                createErrorResponse(ERROR_MESSAGES.MISSING_PARAMETERS(['workflow_id']), 400),
                { status: 400 }
            )
        }

        // cicd_secret_id is optional - allow requests without it

        try {
            // Build query parameters for runtime service
            const queryParams = new URLSearchParams()
            queryParams.append('cicd_secret_id', cicd_secret_id)
            const runtimeUrl = `${RUNTIME_URL}/cicd/workflow/${workflow_id}?${queryParams.toString()}`
            logger.debug('[cicd][GET /workflow] → Runtime URL:', runtimeUrl)
            logger.debug('[cicd][GET /workflow] Using RUNTIME_SECRET:', !!RUNTIME_SECRET)

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

            try {
                const res = await fetch(runtimeUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${RUNTIME_SECRET}`,
                        'accept': 'application/json',
                    },
                    signal: controller.signal,
                })
                clearTimeout(timeoutId)

                if (!res.ok) {
                    const errorText = await res.text()
                    logger.error('[cicd][GET /workflow] Runtime API error:', {
                        status: res.status,
                        statusText: res.statusText,
                        errorText,
                        url: runtimeUrl,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer [REDACTED]',
                            'accept': 'application/json',
                        }
                    })

                    // Try to parse error as JSON for more details
                    let errorData = null
                    try {
                        errorData = JSON.parse(errorText)
                    } catch (e) {
                        // Keep errorText as is if it's not JSON
                    }

                    return NextResponse.json(
                        createErrorResponse(errorData?.error || `Failed to fetch workflow: ${res.status} ${res.statusText}`, res.status),
                        { status: res.status }
                    )
                }

                const responseText = await res.text()
                logger.debug('[cicd][GET /workflow] ← Runtime response status:', res.status)
                logger.debug('[cicd][GET /workflow] ← Runtime response:', responseText)

                let data
                try {
                    data = JSON.parse(responseText)
                } catch {
                    data = { detail: responseText }
                }

                logger.log('[cicd][GET /workflow] Successfully fetched workflow:', {
                    workflow_id,
                    action_count: data.actions?.length || 0
                })

                return NextResponse.json(data, { status: res.status })
            } catch (fetchError) {
                clearTimeout(timeoutId)
                if (fetchError.name === 'AbortError') {
                    logger.error('[cicd][GET /workflow] Request timeout:', runtimeUrl)
                    return NextResponse.json(
                        createErrorResponse('Request timeout. Please try again.', 504),
                        { status: 504 }
                    )
                }
                logger.error('[cicd][GET /workflow] Runtime service error:', fetchError)
                return NextResponse.json(
                    createErrorResponse('Runtime service unavailable. Please try again later.', 503),
                    { status: 503 }
                )
            } finally {
                clearTimeout(timeoutId)
            }
        } catch (err) {
            logger.error('[cicd][GET /workflow] ERROR', err)
            return NextResponse.json(
                createErrorResponse(err.message || ERROR_MESSAGES.FAILED_TO_FETCH_WORKFLOW, 500),
                { status: 500 }
            )
        }
    } catch (err) {
        logger.error('[cicd][GET /workflow] ERROR', err)
        return NextResponse.json(
            createErrorResponse(err.message || ERROR_MESSAGES.FAILED_TO_FETCH_WORKFLOW, 500),
            { status: 500 }
        )
    }
}
