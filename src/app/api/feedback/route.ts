import { NextRequest, NextResponse } from 'next/server'
import { generateFeedback } from '@/lib/gemini'
import { FeedbackRequest, Feedback, FeedbackScores } from '@/types'
import { prisma } from '@/lib/db'

const DEFAULT_SCORES: FeedbackScores = {
  onset: 0, location: 0, duration: 0, character: 0,
  aggravating: 0, relieving: 0, timing: 0, severity: 0, overall: 0,
}

export async function POST(req: NextRequest) {
  try {
    const body: FeedbackRequest = await req.json()
    const { sessionId, transcript, scenarioId, durationSeconds } = body

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
    }

    // Save feedback + close session in DB
    if (sessionId) {
      try {
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
            },
          }),
          prisma.session.update({
            where: { id: sessionId },
            data: { endedAt: new Date(), durationSeconds },
          }),
        ])
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
