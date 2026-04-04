import { NextRequest, NextResponse } from 'next/server'
import { generateFeedback } from '@/lib/anthropic'
import { FeedbackRequest, Feedback, FeedbackScores } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: FeedbackRequest = await req.json()
    const { transcript, scenarioId, durationSeconds } = body

    const raw = await generateFeedback(transcript, scenarioId)
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    const scores: FeedbackScores = parsed.scores
    const totalQuestions = transcript.split('\n').filter(Boolean).length
    const oldcartsCompleted = Object.values(scores)
      .slice(0, 8)
      .filter((v) => (v as number) >= 50).length

    const feedback: Feedback = {
      scores,
      good: parsed.good || [],
      missed: parsed.missed || [],
      tips: parsed.tips || [],
      totalQuestions,
      oldcartsCompleted,
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('[/api/feedback]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
