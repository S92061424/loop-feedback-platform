# Project LOOP — AI Customer-Feedback Intelligence Platform

Zidio Development Internship — Web Development Track

## What it does

LOOP ingests multi-channel customer feedback (support tickets, app reviews, surveys, sales notes), uses AI to classify and cluster it into themes, detects trends, and answers plain-English questions grounded in the actual feedback data. It also generates a Voice-of-Customer report summarizing what customers are saying.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| AI | Google Gemini API (`gemini-3.6-flash` for generation, `gemini-embedding-001` for embeddings) |

**Note on stack deviations:** The original brief specifies Next.js + PostgreSQL + Claude API. This project uses MERN (MongoDB) instead of Next.js/Postgres, and Google's Gemini API instead of Anthropic's Claude API, due to account/billing access constraints encountered during development. The architecture, data model, and feature set otherwise follow the brief's specification exactly — every AI feature (classification, clustering, RAG Q&A, report generation) uses the same patterns described in Section 09 of the brief, just implemented against Gemini rather than Claude.

## Features implemented

**Core:**
- Multi-tenant workspaces with 3 roles (Admin, Analyst, Viewer)
- JWT authentication (signup/login)
- Role-based access control middleware
- Feedback ingestion: single-entry form + CSV bulk upload
- Feedback inbox: search, filter (channel/status), pagination
- Status workflow (NEW → REVIEWED → ACTIONED)

**AI features:**
- **AI1 — Auto-classification:** every feedback item is automatically tagged with sentiment, sentiment score, themes, and feature area on ingest
- **AI2 — Theme clustering & trends:** feedback is grouped into themes with counts; trends endpoint compares current vs. previous period volume
- **AI3 — Ask LOOP:** retrieval-augmented Q&A — embeds feedback on ingest, retrieves the most relevant items for a question, and answers only from that data with cited sources
- **AI4 — Voice-of-Customer report:** generates a narrative report from real period statistics (sentiment breakdown, top themes, verbatim quotes) — numbers are pre-computed in code, only the narrative text is AI-generated

## Local setup

### Prerequisites
- Node.js 18+ and npm
- A MongoDB Atlas account (free tier) or local MongoDB instance
- A Google AI Studio API key ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 1. Clone the repository
```bash
git clone https://github.com/S92061424/loop-feedback-platform.git
cd loop-feedback-platform
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_random_secret_string
GOOGLE_API_KEY=your_gemini_api_key
```

Seed demo data (creates a demo workspace, 3 users, and ~20 classified feedback items):
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```
Server runs at `http://localhost:5000`.

### 3. Frontend setup
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`.

## Demo login credentials

After running `npm run seed`, log in with:

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.loop | password123 |
| Analyst | analyst@demo.loop | password123 |
| Viewer | viewer@demo.loop | password123 |

## Architecture summary

Three-tier architecture: React frontend → Express API layer → MongoDB + Google Gemini API.

- The browser never talks to MongoDB or Gemini directly — every request goes through the Express API, which authenticates the JWT, checks the role, and scopes every database query by `workspaceId`.
- AI features run asynchronously after the main request responds (e.g., feedback saves immediately, then classification/embedding happens in the background and updates the record moments later), keeping the UI responsive.
- Ask LOOP uses a retrieve-then-answer pattern: the question is embedded, compared via cosine similarity against stored feedback embeddings, and only the top-matching items are passed to Gemini as grounding context — the model is explicitly instructed not to answer beyond that data.

## Team

- K.Pushpakanthan — Backend, auth, AI integration
- Bhavneesh Sharma — Frontend, dashboard, inbox UI
- ChandraLakshmiprasanna — Frontend, dashboard, Testing
