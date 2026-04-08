import { NextRequest, NextResponse } from 'next/server'
import { chatWithPatient } from '@/lib/gemini'
import { ChatRequest } from '@/types'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { sessionId, message, history, systemPrompt } = body

    const updatedHistory = [
      ...history,
      { role: 'user' as const, content: message },
    ]

    const reply = await chatWithPatient(updatedHistory, systemPrompt)

    // Save both messages to DB if sessionId exists
    if (sessionId) {
      await prisma.message.createMany({
        data: [
          { sessionId, role: 'USER', content: message },
          { sessionId, role: 'ASSISTANT', content: reply },
        ],
      })
    }

    return NextResponse.json({ message: reply })
  } catch (error) {
    console.error('[/api/chat]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
