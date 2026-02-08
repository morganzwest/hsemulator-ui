import { NextResponse } from 'next/server'

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL
const RUNTIME_SECRET = process.env.RUNTIME_SECRET

export async function PUT(req, { params }) {
    try {
        const params = await context.params
        const { secret_id } = params
        const body = await req.json()

        console.log('[runtime][PUT /secrets] →', { secret_id, body })

        const res = await fetch(`${RUNTIME_URL}/secrets/${secret_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RUNTIME_SECRET}`,
            },
            body: JSON.stringify(body),
        })

        const data = await res.json().catch(() => null)
        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        return NextResponse.json(
            { message: err.message },
            { status: 500 }
        )
    }
}

export async function DELETE(req, context) {
    try {
        const params = await context.params
        const { secret_id } = params
        const body = await req.json()

        console.log('[runtime][DEBUG params]', params)

        if (!secret_id) {
            return NextResponse.json(
                { message: 'secret_id missing from path' },
                { status: 400 }
            )
        }

        if (!body?.portal_id || !body?.user_id) {
            return NextResponse.json(
                { message: 'portal_id and user_id are required' },
                { status: 400 }
            )
        }

        const res = await fetch(
            `${RUNTIME_URL}/secrets/${secret_id}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${RUNTIME_SECRET}`,
                },
                body: JSON.stringify(body),
            }
        )

        const data = await res.json().catch(() => null)
        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        console.error('[runtime][DELETE /secrets] ERROR', err)
        return NextResponse.json(
            { message: err.message },
            { status: 500 }
        )
    }
}