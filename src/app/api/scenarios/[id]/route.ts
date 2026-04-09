import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user || (auth.user as any).role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    await prisma.scenarioRecord.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/scenarios/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user || (auth.user as any).role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await req.json()
    const updated = await prisma.scenarioRecord.update({
      where: { id },
      data: {
        name: body.name,
        age: parseInt(body.age),
        gender: body.gender,
        chiefComplaint: body.chiefComplaint,
        description: body.description || '',
        difficulty: body.difficulty,
        systemPrompt: body.systemPrompt,
        tags: body.tags ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      },
    })
    return NextResponse.json({ id: updated.id })
  } catch (error) {
    console.error('[PATCH /api/scenarios/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
