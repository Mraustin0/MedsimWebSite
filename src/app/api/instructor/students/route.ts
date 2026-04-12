import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user || auth.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const page = Math.max(0, parseInt(searchParams.get('page') ?? '0'))

    // Get students with pagination
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        sessions: {
          where: { endedAt: { not: null } },
          take: 100,
          select: {
            id: true,
            scenarioId: true,
            durationSeconds: true,
            startedAt: true,
            feedback: {
              select: {
                scoreOverall: true,
                oldcartsCompleted: true,
                totalQuestions: true,
              },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = students.map((s) => {
      const completedSessions = s.sessions
      const feedbacks = completedSessions
        .filter((ses) => ses.feedback)
        .map((ses) => ses.feedback!)

      const avgScore =
        feedbacks.length > 0
          ? Math.round(
              feedbacks.reduce((sum, f) => sum + f.scoreOverall, 0) / feedbacks.length
            )
          : 0

      const avgOldcarts =
        feedbacks.length > 0
          ? Math.round(
              feedbacks.reduce((sum, f) => sum + f.oldcartsCompleted, 0) / feedbacks.length
            )
          : 0

      const totalDuration = completedSessions.reduce(
        (sum, ses) => sum + (ses.durationSeconds || 0),
        0
      )

      const lastSession =
        completedSessions.length > 0 ? completedSessions[0].startedAt : null

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        avatarUrl: s.avatarUrl,
        createdAt: s.createdAt,
        totalSessions: completedSessions.length,
        avgScore,
        avgOldcarts,
        totalDuration,
        lastSession,
        uniqueScenarios: new Set(completedSessions.map((ses) => ses.scenarioId)).size,
      }
    })

    const total = await prisma.user.count({ where: { role: 'STUDENT' } })

    return NextResponse.json({ data: result, total, page, pageSize: PAGE_SIZE })
  } catch (error) {
    console.error('[/api/instructor/students]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
