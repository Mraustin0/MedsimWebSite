# MedSim — ระบบจำลองการซักประวัติผู้ป่วย

ระบบ AI simulation สำหรับนักศึกษาแพทย์/พยาบาลฝึกซักประวัติผู้ป่วย

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Design System "Clinical Sanctuary"
- **AI**: Anthropic Claude (claude-sonnet-4-20250514)
- **Font**: Plus Jakarta Sans, JetBrains Mono

## Project Structure
```
src/
├── app/
│   ├── dashboard/page.tsx       # หน้าเลือก scenario
│   ├── session/[id]/page.tsx    # หน้าแชทซักประวัติ
│   └── api/
│       ├── chat/route.ts        # API: คุยกับผู้ป่วย AI
│       └── feedback/route.ts    # API: วิเคราะห์ผล
├── components/
│   ├── ScenarioCard.tsx         # Card แสดงผู้ป่วย
│   ├── SessionClient.tsx        # ห้องแชท (client component)
│   └── FeedbackPanel.tsx        # หน้าผลวิเคราะห์
├── lib/
│   ├── anthropic.ts             # Anthropic SDK wrapper
│   └── scenarios.ts             # ข้อมูล scenario ผู้ป่วย
└── types/index.ts               # TypeScript types ทั้งหมด
```

## Setup

### 1. Clone & Install
```bash
git clone <repo-url>
cd medsim
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
# แก้ไขใส่ค่าจริง
```

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run Development
```bash
npm run dev
# เปิด http://localhost:3000
```

## Branching Strategy
```
main        ← production
develop     ← รวม features ก่อน merge
feat/*      ← feature branches
fix/*       ← bug fixes

