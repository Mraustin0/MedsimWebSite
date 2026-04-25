# MedSim Architecture

## Overview

MedSim is a Next.js 15 full-stack web app. All backend logic lives in API routes (App Router). The frontend communicates with these routes via `fetch`. There is no separate backend service.

---

## System Diagram

```
Browser
  │
  ├── GET /dashboard, /instructor, /session/[id]   ← Next.js Pages (RSC + Client Components)
  │
  └── fetch() API Calls
        │
        ├── /api/auth/*          ← NextAuth (JWT session)
        ├── /api/chat            ← Gemini AI patient chat
        ├── /api/feedback        ← Gemini AI feedback analysis
        ├── /api/scenarios/*     ← Scenario CRUD (Prisma → PostgreSQL)
        ├── /api/session/*       ← Session tracking & stats
        ├── /api/instructor/*    ← Student performance analytics
        └── /api/user/update     ← Profile management

                    ↓
            lib/gemini.ts        ← Gemini API with model fallback chain
            lib/auth.ts          ← NextAuth configuration
            lib/db.ts            ← Prisma client singleton
                    ↓
            PostgreSQL (Aiven Cloud)
```

---

## Data Model

```
User
 ├── id, name, email, role (STUDENT | INSTRUCTOR)
 ├── specialty, yearOfStudy, university, avatarUrl
 └── sessions[], scenarios[]

ScenarioRecord
 ├── id, name, age, gender, chiefComplaint
 ├── description, difficulty, systemPrompt, tags[]
 └── createdById → User

Session
 ├── id, userId → User, scenarioId → ScenarioRecord
 ├── startedAt, endedAt, durationSeconds
 ├── messages[] → Message
 └── feedback? → Feedback

Message
 ├── id, sessionId, role (USER | ASSISTANT)
 └── content, createdAt

Feedback
 ├── sessionId (unique)
 ├── scoreOnset, scoreLocation, scoreDuration, scoreCharacter,
 │   scoreAggravating, scoreRelieving, scoreTiming, scoreSeverity, scoreOverall
 └── good[], missed[], tips[], totalQuestions, oldcartsCompleted
```

---

## Authentication Flow

```
1. User visits /login
2. NextAuth handles credentials or Google OAuth
3. On success → JWT token created with { id, role, specialty, ... }
4. middleware.ts checks token on every protected route:
   - No token → redirect /login
   - STUDENT accessing /instructor/* → redirect /dashboard
   - INSTRUCTOR accessing /dashboard → redirect /instructor
   - Any role at /login → redirect to their home
5. session.user available in all Server/Client components via useSession()
```

---

## Student Session Flow

```
1. /dashboard — load ScenarioRecord list from DB (Server Component)
2. Student picks scenario → navigate /session/[id]
3. POST /api/session — create Session record in DB
4. POST /api/chat (on each message):
   - Save user message to Message table
   - Send history + systemPrompt to Gemini
   - Save AI response to Message table
   - Return AI response to client
5. Student clicks "End Session"
6. POST /api/feedback:
   - Send full transcript to Gemini for OLDCARTS analysis
   - Parse JSON scores from AI response
   - Save Feedback record to DB
   - Update Session.endedAt, durationSeconds
7. Client renders FeedbackPanel with scores
```

---

## AI Integration (lib/gemini.ts)

### Model Fallback Chain

Gemini API calls go through `withModelFallback()` which retries across models on quota/unavailability:

```
Chat:     gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash → gemini-2.0-flash-lite → gemini-1.5-pro
Generate: gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash → gemini-2.0-flash-lite
```

### Chat History Fix

Gemini requires chat history to start with a `user` turn. Since `initSession` stores only the AI greeting (no user message), the first real message would fail. Fix: prepend a synthetic `{ role: 'user', text: 'เริ่มต้น' }` if history starts with `model`.

### Feedback Parsing

AI returns JSON inside markdown code blocks. Parser strips `` ```json `` fences then `JSON.parse()`. Falls back to zero scores if parsing fails.

---

## Role Authorization

| API Endpoint | Required Role |
|---|---|
| `POST /api/scenarios` | INSTRUCTOR |
| `PATCH /api/scenarios/[id]` | INSTRUCTOR |
| `DELETE /api/scenarios/[id]` | INSTRUCTOR |
| `GET /api/instructor/stats` | INSTRUCTOR |
| `GET /api/instructor/students` | INSTRUCTOR |
| `GET /api/instructor/students/[id]` | INSTRUCTOR |
| All other endpoints | Authenticated user (any role) |

All checks use `getServerSession(authOptions)` — role is read from the JWT token, not DB (fast, no extra query).

---

## Deployment

```
GitHub (main branch push)
  ↓
Vercel auto-deploy (vercel.json ignores non-main branches)
  ↓
medsim-five.vercel.app
```

Environment variables are set in Vercel project settings. Database (Aiven PostgreSQL) is external and shared between local dev and production — use a separate dev database if needed.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Next.js API routes (no separate backend) | Simpler deploy, one codebase, Vercel serverless |
| JWT sessions (not database sessions) | No session table, stateless, fast auth checks |
| Gemini model fallback chain | Free tier quota limits — graceful degradation |
| All feedback in Thai | Target users are Thai medical students |
| Vercel deploy from `main` only | Prevent accidental production deploys from feature branches |
| Prisma `select` on list endpoints | Avoids fetching large fields (systemPrompt) unnecessarily |
