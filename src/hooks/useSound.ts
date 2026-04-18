import { useCallback, useRef } from 'react'

type SoundType = 'send' | 'receive' | 'end' | 'hint'

function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)()
  } catch {
    return null
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.18,
  delay = 0,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay)
  gain.gain.setValueAtTime(0, ctx.currentTime + delay)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration + 0.05)
}

function playSend(ctx: AudioContext) {
  playTone(ctx, 880, 0.07, 'sine', 0.15)
  playTone(ctx, 1320, 0.07, 'sine', 0.1, 0.06)
}

function playReceive(ctx: AudioContext) {
  playTone(ctx, 660, 0.06, 'sine', 0.12)
  playTone(ctx, 880, 0.08, 'sine', 0.12, 0.07)
  playTone(ctx, 1100, 0.1, 'sine', 0.1, 0.14)
}

function playEnd(ctx: AudioContext) {
  // Gentle descending chord
  playTone(ctx, 523, 0.3, 'sine', 0.14)
  playTone(ctx, 659, 0.25, 'sine', 0.1, 0.1)
  playTone(ctx, 784, 0.2, 'sine', 0.08, 0.2)
}

function playHint(ctx: AudioContext) {
  playTone(ctx, 1046, 0.06, 'sine', 0.12)
  playTone(ctx, 1318, 0.08, 'sine', 0.1, 0.07)
}

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback(
    (type: SoundType) => {
      if (!enabled) return
      if (!ctxRef.current) ctxRef.current = createAudioContext()
      const ctx = ctxRef.current
      if (!ctx) return
      // Resume if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})

      switch (type) {
        case 'send': playSend(ctx); break
        case 'receive': playReceive(ctx); break
        case 'end': playEnd(ctx); break
        case 'hint': playHint(ctx); break
      }
    },
    [enabled],
  )

  return play
}
