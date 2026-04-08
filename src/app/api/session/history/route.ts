import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (auth.user as any).id

    const sessions = await prisma.session.findMany({
      where: { userId, endedAt: { not: null } },
      include: { feedback: true },
      orderBy: { startedAt: 'desc' },
      take: 20,
    })

    const result = sessions.map((s) => ({
      id: s.id,
      scenarioId: s.scenarioId,
      startedAt: s.startedAt,
      durationSeconds: s.durationSeconds ?? 0,
      scores: s.feedback
        ? {
            onset: s.feedback.scoreOnset,
            location: s.feedback.scoreLocation,
            duration: s.feedback.scoreDuration,
            character: s.feedback.scoreCharacter,
            aggravating: s.feedback.scoreAggravating,
            relieving: s.feedback.scoreRelieving,
            timing: s.feedback.scoreTiming,
            severity: s.feedback.scoreSeverity,
            overall: s.feedback.scoreOverall,
          }
        : null,
      oldcartsCompleted: s.feedback?.oldcartsCompleted ?? 0,
      totalQuestions: s.feedback?.totalQuestions ?? 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('[/api/session/history]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
