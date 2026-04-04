import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerOptions {
  duration: number // seconds
  onTimeUp: () => void
}

export function useTimer({ duration, onTimeUp }: UseTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(duration)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          onTimeUp()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const reset = useCallback(() => {
    setSecondsLeft(duration)
    startTimeRef.current = Date.now()
  }, [duration])

  const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return { secondsLeft, elapsed, stop, reset, formatTime }
}
