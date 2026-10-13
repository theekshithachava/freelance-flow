# FreelanceFlow (MERN prototype)
AI-assisted freelancer command center: project health & deadline-risk prediction, AI project planner, kanban, payments, AI assistant and client-message generator (mock AI, swappable for a real LLM in `server/index.js`).
## Setup
1. Start MongoDB locally (or set `MONGO_URI`).
2. `cd server && cp .env.example .env && npm i && npm run dev` (auto-seeds demo data)
3. `cd client && npm i && npm run dev` → http://localhost:5173
Demo login: `demo@freelanceflow.dev` / `demo123`
## API
`/api/auth/{register,login}` · CRUD: `/api/{clients,projects,tasks,payments,invoices}` · `/api/dashboard` · `/api/projects/overview` · `/api/ai/{generate-project-plan,save-plan,risk-analysis,generate-message,chat}` · `/api/notifications` (+`/:id/read`)
## Demo flow
Login → Dashboard (health) → AI Planner → Generate → Save → Projects (Recalculate Risk) → AI Assistant (message) → Tasks (drag) → Payments (mark paid)
## Next
Calendar, analytics page, invoice PDF, client portal/milestone approval UI (models + roles already in place), real LLM API, forgot-password.
