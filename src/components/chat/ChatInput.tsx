import React, { useRef } from 'react'
import { cn } from '@/components/ui/cn'

interface ChatInputProps {
  input: string
  setInput: (val: string) => void
  onSend: () => void
  isLoading: boolean
  hints: string[]
  onHintUsed?: () => void
  soundEnabled?: boolean
  onToggleSound?: () => void
}

export default function ChatInput({ input, setInput, onSend, isLoading, hints, onHintUsed, soundEnabled = true, onToggleSound }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (no shift) OR Cmd/Ctrl+Enter
    if (e.key === 'Enter' && (!e.shiftKey || e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSend()
    }
  }

  const handleHintClick = (hint: string) => {
    setInput(hint)
    textareaRef.current?.focus()
    onHintUsed?.()
  }

  return (
    <div className="bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant/10 p-4 lg:p-6 pb-6 lg:pb-8">
      {/* Hints + Sound Toggle row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar flex-1">
          {hints.map((hint, idx) => (
            <button
              key={idx}
              onClick={() => handleHintClick(hint)}
              disabled={isLoading}
              className="flex-shrink-0 px-4 py-1.5 bg-surface-container/50 text-on-surface-variant text-xs font-semibold rounded-full hover:bg-primary-container hover:text-on-primary-container border border-outline-variant/5 border-transparent hover:border-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {hint}
            </button>
          ))}
        </div>
        {onToggleSound && (
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            className="flex-shrink-0 p-2 rounded-full text-on-surface-variant/40 hover:text-primary hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined !text-lg">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>
        )}
      </div>
      {/* Input row */}
      <div className="flex gap-3 items-end relative">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="ถามคำถามเพื่อซักประวัติ... (Enter ส่ง)"
            rows={1}
            className="w-full resize-none pl-5 pr-12 py-3.5 bg-surface-container/40 border border-outline-variant/15 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-50 chat-scroll"
            style={{ maxHeight: '120px' }}
          />
        </div>
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className={cn(
            'p-3.5 rounded-2xl text-on-primary active:scale-95 transition-all flex-shrink-0 shadow-lg',
            input.trim() ? 'cta-gradient shadow-primary/20' : 'bg-surface-container text-on-surface-variant/40'
          )}
        >
          <svg
            className="w-5 h-5 rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
