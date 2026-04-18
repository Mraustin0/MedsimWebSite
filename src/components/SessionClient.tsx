'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario } from '@/types'
import FeedbackPanel from '@/components/FeedbackPanel'
import { useSession } from '@/hooks/useSession'
import { useTimer } from '@/hooks/useTimer'
import { useOldcarts } from '@/hooks/useOldcarts'
import { useSound } from '@/hooks/useSound'

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
  const [showOldcartsSheet, setShowOldcartsSheet] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const playSound = useSound(soundEnabled)

  const { oldcarts, checkedCount, detectFromMessage, toggle, reset: resetOldcarts } = useOldcarts()

  const {
    messages, input, setInput, isLoading, isEndingSession, feedback, chatError,
    hints, userQuestionCount, hintsUsedCount, onHintUsed,
    initSession, sendMessage, endSession, resetSession,
  } = useSession({
    scenario,
    onMessageSent: (text) => { detectFromMessage(text); playSound('send') },
  })

  // Play sound when new AI message arrives
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1]?.role === 'assistant') {
      playSound('receive')
    }
  }, [messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const { secondsLeft, stop: stopTimer, reset: resetTimer, formatTime } = useTimer({
    duration: SESSION_DURATION,
    onTimeUp: endSession,
  })

  useEffect(() => {
    initSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnd = () => { stopTimer(); endSession() }
  const handleRetry = () => { resetSession(); resetOldcarts(); resetTimer(); initSession() }

  // Esc → end session confirm
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !feedback && !isEndingSession) handleEnd()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [feedback, isEndingSession]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isEndingSession) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-on-surface">กำลังวิเคราะห์ผล...</p>
          <p className="text-sm text-on-surface-variant">AI กำลังประเมินการซักประวัติของคุณ</p>
        </div>
      </div>
    )
  }

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

          {/* Chat Error Banner */}
          {chatError && (
            <div className="mx-4 mb-2 flex items-center gap-3 px-4 py-3 bg-error-container/80 border border-error/20 rounded-2xl text-on-error-container backdrop-blur-sm animate-fade-in">
              <span className="material-symbols-outlined !text-lg flex-shrink-0">error</span>
              <p className="text-sm font-semibold flex-1">{chatError}</p>
              <button
                onClick={() => initSession()}
                className="text-xs font-black uppercase tracking-wider px-3 py-1.5 bg-error text-on-error rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                ลองใหม่
              </button>
            </div>
          )}

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
            onHintUsed={() => { onHintUsed(); playSound('hint') }}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(v => !v)}
          />
        </main>
      </div>

      {/* ── Mobile OLDCARTS floating button ── */}
      <button
        onClick={() => setShowOldcartsSheet(true)}
        className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 cta-gradient rounded-2xl shadow-xl shadow-primary/30 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
        aria-label="Open OLDCARTS checklist"
      >
        <span className="material-symbols-outlined !text-xl text-white">checklist</span>
        <span className={cn(
          'text-[9px] font-black text-white/90 tabular-nums',
        )}>
          {checkedCount}/8
        </span>
      </button>

      {/* ── Mobile OLDCARTS bottom sheet ── */}
      {showOldcartsSheet && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowOldcartsSheet(false)}
          />

          {/* Sheet */}
          <div className="relative bg-surface rounded-t-[2rem] p-6 pb-10 space-y-5 animate-slide-up max-h-[80vh] overflow-y-auto chat-scroll">
            {/* Handle bar */}
            <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mb-2" />

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-on-surface text-lg">History Checklist</h3>
                <p className="text-xs text-on-surface-variant/60 font-medium">OLDCARTS Framework</p>
              </div>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-black border',
                checkedCount >= 6
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/10'
              )}>
                {checkedCount}/8
              </span>
            </div>

            {/* Timer strip */}
            <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl px-4 py-3">
              <span className={cn(
                'material-symbols-outlined !text-xl',
                secondsLeft <= 60 ? 'text-error' : 'text-primary'
              )}>timer</span>
              <div className="flex-1">
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-1000', secondsLeft <= 60 ? 'bg-error' : secondsLeft <= 180 ? 'bg-amber-500' : 'bg-primary')}
                    style={{ width: `${(secondsLeft / SESSION_DURATION) * 100}%` }}
                  />
                </div>
              </div>
              <span className={cn('font-mono text-sm font-black', secondsLeft <= 60 ? 'text-error' : 'text-primary')}>
                {formatTime(secondsLeft)}
              </span>
            </div>

            {/* OLDCARTS items */}
            <div className="space-y-2">
              {oldcarts.map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-2xl transition-all border text-left',
                    item.checked
                      ? 'bg-primary-container/20 border-primary/10 text-on-primary-container'
                      : 'border-outline-variant/10 text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all',
                    item.checked ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container border-outline-variant/30'
                  )}>
                    {item.checked && <span className="material-symbols-outlined !text-sm">check</span>}
                  </div>
                  <span className={cn('text-sm font-semibold', item.checked && 'line-through opacity-50')}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* End session button */}
            <button
              onClick={() => { setShowOldcartsSheet(false); handleEnd() }}
              className="w-full py-4 rounded-2xl bg-error/10 text-error font-black border border-error/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined !text-xl">stop_circle</span>
              End Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}