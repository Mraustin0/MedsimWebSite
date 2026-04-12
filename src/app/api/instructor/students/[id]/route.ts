import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user || (auth.user as any).role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const student = await prisma.user.findUnique({
      where: { id, role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        sessions: {
          where: { endedAt: { not: null } },
          include: {
            feedback: true,
            messages: {
              select: { role: true, content: true, createdAt: true },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const sessions = student.sessions.map((s) => ({
      id: s.id,
      scenarioId: s.scenarioId,
      startedAt: s.startedAt,
      durationSeconds: s.durationSeconds ?? 0,
      messageCount: s.messages.filter((m) => m.role === 'USER').length,
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
      good: s.feedback?.good ?? [],
      missed: s.feedback?.missed ?? [],
      tips: s.feedback?.tips ?? [],
      transcript: s.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }))

    return NextResponse.json({
      id: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatarUrl,
      createdAt: student.createdAt,
      sessions,
    })
  } catch (error) {
    console.error('[/api/instructor/students/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
