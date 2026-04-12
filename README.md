# MedSim — AI-Powered Medical History-Taking Simulator

MedSim trains medical students in patient history-taking using the **OLDCARTS framework** (Onset, Location, Duration, Character, Aggravating, Relieving, Timing, Severity). Students interview an AI patient in Thai, then receive instant feedback scored by AI.

**Live:** [medsim-five.vercel.app](https://medsim-five.vercel.app)

---

## Quick Start (< 5 minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL database (Aiven Cloud or local)
- Google Gemini API key → [aistudio.google.com](https://aistudio.google.com)

### 1. Clone & install

```bash
git clone https://github.com/Mraustin0/MedsimWebSite.git
cd medsim
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
NEXTAUTH_SECRET=run_openssl_rand_hex_32_here
NEXTAUTH_URL=http://localhost:3000
INSTRUCTOR_CODE=any-secret-code
```

> Generate NEXTAUTH_SECRET: `openssl rand -hex 32`

### 3. Set up database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Roles

| Role | Access | How to get |
|------|--------|-----------|
| **Student** | Dashboard, Sessions, Profile | Sign up with any email |
| **Instructor** | All + Scenario management, Student analytics | Sign up → call `POST /api/instructor/verify` with `INSTRUCTOR_CODE` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| AI | Google Gemini (2.5-flash with fallback chain) |
| Auth | NextAuth v4 (JWT, Google OAuth, Credentials) |
| Database | PostgreSQL via Prisma ORM (Aiven Cloud) |
| Styling | Tailwind CSS |
| Deployment | Vercel (main branch only) |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth handler
│   │   ├── chat/           # AI patient chat
│   │   ├── feedback/       # AI feedback generation
│   │   ├── scenarios/      # Scenario CRUD
│   │   ├── session/        # Session tracking & stats
│   │   ├── instructor/     # Student analytics, role verify
│   │   └── user/           # Profile update
│   ├── dashboard/          # Student home
│   ├── instructor/         # Instructor portal
│   ├── login/              # Auth page
│   ├── profile/            # Student profile
│   └── session/[id]/       # Live chat session
├── components/             # Reusable UI components
├── hooks/
│   └── useSession.ts       # Chat state management
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client singleton
│   └── gemini.ts           # Gemini AI integration + fallback
├── types/
│   └── index.ts            # TypeScript types + NextAuth extensions
└── middleware.ts            # Route protection & role redirects
```

---

## Scripts

```bash
npm run dev      # Development server (hot reload)
npm run build    # Production build
npm run lint     # ESLint check
npx prisma studio   # Visual DB browser
```

---

## Branch Strategy

```
main  ← production (Vercel auto-deploys on push)
dev   ← development (no Vercel deploy)
```

Always develop on `dev`, merge to `main` when ready to release.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random 32-char secret for JWT signing |
| `NEXTAUTH_URL` | ✅ | Base URL (`http://localhost:3000` locally) |
| `INSTRUCTOR_CODE` | ✅ | Secret code to promote users to instructor role |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
