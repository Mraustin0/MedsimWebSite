import React, { useEffect, useRef } from 'react'
import { Message, Scenario } from '@/types'
import { cn } from '@/components/ui/cn'
import MessageItem from './MessageItem'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  scenario: Scenario
}

export default function MessageList({ messages, isLoading, scenario }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isLoading])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overflow-x-hidden chat-scroll p-4 lg:p-6 xl:p-8 flex flex-col gap-4"
    >
      {/* Simulation Started Badge */}
      {messages.length > 0 && (
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 bg-surface-container text-on-surface-variant text-[10px] uppercase tracking-wider font-bold rounded-full border border-outline-variant/10">
            Simulation Started
          </span>
        </div>
      )}

      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} scenario={scenario} />
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start items-start animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm flex-shrink-0 mt-1 shadow-sm text-on-surface-variant">
            <span className="material-symbols-outlined !text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-outline-variant/10">
            <div className="flex gap-1.5 items-center h-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
