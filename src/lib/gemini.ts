import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function chatWithPatient(
  history: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  })

  // history includes the new user message at the end — pass everything before it as chat history
  const chatHistory = history.slice(0, -1).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))
  const lastMessage = history[history.length - 1]

  const chat = model.startChat({ history: chatHistory })
  const result = await chat.sendMessage(lastMessage.content)
  return result.response.text()
}

export async function generateFeedback(
  transcript: string,
  scenarioContext: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `คุณเป็นอาจารย์แพทย์ผู้เชี่ยวชาญด้านการสอนซักประวัติ
ตอบเป็น JSON เท่านั้น ห้ามมี markdown backticks หรือข้อความอื่น

วิเคราะห์การซักประวัติผู้ป่วยต่อไปนี้ตาม OLDCARTS framework

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
}`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
