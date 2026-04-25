import { NextRequest, NextResponse } from 'next/server'
import { generateFeedback } from '@/lib/gemini'
import { FeedbackRequest, Feedback, FeedbackScores } from '@/types'
import { prisma } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const DEFAULT_SCORES: FeedbackScores = {
  onset: 0, location: 0, duration: 0, character: 0,
  aggravating: 0, relieving: 0, timing: 0, severity: 0, overall: 0,
}

export async function POST(req: NextRequest) {
  // Rate limit: 10 feedback requests per 10 minutes per IP
  const ip = getClientIp(req)
  const rl = rateLimit(`feedback:${ip}`, { limit: 10, windowSec: 600 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'กรุณารอสักครู่ก่อนส่ง feedback ใหม่' },
      { status: 429 }
    )
  }

  try {
    const body: FeedbackRequest = await req.json()
    const { sessionId, transcript, scenarioId, durationSeconds, hintsUsed = 0 } = body

    let scores: FeedbackScores = DEFAULT_SCORES
    let good: string[] = []
    let missed: string[] = []
    let tips: string[] = []

    try {
      const raw = await generateFeedback(transcript, scenarioId)
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      if (parsed.scores) {
        scores = { ...DEFAULT_SCORES, ...parsed.scores }
      }
      good = parsed.good || []
      missed = parsed.missed || []
      tips = parsed.tips || []
    } catch (aiError) {
      console.error('[/api/feedback] AI parse error:', aiError)
      tips = ['ระบบไม่สามารถวิเคราะห์ได้ในขณะนี้ กรุณาลองใหม่']
    }

    const totalQuestions = transcript.split('\n').filter(Boolean).length
    const oldcartsCompleted = Object.values(scores)
      .slice(0, 8)
      .filter((v) => (v as number) >= 50).length

    const feedback: Feedback = {
      scores,
      good,
      missed,
      tips,
      totalQuestions,
      oldcartsCompleted,
      hintsUsed,
    }

    // Save feedback + close session in DB
    if (sessionId) {
      try {
        const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { userId: true, scenarioId: true } })

        await Promise.all([
          prisma.feedback.create({
            data: {
              sessionId,
              scoreOnset: scores.onset,
              scoreLocation: scores.location,
              scoreDuration: scores.duration,
              scoreCharacter: scores.character,
              scoreAggravating: scores.aggravating,
              scoreRelieving: scores.relieving,
              scoreTiming: scores.timing,
              scoreSeverity: scores.severity,
              scoreOverall: scores.overall,
              good,
              missed,
              tips,
              totalQuestions,
              oldcartsCompleted,
              hintsUsed,
            },
          }),
          prisma.session.update({
            where: { id: sessionId },
            data: { endedAt: new Date(), durationSeconds },
          }),
        ])

        // Create milestone notifications
        if (session?.userId) {
          const notifs: { title: string; body: string; icon: string }[] = []

          if (scores.overall >= 90) {
            notifs.push({ title: '🏆 Expert Performance!', body: `คุณได้ ${scores.overall}% — ผลงานยอดเยี่ยม!`, icon: 'emoji_events' })
          } else if (scores.overall >= 80) {
            notifs.push({ title: '⭐ Excellent Work!', body: `คุณได้ ${scores.overall}% — เก่งมาก!`, icon: 'star' })
          } else if (scores.overall >= 70) {
            notifs.push({ title: '✅ Good Job!', body: `คุณได้ ${scores.overall}% — ทำได้ดี`, icon: 'check_circle' })
          }

          if (oldcartsCompleted === 8) {
            notifs.push({ title: '🎯 OLDCARTS Master!', body: 'คุณถามครบทั้ง 8 หัวข้อ OLDCARTS แล้ว!', icon: 'military_tech' })
          }

          if (notifs.length > 0) {
            await prisma.notification.createMany({
              data: notifs.map((n) => ({ userId: session.userId, ...n })),
            })
          }
        }
      } catch (dbError) {
        console.error('[/api/feedback] DB save error:', dbError)
      }
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('[/api/feedback]', error)
    return NextResponse.json({
      scores: DEFAULT_SCORES,
      good: [],
      missed: [],
      tips: ['เกิดข้อผิดพลาด กรุณาลองใหม่'],
      totalQuestions: 0,
      oldcartsCompleted: 0,
    })
  }
}
