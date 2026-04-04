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
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const initSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'เริ่ม session โดยแนะนำตัวและบอกอาการหลักที่มาโรงพยาบาลวันนี้',
          history: [],
          systemPrompt: scenario.systemPrompt,
        }),
      })
      const data = await res.json()
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
      setMessages([aiMsg])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [scenario.systemPrompt])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || sessionEnded) return
    const text = input.trim()
    setInput('')

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
          message: text,
          history,
          systemPrompt: scenario.systemPrompt,
        }),
      })
      const data = await res.json()
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, sessionEnded, messages, scenario.systemPrompt, onMessageSent])

  const endSession = useCallback(async () => {
    if (sessionEnded) return
    setSessionEnded(true)

    const transcript = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          scenarioId: scenario.chiefComplaint,
          durationSeconds: Math.round((Date.now() - startTimeRef.current) / 1000),
        }),
      })
      const fb = await res.json()
      setFeedback(fb)
    } catch (e) {
      console.error(e)
    }
  }, [sessionEnded, messages, scenario.chiefComplaint])

  const resetSession = useCallback(() => {
    setFeedback(null)
    setSessionEnded(false)
    setMessages([])
    startTimeRef.current = Date.now()
  }, [])

  const userQuestionCount = messages.filter((m) => m.role === 'user').length

  return {
    messages,
    input,
    setInput,
    isLoading,
    sessionEnded,
    feedback,
    hints: HINTS,
    userQuestionCount,
    initSession,
    sendMessage,
    endSession,
    resetSession,
  }
}
