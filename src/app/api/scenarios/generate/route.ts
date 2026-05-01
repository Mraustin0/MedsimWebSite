import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'ระบบสร้าง Scenario อัตโนมัติถูกปิดใช้งานชั่วคราว' },
    { status: 503 }
  )
}
