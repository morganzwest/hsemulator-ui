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

export async function GET(req, { params }) {
    try {
        const { workflow_id } = await params

        logger.log('[cicd][GET /workflow] →', { workflow_id })

        // Validate required parameters
        if (!workflow_id) {
            return NextResponse.json(
                createErrorResponse(ERROR_MESSAGES.MISSING_PARAMETERS(['workflow_id']), 400),
                { status: 400 }
            )
        }

        // For now, return mock data to test the UI functionality
        // This bypasses the runtime service authentication issues
        logger.log('[cicd][GET /workflow] Using mock data for testing')

        const mockData = {
            workflow_id: workflow_id,
            actions: [
                {
                    action_id: "1",
                    type: "CUSTOM_CODE",
                    source_code: "exports.main = async (event, callback) => {\n  // Mock Node.js source code\n  const { inputFields } = event;\n  callback({ \n    outputFields: { \n      result: 'success',\n      timestamp: new Date().toISOString()\n    } \n  });\n}",
                    runtime: "NODE20X",
                    secret_names: []
                },
                {
                    action_id: "2",
                    type: "CUSTOM_CODE",
                    source_code: "def main(event, callback):\n    # Mock Python source code\n    input_fields = event.get('inputFields', {})\n    callback({\n        'outputFields': {\n            'result': 'success',\n            'language': 'python'\n        }\n    })",
                    runtime: "PYTHON39",
                    secret_names: []
                }
            ],
            total_count: 2
        }

        logger.log('[cicd][GET /workflow] Returning mock data:', {
            workflow_id,
            action_count: mockData.actions.length,
            action_ids: mockData.actions.map(a => a.action_id)
        })

        return NextResponse.json(mockData, { status: 200 })

    } catch (err) {
        logger.error('[cicd][GET /workflow] ERROR', err)
        return NextResponse.json(
            createErrorResponse(err.message || ERROR_MESSAGES.FAILED_TO_FETCH_WORKFLOW, 500),
            { status: 500 }
        )
    }
}
