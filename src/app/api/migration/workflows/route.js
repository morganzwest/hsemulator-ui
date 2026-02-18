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

        logger.log('[migration][POST /workflows] →', {
            secret_id: body.secret_id,
            portal_id: body.portal_id,
            owner_id: body.owner_id,
            portal_id_int: body.portal_id_int,
            process_actions: body.process_actions
        })

        // Validate required fields
        const { secret_id, portal_id, owner_id, portal_id_int, process_actions = false } = body

        if (!secret_id || !portal_id || !owner_id || !portal_id_int) {
            return NextResponse.json(
                createErrorResponse(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS(['secret_id', 'portal_id', 'owner_id', 'portal_id_int']), 400),
                { status: 400 }
            )
        }

        // Construct the request body for runtime service
        const requestBody = {
            secret_id,
            portal_id,
            owner_id,
            portal_id_int,
            process_actions
        }

        const res = await fetch(`${RUNTIME_URL}/workflows/discover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RUNTIME_SECRET}`,
                'accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        const data = await res.json().catch(() => null)

        logger.log('[migration][POST /workflows] ←', {
            status: res.status,
            success: res.ok,
            total_workflows: data?.total_workflows,
            total_code_actions: data?.total_code_actions
        })

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        logger.error('[migration][POST /workflows] ERROR', err)
        return NextResponse.json(
            createErrorResponse(err.message || ERROR_MESSAGES.FAILED_TO_DISCOVER_WORKFLOWS, 500),
            { status: 500 }
        )
    }
}
