import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { ERROR_MESSAGES, createErrorResponse } from '@/lib/errors'

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL
const RUNTIME_SECRET = process.env.RUNTIME_SECRET

// Environment variable validation
if (!RUNTIME_URL) {
    throw new Error(ERROR_MESSAGES.MISSING_ENV_VAR('NEXT_PUBLIC_RUNTIME_URL'))
}
if (!RUNTIME_SECRET) {
    throw new Error(ERROR_MESSAGES.MISSING_ENV_VAR('RUNTIME_SECRET'))
}

export async function POST(req, { params }) {
    try {
        const { workflow_id } = await params
        const body = await req.json()

        const { cicd_secret_id, search_key, source_code } = body

        logger.log('[cicd][POST /workflow/status] →', {
            workflow_id,
            cicd_secret_id,
            search_key,
            has_source_code: !!source_code
        })

        // Validate required parameters
        if (!workflow_id || !cicd_secret_id || !search_key) {
            return NextResponse.json(
                createErrorResponse(ERROR_MESSAGES.MISSING_PARAMETERS(['workflow_id', 'cicd_secret_id', 'search_key']), 400),
                { status: 400 }
            )
        }

        // Build query parameters for runtime service
        const queryParams = new URLSearchParams({
            cicd_secret_id,
            search_key,
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

        const data = await res.json().catch(() => null)
        logger.debug('[cicd][POST /workflow/status] ← Runtime response status:', res.status)

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        logger.error('[cicd][POST /workflow/status] ERROR', err)
        return NextResponse.json(
            createErrorResponse(err.message || ERROR_MESSAGES.FAILED_TO_CHECK_STATUS, 500),
            { status: 500 }
        )
    }
}
