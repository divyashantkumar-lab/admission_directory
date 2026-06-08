# Student Portfolio Compass

Enterprise full-stack student portfolio directory with CSV/XLS/XLSX ingestion, JWT authentication, RBAC, and SEO-optimized React SPA.

The repository contains two isolated applications:

```
backend/     Express API (port 8000)
frontend/    Vite + React (port 5173)
```

## Quick start

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

## Demo credentials

| Email | Password | Role |
|-------|----------|------|
| admin@portfolio.com | admin123 | admin |

Standard users can sign up via the UI (password must meet complexity rules).

## Features

- Multi-format student data: CSV, XLS, XLSX (configured via `ACTIVE_DATA_FILE`)
- Admin-only student directory with search and batch filters
- Full CRUD with backup copies in `backend/data/backups/`
- Security: Helmet CSP, CORS whitelist, rate limits, bcrypt, JWT HS256, XSS sanitization
- SEO: `react-helmet-async`, `public/sitemap.xml`, `public/robots.txt`

## Environment

**Backend** (`backend/.env`):

- `PORT=5000`
- `JWT_SECRET` — change in production
- `ACTIVE_DATA_FILE=students.csv`

**Frontend** (`frontend/.env`):

- `VITE_API_URL=http://localhost:8000/api`
- `VITE_CANONICAL_BASE_URL=https://portfolio.example.com`






- include club in the card.
- Remove batch filter