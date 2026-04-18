export type InstructorView = 'Dashboard' | 'Scenarios' | 'Create' | 'Students' | 'Profile'

export interface ScenarioRecord {
  id: string
  name: string
  age: number
  gender: string
  chiefComplaint: string
  difficulty: string
  description: string
  systemPrompt: string
  tags: string[]
  createdAt: string
  createdBy?: { name: string }
}

export interface InstructorStats {
  totalScenarios: number
  totalSessions: number
  avgScore: number
  recentScenarios: ScenarioRecord[]
}

export interface StudentSummary {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
  totalSessions: number
  avgScore: number
  avgOldcarts: number
  totalDuration: number
  lastSession: string | null
  uniqueScenarios: number
}

export interface StudentSession {
  id: string
  scenarioId: string
  startedAt: string
  durationSeconds: number
  messageCount: number
  scores: {
    onset: number; location: number; duration: number; character: number
    aggravating: number; relieving: number; timing: number; severity: number
    overall: number
  } | null
  oldcartsCompleted: number
  good: string[]
  missed: string[]
  tips: string[]
  transcript: { role: string; content: string }[]
}

export interface StudentDetail {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
  sessions: StudentSession[]
}
