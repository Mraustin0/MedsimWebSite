import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await req.json()
    const instructorCode = process.env.INSTRUCTOR_CODE || 'medsim-instructor-2024'

    if (code !== instructorCode) {
      return NextResponse.json({ error: 'รหัสอาจารย์ไม่ถูกต้อง' }, { status: 403 })
    }

    // Upgrade user role to INSTRUCTOR
    const userId = (auth.user as any).id
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'INSTRUCTOR' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[/api/instructor/verify]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
