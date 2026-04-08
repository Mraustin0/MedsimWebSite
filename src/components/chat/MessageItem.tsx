import React from 'react'
import { Message, Scenario } from '@/types'
import { cn } from '@/components/ui/cn'

interface MessageItemProps {
  message: Message
  scenario: Scenario
}

export default function MessageItem({ message, scenario }: MessageItemProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[90%] lg:max-w-[80%] animate-fade-in',
        isAssistant ? 'justify-start self-start' : 'justify-end self-end flex-row-reverse'
      )}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm flex-shrink-0 mt-1 shadow-sm text-on-surface-variant">
          <span className="material-symbols-outlined !text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </div>
      )}

      <div className={cn('flex flex-col gap-1', isAssistant ? 'items-start' : 'items-end')}>
        <p className="label-sm text-on-surface-variant/70 px-1 font-bold">
          {isAssistant ? scenario.name : 'Medical Student'}
        </p>
        
        <div
          className={cn(
            'px-5 py-3 rounded-2xl text-[15px] leading-relaxed premium-shadow-md border',
            isAssistant
              ? 'bg-surface-container-lowest text-on-surface rounded-tl-sm border-outline-variant/10'
              : 'cta-gradient text-on-primary rounded-tr-sm border-transparent'
          )}
        >
          {message.content}
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
