import { NextResponse } from 'next/server'

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL
const RUNTIME_SECRET = process.env.RUNTIME_SECRET

export async function PUT(req, { params }) {
    try {
        const body = await req.json()
        const { id } = params

        console.log('[runtime][PUT /secrets] →', { id, body })

        const res = await fetch(`${RUNTIME_URL}/secrets/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RUNTIME_SECRET}`,
            },
            body: JSON.stringify(body),
        })

        const data = await res.json().catch(() => null)

        console.log('[runtime][PUT /secrets] ←', {
            status: res.status,
            data,
        })

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        console.error('[runtime][PUT /secrets] ERROR', err)
        return NextResponse.json(
            { message: err.message },
            { status: 500 },
        )
    }
}

export async function DELETE(_req, { params }) {
    try {
        const { id } = params

        console.log('[runtime][DELETE /secrets] →', { id })

        const res = await fetch(`${RUNTIME_URL}/secrets/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${RUNTIME_SECRET}`,
            },
        })

        const data = await res.json().catch(() => null)

        console.log('[runtime][DELETE /secrets] ←', {
            status: res.status,
            data,
        })

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        console.error('[runtime][DELETE /secrets] ERROR', err)
        return NextResponse.json(
            { message: err.message },
            { status: 500 },
        )
    }
}
