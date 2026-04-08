import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST — create a new session
export async function POST(req: NextRequest) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scenarioId } = await req.json()
    const userId = (auth.user as any).id

    const session = await prisma.session.create({
      data: { userId, scenarioId },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('[/api/session POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
