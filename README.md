# 🚀 Coding Wallah - Full-Stack EdTech Architecture & System Blueprint

> **"Apna Code, Apni Revolution"**  
> India's premier, scalable, high-concurrency coding education platform featuring live batch streaming, AI-powered code doubt resolution, real-time telemetry attendance tracking, proctored test analysis, and peer-to-peer coding arenas.

---

## 📁 1. Complete Full-Stack Production Folder Structure

```
coding-wallah/
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml              # Lint, test, preview deployments
│       └── backend-docker.yml           # Build Docker container, push to ECR/GCR
├── client/                              # Next.js 14 / React Frontend (App Router)
│   ├── public/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── src/
│   │   ├── app/                         # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── signup/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── student/
│   │   │   │   │   ├── attendance/page.tsx
│   │   │   │   │   ├── my-batches/page.tsx
│   │   │   │   │   └── analytics/page.tsx
│   │   │   │   └── instructor/
│   │   │   │       ├── live-studio/page.tsx
│   │   │   │       ├── batch-management/page.tsx
│   │   │   │       └── test-creation/page.tsx
│   │   │   ├── batches/
│   │   │   │   ├── [batchId]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── test-portal/
│   │   │   │   ├── [testId]/
│   │   │   │   │   ├── exam/page.tsx
│   │   │   │   │   └── analyzer/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── question-bank/
│   │   │   │   ├── [slug]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── notes-pyq/page.tsx
│   │   │   ├── p2p-arena/page.tsx
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   ├── AiDoubtSolver.tsx    # Floating AST & Code Debugger widget
│   │   │   │   └── CodeASTVisualizer.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── AccuracyChart.tsx    # Chart.js / Recharts accuracy trends
│   │   │   │   └── AttendanceTimer.tsx  # WebWorker real-time attendance ticker
│   │   │   ├── test-portal/
│   │   │   │   ├── MonacoCodeEditor.tsx # In-browser code runner
│   │   │   │   └── QuestionNavigator.tsx
│   │   │   ├── gamification/
│   │   │   │   ├── StreakCalendar.tsx   # Daily activity heatmap
│   │   │   │   └── WallahQuestModal.tsx # XP & coin claims
│   │   │   └── p2p/
│   │   │       ├── CodeReviewFeed.tsx   # Diff viewer & peer commenting
│   │   │       └── DuelArena.tsx        # 1v1 WebSocket live coding match
│   │   ├── hooks/
│   │   │   ├── useAttendanceTracker.ts  # Window focus + heartbeat sync hook
│   │   │   ├── useCodeRunner.ts         # Remote Judge0/Judge execution
│   │   │   └── useSocket.ts             # Socket.io connection provider
│   │   ├── lib/
│   │   │   ├── api-client.ts            # Axios / Fetch with JWT interceptors
│   │   │   └── utils.ts
│   │   └── styles/
│   │       └── globals.css              # Tailwind CSS directives
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                              # Node.js / Express / Fastify Microservices
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts              # PostgreSQL (Prisma / Drizzle ORM)
│   │   │   ├── redis.ts                 # Redis cache & PubSub for real-time duels
│   │   │   └── s3.ts                    # AWS S3 for Lecture PPT & PYQ PDF storage
│   │   ├── modules/
│   │   │   ├── auth/                    # RBAC (Student, Instructor, Admin)
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── attendance/              # Real-time Telemetry & Heartbeat engine
│   │   │   │   ├── attendance.controller.ts
│   │   │   │   └── attendance.service.ts
│   │   │   ├── tests/                   # Proctoring, accuracy telemetry, grading
│   │   │   │   ├── test.analyzer.ts
│   │   │   │   └── test.routes.ts
│   │   │   ├── questions/               # Tag filtering, difficulty, company sheets
│   │   │   │   └── question.routes.ts
│   │   │   ├── p2p-arena/               # 1v1 matchmaking WebSocket engine
│   │   │   │   └── arena.gateway.ts
│   │   │   └── notes/                   # S3 pre-signed downloads for PPTs & PYQs
│   │   ├── middlewares/
│   │   │   ├── verifyJwt.ts
│   │   │   ├── roleGuard.ts
│   │   │   └── rateLimiter.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
│
├── ai-service/                          # Dedicated Fast-API / Python AI Microservice
│   ├── app/
│   │   ├── routes/
│   │   │   ├── doubt_solver.py          # AST parser, static error analysis & LLM prompt
│   │   │   └── test_recommendation.py   # Vector similarity for student weak spots
│   │   ├── models/
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml                   # Postgres, Redis, Client, Server, AI Service
└── index.html                           # Zero-dependency, live standalone preview app
```

---

## 🌟 2. Innovative Features Highlight

### Innovative Feature 1: **Gamified Coding Streak & Daily Quest Engine**
* **Mechanism**: Every day students must spend at least 30 minutes in lectures or solve 1 algorithmic challenge to prevent streak freeze.
* **Incentive**: Consecutive streaks grant **Wallah Coins**, which can be redeemed for exclusive hardcopy course books, T-shirts, or 1-on-1 mock interviews with FAANG mentors.

### Innovative Feature 2: **P2P Code Arena & 1v1 Live Speed Duels**
* **Collaborative Code Review**: Students post problematic code snippets with a bounty of Wallah Coins; peers review, annotate lines, and earn Karma rating.
* **1v1 Speed Code Duel**: WebSocket matchmaking pairs two students of comparable ELO ratings to solve the same problem in a live head-to-head race.

---

## ⚡ 3. Instant Live Preview

A fully interactive, zero-dependency browser version with Tailwind CSS, Chart.js, real-time attendance ticker, and AI doubt solver is ready inside:

```
C:\Users\USER\.gemini\antigravity\scratch\coding-wallah\index.html
```

Simply double-click or open `index.html` in your web browser to experience the entire responsive platform!
