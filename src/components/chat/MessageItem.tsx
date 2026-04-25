'use client'

import React, { useState } from 'react'
import { Message, Scenario } from '@/types'
import { cn } from '@/components/ui/cn'

interface MessageItemProps {
  message: Message
  scenario: Scenario
}

export default function MessageItem({ message, scenario }: MessageItemProps) {
  const isAssistant = message.role === 'assistant'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[88%] lg:max-w-[78%] animate-message-in min-w-0 group/msg',
        isAssistant ? 'justify-start self-start' : 'justify-end self-end flex-row-reverse'
      )}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm flex-shrink-0 mt-1 shadow-sm text-on-surface-variant">
          <span className="material-symbols-outlined !text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </div>
      )}

      <div className={cn('flex flex-col gap-1 min-w-0', isAssistant ? 'items-start' : 'items-end')}>
        <p className="label-sm text-on-surface-variant/70 px-1 font-bold">
          {isAssistant ? scenario.name : 'Medical Student'}
        </p>

        <div className="relative">
          <div
            className={cn(
              'px-5 py-3 rounded-2xl text-[15px] leading-relaxed premium-shadow-md border break-words overflow-hidden',
              isAssistant
                ? 'bg-surface-container-lowest text-on-surface rounded-tl-sm border-outline-variant/10'
                : 'cta-gradient text-on-primary rounded-tr-sm border-transparent'
            )}
          >
            {message.content}
          </div>

          {/* Copy button — appears on hover */}
          <button
            onClick={handleCopy}
            className={cn(
              'absolute -bottom-2 opacity-0 group-hover/msg:opacity-100 transition-all duration-200',
              'bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-2 py-0.5',
              'flex items-center gap-1 shadow-sm text-on-surface-variant/60 hover:text-primary hover:border-primary/20 active:scale-95',
              isAssistant ? 'left-2' : 'right-2'
            )}
            title="Copy message"
          >
            <span className="material-symbols-outlined !text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span className="text-[10px] font-bold">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>

        <p className="text-[10px] text-on-surface-variant/50 px-1 font-mono mt-0.5">
          {new Date(message.timestamp).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
