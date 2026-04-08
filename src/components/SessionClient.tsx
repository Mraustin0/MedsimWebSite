'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario } from '@/types'
import FeedbackPanel from '@/components/FeedbackPanel'
import { useSession } from '@/hooks/useSession'
import { useTimer } from '@/hooks/useTimer'
import { useOldcarts } from '@/hooks/useOldcarts'

// Import new modular components
import Sidebar from '@/components/chat/Sidebar'
import Header from '@/components/chat/Header'
import MessageList from '@/components/chat/MessageList'
import ChatInput from '@/components/chat/ChatInput'
import { cn } from '@/components/ui/cn'

const SESSION_DURATION = 10 * 60

interface Props {
  scenario: Scenario
}

export default function SessionClient({ scenario }: Props) {
  const router = useRouter()
  const [showPatientInfo, setShowPatientInfo] = useState(false)

  const { oldcarts, checkedCount, detectFromMessage, toggle, reset: resetOldcarts } = useOldcarts()

  const {
    messages, input, setInput, isLoading, feedback,
    hints, userQuestionCount,
    initSession, sendMessage, endSession, resetSession,
  } = useSession({
    scenario,
    onMessageSent: detectFromMessage,
  })

  const { secondsLeft, stop: stopTimer, reset: resetTimer, formatTime } = useTimer({
    duration: SESSION_DURATION,
    onTimeUp: endSession,
  })

  useEffect(() => {
    initSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnd = () => { stopTimer(); endSession() }
  const handleRetry = () => { resetSession(); resetOldcarts(); resetTimer(); initSession() }

  if (feedback) {
    return (
      <FeedbackPanel
        feedback={feedback}
        scenario={scenario}
        durationSeconds={SESSION_DURATION - secondsLeft}
        totalQuestions={userQuestionCount}
        onRetry={handleRetry}
        onBack={() => router.push('/dashboard')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-surface flex selection:bg-primary-container selection:text-on-primary-container">
      {/* Desktop Sidebar */}
      <Sidebar
        scenario={scenario}
        secondsLeft={secondsLeft}
        formatTime={formatTime}
        oldcarts={oldcarts}
        checkedCount={checkedCount}
        toggleOldcarts={toggle}
        onEndSession={handleEnd}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 ml-0 lg:ml-[320px] xl:ml-[360px] min-h-screen relative">
        <Header
          scenario={scenario}
          secondsLeft={secondsLeft}
          formatTime={formatTime}
          onEndSession={handleEnd}
          onTogglePatientInfo={() => setShowPatientInfo(!showPatientInfo)}
          showPatientInfo={showPatientInfo}
        />

        <main className="flex-1 flex flex-col bg-surface-container-lowest lg:m-4 lg:rounded-[2.5rem] lg:premium-shadow-md border border-outline-variant/5 overflow-hidden relative">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

          {/* Message List Area */}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            scenario={scenario}
          />

          {/* Mobile-only: Patient Info Slide-up (logic omitted for brevity, but can be added) */}
          {showPatientInfo && (
            <div className="lg:hidden absolute inset-0 z-40 bg-surface/95 backdrop-blur-md p-6 animate-fade-in overflow-y-auto">
              <button onClick={() => setShowPatientInfo(false)} className="absolute top-4 right-4 p-2 bg-surface-container rounded-full">✕</button>
              <h2 className="headline-md mb-4">{scenario.name}</h2>
              <p className="body-lg mb-6">{scenario.description}</p>
              {/* Add more info here */}
            </div>
          )}

          {/* Input zone */}
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            isLoading={isLoading}
            hints={hints}
          />
        </main>
      </div>
    </div>
  )
}