import { NextResponse } from 'next/server'

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL
const RUNTIME_SECRET = process.env.RUNTIME_SECRET

export async function POST(req) {
    try {
        const body = await req.json()

        console.log('[runtime][POST /secrets] →', body)

        const res = await fetch(`${RUNTIME_URL}/secrets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RUNTIME_SECRET}`,
            },
            body: JSON.stringify(body),
        })

        const data = await res.json().catch(() => null)

        console.log('[runtime][POST /secrets] ←', {
            status: res.status,
            data,
        })

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        console.error('[runtime][POST /secrets] ERROR', err)
        return NextResponse.json(
            { message: err.message },
            { status: 500 },
        )
    }
}
