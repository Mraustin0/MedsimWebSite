import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  // Rate limit: 5 AI generations per minute per IP
  const ip = getClientIp(req)
  const rl = rateLimit(`scenario-gen:${ip}`, { limit: 5, windowSec: 60 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'กรุณารอสักครู่ก่อน Generate ใหม่' },
      { status: 429 }
    )
  }

  try {
    const auth = await getServerSession(authOptions)
    if (!auth?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, age, gender, chiefComplaint, oldcarts } = await req.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const genderTh = gender === 'male' ? 'ชาย' : 'หญิง'
    const oldcartsText = oldcarts ? `
OLDCARTS ที่ต้องการให้ผู้ป่วยเปิดเผย (เมื่อถูกถามถูกต้อง):
- Onset (เริ่มเมื่อ): ${oldcarts.onset || 'ไม่ระบุ'}
- Location (ตำแหน่ง): ${oldcarts.location || 'ไม่ระบุ'}
- Duration (ระยะเวลา): ${oldcarts.duration || 'ไม่ระบุ'}
- Character (ลักษณะ): ${oldcarts.character || 'ไม่ระบุ'}
- Aggravating (อาการแย่ลงเมื่อ): ${oldcarts.aggravating || 'ไม่ระบุ'}
- Relieving (อาการดีขึ้นเมื่อ): ${oldcarts.relieving || 'ไม่ระบุ'}
- Timing (รูปแบบ): ${oldcarts.timing || 'ไม่ระบุ'}
- Severity (ความรุนแรง 1-10): ${oldcarts.severity || 'ไม่ระบุ'}
` : ''

    const prompt = `สร้าง system prompt สำหรับ AI ที่จะรับบทเป็นผู้ป่วยในการฝึกซักประวัติสำหรับนักศึกษาแพทย์

ข้อมูลผู้ป่วย:
- ชื่อ: ${name}
- อายุ: ${age} ปี
- เพศ: ${genderTh}
- อาการสำคัญ (Chief Complaint): ${chiefComplaint}
${oldcartsText}

สร้าง system prompt เป็นภาษาไทย ที่:
1. บอก AI ว่าตัวเองเป็นใคร มีประวัติอะไร
2. กำหนดบุคลิก อารมณ์ วิธีพูดของผู้ป่วย (เช่น กังวล เจ็บปวด)
3. ระบุข้อมูล OLDCARTS ที่ต้องเปิดเผยเมื่อนักศึกษาถามถูก
4. กำหนดว่าจะไม่บอกข้อมูลทางการแพทย์ล่วงหน้า ต้องรอให้ถาม
5. ให้ตอบเป็นภาษาไทยแบบธรรมชาติ เหมือนคนไข้จริง

ตอบเป็น system prompt เท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม`

    const result = await model.generateContent(prompt)
    const systemPrompt = result.response.text()

    return NextResponse.json({ systemPrompt })
  } catch (error) {
    console.error('[/api/scenarios/generate]', error)
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 })
  }
}
