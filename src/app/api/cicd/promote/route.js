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

// Request size limit (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024

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
            search_key: body.search_key,
            force: body.force,
            dry_run: body.dry_run
        })

        // Validate required fields
        const { source_code, cicd_secret_id, workflow_id, search_key, force = false, dry_run = false } = body

        if (!source_code || !cicd_secret_id || !workflow_id || !search_key) {
            return NextResponse.json(
                createErrorResponse(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS(['source_code', 'cicd_secret_id', 'workflow_id', 'search_key']), 400),
                { status: 400 }
            )
        }

        // Construct the new API request format
        const requestBody = {
            source_code,
            cicd_secret_id,
            workflow_id,
            search_key,
        }

        // Add optional parameters if provided
        if (force) requestBody.force = true
        if (dry_run) requestBody.dry_run = true

        // Add query parameters for force if needed
        const queryParams = force ? '?force=true' : ''

        const res = await fetch(`${RUNTIME_URL}/cicd/promote${queryParams}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RUNTIME_SECRET}`,
                'accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        const data = await res.json().catch(() => null)

        logger.log('[cicd][POST /promote] ←', {
            status: res.status,
            success: res.ok,
        })

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        logger.error('[cicd][POST /promote] ERROR', err)
        return NextResponse.json(
            createErrorResponse(err.message || ERROR_MESSAGES.PROMOTION_FAILED, 500),
            { status: 500 }
        )
    }
}
