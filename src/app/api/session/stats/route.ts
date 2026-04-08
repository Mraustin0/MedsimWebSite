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

    // Get all completed sessions with feedback
    const sessions = await prisma.session.findMany({
      where: { userId, endedAt: { not: null } },
      include: { feedback: true },
      orderBy: { startedAt: 'desc' },
    })

    const totalSessions = sessions.length
    const feedbacks = sessions.filter((s) => s.feedback).map((s) => s.feedback!)

    // Average overall score
    const avgScore = feedbacks.length > 0
      ? Math.round(feedbacks.reduce((sum, f) => sum + f.scoreOverall, 0) / feedbacks.length)
      : 0

    // Average duration
    const avgDuration = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / sessions.length)
      : 0

    // Average OLDCARTS completed
    const avgOldcarts = feedbacks.length > 0
      ? Math.round(feedbacks.reduce((sum, f) => sum + f.oldcartsCompleted, 0) / feedbacks.length)
      : 0

    // Streak — consecutive days with at least 1 session
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let streak = 0
    const checkDate = new Date(today)
    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(checkDate)
      const dayEnd = new Date(checkDate)
      dayEnd.setDate(dayEnd.getDate() + 1)
      const hasSession = sessions.some((s) => s.startedAt >= dayStart && s.startedAt < dayEnd)
      if (hasSession) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Weekly sessions count (last 7 days)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekly: number[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today)
      dayStart.setDate(dayStart.getDate() - i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      weekly.push(sessions.filter((s) => s.startedAt >= dayStart && s.startedAt < dayEnd).length)
    }

    // Unique scenarios completed
    const uniqueScenarios = new Set(sessions.map((s) => s.scenarioId)).size

    return NextResponse.json({
      totalSessions,
      avgScore,
      avgDuration,
      avgOldcarts,
      streak,
      weekly,
      uniqueScenarios,
    })
  } catch (error) {
    console.error('[/api/session/stats]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
