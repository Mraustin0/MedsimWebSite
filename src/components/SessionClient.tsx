'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario } from '@/types'
import { cn } from '@/components/ui/cn'
import FeedbackPanel from '@/components/FeedbackPanel'
import { useSession } from '@/hooks/useSession'
import { useTimer } from '@/hooks/useTimer'
import { useOldcarts } from '@/hooks/useOldcarts'

const SESSION_DURATION = 10 * 60 // 10 minutes

interface Props {
  scenario: Scenario
}

export default function SessionClient({ scenario }: Props) {
  const router = useRouter()
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  // Auto-scroll on new messages
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  // Init first AI message
  useEffect(() => {
    initSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnd = () => {
    stopTimer()
    endSession()
  }

  const handleRetry = () => {
    resetSession()
    resetOldcarts()
    resetTimer()
    initSession()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
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
    <div className="min-h-screen bg-surface flex">
      {/* LEFT PANEL */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col gap-4 p-5 bg-surface-container-low border-r border-outline-variant/10 fixed top-0 left-0 h-full overflow-y-auto z-30">
        {/* Patient Card */}
        <div className="bg-surface-container-lowest rounded-2xl premium-shadow p-5 mt-16">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="avatar-halo mb-3">
              <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-3xl relative z-10">
                {scenario.gender === 'male' ? '👨' : '👩'}
              </div>
            </div>
            <h3 className="title-md text-on-surface">{scenario.name}</h3>
            <p className="body-md text-on-surface-variant">{scenario.age} ปี</p>
            <span className="mt-2 px-3 py-1 bg-tertiary-container/20 text-on-tertiary-container text-xs font-bold rounded-full">
              {scenario.chiefComplaint}
            </span>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {scenario.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-semibold rounded-full uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="bg-surface-container-lowest rounded-2xl premium-shadow p-5 flex flex-col items-center gap-2">
          <p className="label-sm text-on-surface-variant">เวลาที่เหลือ</p>
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(171,173,174,0.2)" strokeWidth="5"/>
              <circle cx="48" cy="48" r="40" fill="none"
                stroke={secondsLeft <= 60 ? '#B31B25' : secondsLeft <= 180 ? '#BA7517' : '#71E4B1'}
                strokeWidth="5"
                strokeDasharray={251}
                strokeDashoffset={251 - (251 * secondsLeft) / SESSION_DURATION}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className={cn(
              'absolute inset-0 flex items-center justify-center font-mono font-bold text-xl',
              secondsLeft <= 60 ? 'text-error' : secondsLeft <= 180 ? 'text-amber-600' : 'text-on-surface'
            )}>
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>

        {/* OLDCARTS Checklist */}
        <div className="bg-surface-container-lowest rounded-2xl premium-shadow p-5 flex-1">
          <div className="flex justify-between items-center mb-3">
            <p className="label-md text-on-surface-variant">OLDCARTS</p>
            <span className={cn(
              'label-md px-2 py-0.5 rounded-full',
              checkedCount >= 6 ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant'
            )}>
              {checkedCount}/8
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {oldcarts.map((item) => (
              <button
                key={item.key}
                onClick={() => toggle(item.key)}
                className={cn(
                  'flex items-center gap-2.5 text-left text-sm transition-all p-1.5 rounded-lg',
                  item.checked ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                <span className={cn(
                  'w-4 h-4 rounded flex items-center justify-center text-xs flex-shrink-0 transition-all',
                  item.checked ? 'bg-primary text-on-primary' : 'border border-outline-variant/50'
                )}>
                  {item.checked ? '✓' : ''}
                </span>
                <span className={cn('text-xs', item.checked && 'line-through opacity-60')}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 lg:ml-72 xl:ml-80 min-h-screen">
        {/* Top bar */}
        <header className="glass-nav sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-outline-variant/10">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
            <span>/</span>
            <span>Simulations</span>
            <span>/</span>
            <span className="text-on-surface font-medium truncate max-w-40">{scenario.name}</span>
          </div>
          <button
            onClick={handleEnd}
            className="px-4 py-1.5 rounded-lg border border-error text-error text-sm font-semibold hover:bg-error-container/20 transition-all active:scale-95"
          >
            จบ session
          </button>
        </header>

        {/* Chat area */}
        <div ref={chatRef} className="flex-1 overflow-y-auto chat-scroll p-5 xl:p-8 flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm flex-shrink-0 mt-5">
                  {scenario.gender === 'male' ? '👨' : '👩'}
                </div>
              )}
              <div className={cn('flex flex-col gap-1 max-w-[72%]', msg.role === 'user' ? 'items-end' : 'items-start')}>
                <p className="label-sm text-on-surface-variant px-1">
                  {msg.role === 'assistant' ? scenario.name : 'คุณ'}
                </p>
                <div className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'assistant'
                    ? 'bg-surface-container-low text-on-surface rounded-bl-sm border border-outline-variant/15'
                    : 'cta-gradient text-on-primary rounded-br-sm inner-pressed'
                )}>
                  {msg.content}
                </div>
                <p className="text-[10px] text-on-surface-variant/60 px-1">
                  {msg.timestamp.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm flex-shrink-0">
                {scenario.gender === 'male' ? '👨' : '👩'}
              </div>
              <div className="bg-surface-container-low border border-outline-variant/15 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input zone */}
        <div className="sticky bottom-0 bg-surface/95 backdrop-blur-sm border-t border-outline-variant/10 p-4">
          {/* Hints */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {hints.map((hint) => (
              <button
                key={hint}
                onClick={() => { setInput(hint); inputRef.current?.focus() }}
                className="flex-shrink-0 px-3 py-1.5 bg-surface-container-high text-on-surface-variant text-xs font-medium rounded-full hover:bg-surface-container-highest hover:text-primary border border-transparent hover:border-primary/20 transition-all"
              >
                {hint}
              </button>
            ))}
          </div>
          {/* Input row */}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="พิมพ์คำถามเพื่อซักประวัติ... (Enter เพื่อส่ง)"
              rows={1}
              className="flex-1 resize-none px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
              style={{ maxHeight: '96px' }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="cta-gradient p-3 rounded-xl text-on-primary active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
