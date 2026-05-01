// Gemini API disabled — all functions return a disabled error

export async function chatWithPatient(
  _history: { role: 'user' | 'assistant'; content: string }[],
  _systemPrompt: string
): Promise<string> {
  throw Object.assign(new Error('ระบบ AI ถูกปิดใช้งานชั่วคราว'), { status: 503, isGeminiFallbackError: true })
}

export async function generateFeedback(
  _transcript: string,
  _scenarioContext: string
): Promise<string> {
  throw Object.assign(new Error('ระบบ AI ถูกปิดใช้งานชั่วคราว'), { status: 503, isGeminiFallbackError: true })
}
