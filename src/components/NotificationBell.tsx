'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/components/ui/cn'

interface Notification {
  id: string
  title: string
  body: string
  icon: string
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setNotifications(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch('/api/notifications', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'เมื่อกี้'
    if (mins < 60) return `${mins} นาทีที่แล้ว`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    return `${Math.floor(hours / 24)} วันที่แล้ว`
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) fetchNotifications() }}
        className="relative p-2.5 text-on-surface-variant hover:bg-surface-container rounded-2xl transition-all active:scale-95 group"
      >
        <span className="material-symbols-outlined !text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-error text-on-error text-[10px] font-black rounded-full border-2 border-surface flex items-center justify-center px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-[1.5rem] premium-shadow border border-outline-variant/10 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
            <p className="font-black text-on-surface text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto chat-scroll">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined !text-4xl text-on-surface-variant/20">notifications_none</span>
                <p className="text-xs text-on-surface-variant/50 font-medium mt-2">ยังไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-b border-outline-variant/5 last:border-0 transition-all group/notif',
                    !n.read ? 'bg-primary/3' : 'hover:bg-surface-container/30'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                    !n.read ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant/60'
                  )}>
                    <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-bold text-on-surface leading-tight', !n.read && 'text-on-surface')}>{n.title}</p>
                    <p className="text-xs text-on-surface-variant/60 font-medium mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-on-surface-variant/30 font-bold mt-1 uppercase tracking-wider">{relativeTime(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                  <button
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="opacity-0 group-hover/notif:opacity-100 transition-opacity p-1 rounded-full hover:bg-surface-container text-on-surface-variant/40"
                  >
                    <span className="material-symbols-outlined !text-base">close</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
