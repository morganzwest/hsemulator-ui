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

// Request size limit (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024

/**
 * Handles POST requests to promote an action to HubSpot workflow
 * 
 * @param {Request} req - The incoming HTTP request object
 * @returns {Promise<NextResponse>} JSON response with promotion result or error
 * 
 * @throws {Error} When required environment variables are missing
 * @throws {Error} When request size exceeds 1MB limit
 * @throws {Error} When required fields are missing or invalid
 * 
 * @example
 * // Request body:
 * {
 *   "source_code": "function handler() { return 'Hello'; }",
 *   "cicd_secret_id": "secret-123",
 *   "workflow_id": "123456789",
 *   "action_id": "action-456",
 *   "force": false,
 *   "dry_run": false
 * }
 */
export async function POST(req) {
    try {
        // Check request size
        const contentLength = req.headers.get('content-length')
        if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
            return NextResponse.json(
                createErrorResponse(ERROR_MESSAGES.REQUEST_TOO_LARGE, 413),
                { status: 413 }
            )
        }

        const body = await req.json()

        logger.log('[cicd][POST /promote] →', {
            source_code_length: body.source_code?.length || 0,
            has_cicd_secret_id: !!body.cicd_secret_id,
            workflow_id: body.workflow_id,
            action_id: body.action_id,
            force: body.force,
            dry_run: body.dry_run
        })

        // Validate required fields
        const { source_code, cicd_secret_id, hubspot_token, workflow_id, action_id, force = false, dry_run = false } = body

        if (!source_code || !workflow_id || !action_id || (!cicd_secret_id && !hubspot_token)) {
            return NextResponse.json(
                createErrorResponse(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS(['source_code', 'workflow_id', 'action_id', 'cicd_secret_id or hubspot_token']), 400),
                { status: 400 }
            )
        }

        // Construct the new API request format
        const requestBody = {
            source_code,
        }

        // Add credential - prefer cicd_secret_id, fallback to hubspot_token
        if (cicd_secret_id) {
            requestBody.cicd_secret_id = cicd_secret_id
        } else if (hubspot_token) {
            requestBody.hubspot_token = hubspot_token
        }

        // Add query parameters for force and dry_run if needed
        const queryParams = new URLSearchParams()
        if (force) queryParams.append('force', 'true')
        if (dry_run) queryParams.append('dry_run', 'true')
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        try {
            const res = await fetch(`${RUNTIME_URL}/cicd/workflow/${workflow_id}/action/${action_id}/promote${queryString}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RUNTIME_SECRET}`,
                    'accept': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            })
            clearTimeout(timeoutId)

            const data = await res.json().catch(() => null)

            logger.log('[cicd][POST /promote] ←', {
                status: res.status,
                success: res.ok,
            })

            return NextResponse.json(data, { status: res.status })
        } catch (fetchError) {
            clearTimeout(timeoutId)
            if (fetchError.name === 'AbortError') {
                logger.error('[cicd][POST /promote] Request timeout')
                return NextResponse.json(
                    createErrorResponse('Request timeout. Please try again.', 504),
                    { status: 504 }
                )
            }
            throw fetchError
        }
    } catch (err) {
        logger.error('[cicd][POST /promote] ERROR', err)
        return NextResponse.json(
            createErrorResponse(err.message || ERROR_MESSAGES.PROMOTION_FAILED, 500),
            { status: 500 }
        )
    }
}
