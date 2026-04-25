import { useState, useRef, useCallback } from 'react'
import { Message, Scenario, Feedback } from '@/types'

const HINTS = [
  'ถามเรื่อง onset เริ่มเมื่อไหร่',
  'ถามตำแหน่งที่ปวด',
  'ถามระยะเวลา',
  'ถามลักษณะอาการ',
  'ถามความรุนแรง 1-10',
  'ถามประวัติโรคเดิม',
  'ถามยาที่กินอยู่',
  'ถามอาการร่วม',
]

interface UseSessionOptions {
  scenario: Scenario
  onMessageSent?: (text: string) => void
}

export function useSession({ scenario, onMessageSent }: UseSessionOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [hintsUsedCount, setHintsUsedCount] = useState(0)
  const startTimeRef = useRef<number>(Date.now())
  const dbSessionIdRef = useRef<string | null>(null)

  const initSession = useCallback(async () => {
    setIsLoading(true)
    setChatError(null)
    try {
      // Create session in DB
      const sessionRes = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scenario.id }),
      })
      const sessionData = await sessionRes.json()
      dbSessionIdRef.current = sessionData.sessionId || null

      // Get first AI message
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: dbSessionIdRef.current,
          message: 'เริ่ม session โดยแนะนำตัวและบอกอาการหลักที่มาโรงพยาบาลวันนี้',
          history: [],
          systemPrompt: scenario.systemPrompt,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.message) {
        setChatError(data.message ?? 'ไม่สามารถเชื่อมต่อ AI ได้ กรุณาลองใหม่')
        return
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
      setMessages([aiMsg])
    } catch (e) {
      console.error(e)
      setChatError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }, [scenario.id, scenario.systemPrompt])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || sessionEnded) return
    const text = input.trim()
    setInput('')
    setChatError(null)

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    onMessageSent?.(text)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: dbSessionIdRef.current,
          message: text,
          history,
          systemPrompt: scenario.systemPrompt,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.message) {
        setChatError(data.message ?? 'AI ไม่ตอบสนอง กรุณาลองใหม่')
        return
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (e) {
      console.error(e)
      setChatError('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, sessionEnded, messages, scenario.systemPrompt, onMessageSent])

  const endSession = useCallback(async () => {
    if (sessionEnded) return
    setSessionEnded(true)
    setIsEndingSession(true)

    const transcript = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n')

    const fallbackFeedback: Feedback = {
      scores: { onset: 0, location: 0, duration: 0, character: 0, aggravating: 0, relieving: 0, timing: 0, severity: 0, overall: 0 },
      good: [],
      missed: [],
      tips: ['ไม่สามารถวิเคราะห์ได้ในขณะนี้'],
      totalQuestions: messages.filter(m => m.role === 'user').length,
      oldcartsCompleted: 0,
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: dbSessionIdRef.current,
          transcript,
          scenarioId: scenario.chiefComplaint,
          durationSeconds: Math.round((Date.now() - startTimeRef.current) / 1000),
          hintsUsed: hintsUsedCount,
        }),
      })
      const fb = await res.json()
      setFeedback(fb)
    } catch (e) {
      console.error(e)
      setFeedback(fallbackFeedback)
    } finally {
      setIsEndingSession(false)
    }
  }, [sessionEnded, messages, scenario.chiefComplaint])

  const onHintUsed = useCallback(() => {
    setHintsUsedCount((c) => c + 1)
  }, [])

  const resetSession = useCallback(() => {
    setFeedback(null)
    setSessionEnded(false)
    setIsEndingSession(false)
    setMessages([])
    setChatError(null)
    setHintsUsedCount(0)
    startTimeRef.current = Date.now()
    dbSessionIdRef.current = null
  }, [])

  const userQuestionCount = messages.filter((m) => m.role === 'user').length

  return {
    messages,
    input,
    setInput,
    isLoading,
    isEndingSession,
    sessionEnded,
    feedback,
    chatError,
    hints: HINTS,
    userQuestionCount,
    hintsUsedCount,
    onHintUsed,
    initSession,
    sendMessage,
    endSession,
    resetSession,
  }
}
