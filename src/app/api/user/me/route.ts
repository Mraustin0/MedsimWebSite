import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { email: (session.user as any).email },
      select: { avatarUrl: true },
    })
    return NextResponse.json({ avatarUrl: user?.avatarUrl ?? null })
  } catch (error) {
    console.error('[/api/user/me]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
