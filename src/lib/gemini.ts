import { GoogleGenerativeAI } from '@google/generative-ai'

// Access your API key as an environment variable (see ".env" file)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({ model: 'gemini-pro' }) // Using gemini-pro for text generation

export async function chatWithPatient(
  history: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
): Promise<string> {
  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model', // Gemini expects 'user' or 'model'
      parts: [{ text: msg.content }],
    })),
  })

  // System prompt might need to be prepended to the first message or handled in a different way
  // depending on how Gemini API handles system prompts. For simplicity, we'll prepend it to the first message.
  const messages = history.length > 0 ? history : [{ role: 'user', content: '' }];
  const firstMessageContent = `${systemPrompt}

${messages[0].content}`
  
  const result = await chat.sendMessage(firstMessageContent)
  const response = await result.response
  return response.text()
}

export async function generateFeedback(
  transcript: string,
  scenarioContext: string
): Promise<string> {
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
  const response = await result.response
  return response.text()
}
