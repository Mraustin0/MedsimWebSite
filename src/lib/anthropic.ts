import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function chatWithPatient(
  history: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: history,
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}

export async function generateFeedback(
  transcript: string,
  scenarioContext: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `คุณเป็นอาจารย์แพทย์ผู้เชี่ยวชาญด้านการสอนซักประวัติ 
ตอบเป็น JSON เท่านั้น ห้ามมี markdown backticks หรือข้อความอื่น`,
    messages: [
      {
        role: 'user',
        content: `วิเคราะห์การซักประวัติผู้ป่วยต่อไปนี้ตาม OLDCARTS framework

Scenario: ${scenarioContext}

Transcript คำถามของนักศึกษา:
${transcript}

ตอบเป็น JSON รูปแบบนี้เท่านั้น:
{
  "scores": {
    "onset": <0-100>,
    "location": <0-100>,
    "duration": <0-100>,
    "character": <0-100>,
    "aggravating": <0-100>,
    "relieving": <0-100>,
    "timing": <0-100>,
    "severity": <0-100>,
    "overall": <0-100>
  },
  "good": ["สิ่งที่ทำได้ดี 1", "สิ่งที่ทำได้ดี 2"],
  "missed": ["สิ่งที่พลาด 1", "สิ่งที่พลาด 2"],
  "tips": ["คำแนะนำ 1", "คำแนะนำ 2"]
}`,
      },
    ],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : '{}'
}
