// ========== NextAuth Type Extensions ==========
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'STUDENT' | 'INSTRUCTOR'
      avatarUrl?: string | null
      yearOfStudy?: string | null
      specialty?: string | null
      university?: string | null
    }
  }

  interface User {
    role: 'STUDENT' | 'INSTRUCTOR'
    avatarUrl?: string | null
    yearOfStudy?: string | null
    specialty?: string | null
    university?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'STUDENT' | 'INSTRUCTOR'
    avatarUrl?: string | null
    yearOfStudy?: string | null
    specialty?: string | null
    university?: string | null
  }
}

// ========== Domain Types ==========

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface Scenario {
  id: string
  name: string
  age: number
  gender: 'male' | 'female'
  chiefComplaint: string
  description: string
  difficulty: DifficultyLevel
  avatarUrl?: string
  systemPrompt: string
  tags: string[]
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface OldcartsItem {
  key: string
  label: string
  checked: boolean
}

export interface Session {
  id: string
  userId: string
  scenarioId: string
  scenario: Scenario
  messages: Message[]
  oldcarts: OldcartsItem[]
  startedAt: Date
  endedAt?: Date
  feedback?: Feedback
  durationSeconds?: number
}

export interface FeedbackScores {
  onset: number
  location: number
  duration: number
  character: number
  aggravating: number
  relieving: number
  timing: number
  severity: number
  overall: number
}

export interface Feedback {
  scores: FeedbackScores
  good: string[]
  missed: string[]
  tips: string[]
  totalQuestions: number
  oldcartsCompleted: number
  hintsUsed?: number
}

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'instructor'
  avatarUrl?: string
}

// ========== API Types ==========

export interface ChatRequest {
  sessionId: string
  message: string
  history: { role: 'user' | 'assistant'; content: string }[]
  systemPrompt: string
}

export interface ChatResponse {
  message: string
  detectedTopics?: string[]
}

export interface FeedbackRequest {
  sessionId: string
  transcript: string
  scenarioId: string
  durationSeconds: number
  hintsUsed?: number
}
