import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user || (auth.user as any).role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // All sessions across all students
    const sessions = await prisma.session.findMany({
      where: { endedAt: { not: null } },
      include: { feedback: true },
    })

    const totalSessions = sessions.length
    const feedbacks = sessions.filter((s) => s.feedback).map((s) => s.feedback!)
    const avgScore =
      feedbacks.length > 0
        ? Math.round(feedbacks.reduce((sum, f) => sum + f.scoreOverall, 0) / feedbacks.length)
        : 0

    return NextResponse.json({ totalSessions, avgScore })
  } catch (error) {
    console.error('[/api/instructor/stats]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
