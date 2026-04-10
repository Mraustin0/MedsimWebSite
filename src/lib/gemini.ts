import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Fallback model chain — try in order until one works
const CHAT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro',
]

const GENERATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
]

async function withModelFallback<T>(
  models: string[],
  fn: (modelName: string) => Promise<T>
): Promise<T> {
  let lastError: unknown
  let hasQuotaError = false
  let hasUnavailableError = false

  for (const modelName of models) {
    try {
      return await fn(modelName)
    } catch (err: any) {
      const status = err?.status ?? err?.httpStatus ?? 0
      const msg: string = err?.message ?? ''

      // Track error types across retries
      if (status === 429 || msg.includes('quota') || msg.includes('Too Many Requests')) {
        hasQuotaError = true
      }
      if (status === 503 || msg.includes('unavailable') || msg.includes('high demand')) {
        hasUnavailableError = true
      }

      // Retry on quota / overload / unavailable / 404 (model not available for this key)
      if ([429, 503, 404].includes(status) || msg.includes('quota') || msg.includes('unavailable')) {
        console.warn(`[gemini] ${modelName} failed (${status}), trying next model...`)
        lastError = err
        continue
      }

      // Other errors (auth, bad request) — don't retry
      throw err
    }
  }

  // All models failed — throw a descriptive combined error
  const combined: any = new Error(
    hasQuotaError
      ? 'ขออภัย AI quota รายวันหมดแล้ว กรุณาลองใหม่พรุ่งนี้หรือเปลี่ยน API key ใหม่'
      : hasUnavailableError
      ? 'AI กำลังมีผู้ใช้งานสูงมาก กรุณาลองใหม่ในอีกสักครู่'
      : 'ไม่สามารถเชื่อมต่อ AI ได้ กรุณาลองใหม่'
  )
  combined.status = hasQuotaError ? 429 : hasUnavailableError ? 503 : 500
  combined.isGeminiFallbackError = true
  throw combined
}

export async function chatWithPatient(
  history: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
): Promise<string> {
  return withModelFallback(CHAT_MODELS, async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    })

    // history includes the new user message at the end — pass everything before it as chat history
    const rawHistory = history.slice(0, -1).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    // Gemini requires chat history to start with a 'user' turn.
    // If history starts with 'model' (e.g. AI greeting from init), prepend a synthetic user turn.
    const chatHistory =
      rawHistory.length > 0 && rawHistory[0].role === 'model'
        ? [{ role: 'user' as const, parts: [{ text: 'เริ่มต้น' }] }, ...rawHistory]
        : rawHistory

    const lastMessage = history[history.length - 1]

    const chat = model.startChat({ history: chatHistory })
    const result = await chat.sendMessage(lastMessage.content)
    return result.response.text()
  })
}

export async function generateFeedback(
  transcript: string,
  scenarioContext: string
): Promise<string> {
  return withModelFallback(GENERATE_MODELS, async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName })

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
  })
}
