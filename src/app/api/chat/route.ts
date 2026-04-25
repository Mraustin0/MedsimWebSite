import { NextRequest, NextResponse } from 'next/server'
import { chatWithPatient } from '@/lib/gemini'
import { ChatRequest } from '@/types'
import { prisma } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Rate limit: 30 messages per minute per IP
  const ip = getClientIp(req)
  const rl = rateLimit(`chat:${ip}`, { limit: 30, windowSec: 60 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'ส่งข้อความบ่อยเกินไป กรุณารอสักครู่' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    )
  }

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
  } catch (error: any) {
    console.error('[/api/chat]', error?.message ?? error)

    const msg: string = error?.message ?? ''
    const status: number = error?.status ?? error?.httpStatus ?? 0

    // Use message from fallback error if available
    const userMessage = error?.isGeminiFallbackError
      ? msg
      : status === 429 || msg.includes('quota') || msg.includes('Too Many Requests')
        ? 'AI quota รายวันหมดแล้ว กรุณาลองใหม่พรุ่งนี้หรือขอ API key ใหม่ที่ aistudio.google.com'
        : status === 503 || msg.includes('unavailable') || msg.includes('high demand')
          ? 'AI กำลังมีผู้ใช้งานสูงมาก กรุณาลองใหม่ในอีกสักครู่'
          : 'เกิดข้อผิดพลาด กรุณาลองใหม่'

    const httpStatus = status === 429 ? 429 : status === 503 ? 503 : 500
    return NextResponse.json({ error: 'ai_error', message: userMessage }, { status: httpStatus })
  }
}
