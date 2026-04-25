import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, yearOfStudy, specialty, university, avatarUrl } = body

    const updatedUser = await prisma.user.update({
      where: { email: (session.user as any).email },
      data: {
        ...(name !== undefined && { name }),
        ...(yearOfStudy !== undefined && { yearOfStudy }),
        ...(specialty !== undefined && { specialty }),
        ...(university !== undefined && { university }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[/api/user/update]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
