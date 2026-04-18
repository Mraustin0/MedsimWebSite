import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/notifications — fetch user notifications
export async function GET() {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (auth.user as any).id

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('[GET /api/notifications]', error)
    return NextResponse.json([], { status: 200 })
  }
}

// PATCH /api/notifications — mark all as read (or specific id)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (auth.user as any).id

    const body = await req.json().catch(() => ({}))
    const { id } = body

    if (id) {
      await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } })
    } else {
      await prisma.notification.updateMany({ where: { userId }, data: { read: true } })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[PATCH /api/notifications]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE /api/notifications — delete a notification
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (auth.user as any).id

    const { id } = await req.json().catch(() => ({}))
    if (id) {
      await prisma.notification.deleteMany({ where: { id, userId } })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/notifications]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
