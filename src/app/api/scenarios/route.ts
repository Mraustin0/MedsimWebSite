import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST — create a new scenario (instructor only)
export async function POST(req: NextRequest) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user || (auth.user as any).role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (auth.user as any).id
    const body = await req.json()

    const scenario = await prisma.scenarioRecord.create({
      data: {
        name: body.name,
        age: parseInt(body.age),
        gender: body.gender,
        chiefComplaint: body.chiefComplaint,
        description: body.description || '',
        difficulty: body.difficulty,
        systemPrompt: body.systemPrompt,
        tags: body.tags ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        createdById: userId,
      },
    })

    return NextResponse.json({ id: scenario.id })
  } catch (error) {
    console.error('[/api/scenarios POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — list all scenarios
export async function GET() {
  try {
    const scenarios = await prisma.scenarioRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { name: true } } },
    })
    return NextResponse.json(scenarios)
  } catch (error) {
    console.error('[/api/scenarios GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
