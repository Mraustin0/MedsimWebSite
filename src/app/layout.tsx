import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedSim — ระบบจำลองการซักประวัติผู้ป่วย',
  description: 'ฝึกทักษะการซักประวัติผู้ป่วยด้วย AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
