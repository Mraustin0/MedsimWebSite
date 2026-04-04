import { NextRequest, NextResponse } from 'next/server'
import { chatWithPatient } from '@/lib/anthropic'
import { ChatRequest } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { message, history, systemPrompt } = body

    const updatedHistory = [
      ...history,
      { role: 'user' as const, content: message },
    ]

    const reply = await chatWithPatient(updatedHistory, systemPrompt)

    return NextResponse.json({ message: reply })
  } catch (error) {
    console.error('[/api/chat]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
