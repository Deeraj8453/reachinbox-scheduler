# 🚀 ReachInbox Email Scheduler

A production-grade, full-stack email scheduling engine built to handle high-volume email queuing with strict rate limits, delayed dispatch, and real-time dashboard analytics.

![Dashboard Preview](https://via.placeholder.com/1200x600.png?text=ReachInbox+Dashboard)

## ✨ Core Features
- **True Background Processing**: Uses **Redis** and **BullMQ** to orchestrate asynchronous email jobs without blocking the main server thread.
- **Advanced Rate Limiting**: Dedicated Sender Profiles allow you to define exact API hourly limits and automated throttle delays between dispatches to prevent blacklisting.
- **Glassmorphic UI**: Pixel-perfect, Figma-aligned dark mode dashboard built with React, Tailwind CSS, and Framer Motion.
- **Strict Data Types**: End-to-end TypeScript safety and React Query v5 data fetching with conditional polling to conserve client resources.
- **Bulk CSV Uploads**: Instantly queue hundreds of dynamically generated emails by parsing CSV mailing lists directly inside the rich-text Compose Modal.
- **Google OAuth Integration**: Secure user authentication.

---

## 🏗️ Architecture Details
The system is divided into three isolated layers for maximum scalability:

1. **Frontend (React + Vite)**: Communicates exclusively via REST. Uses `react-query` to cache state and intelligently poll for email status updates only when the browser tab is visible.
2. **REST API (Node.js + Express)**: Handles incoming HTTP requests, validates sender configurations via Prisma (PostgreSQL), and enqueues tasks into Redis.
3. **Worker Service (BullMQ)**: A standalone headless Node process that continuously listens to the Redis queue, respects the throttle limits set in the Sender Profile, and executes the simulated email dispatch logic safely in the background.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Query, Framer Motion, Lucide React
- **Backend**: Node.js, Express, TypeScript, Zod
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Queuing**: Redis, BullMQ
- **CI / Quality**: GitHub Actions, Vitest (jsdom testing)

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Docker (for spinning up local Redis/Postgres) OR external connection strings
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/Deeraj8453/reachinbox-scheduler.git
cd reachinbox-scheduler
```

### 2. Environment Variables
Create a `.env` file in the `backend` folder:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/reachinbox?schema=public"
REDIS_URL="redis://localhost:6379"
```

### 3. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
*(The backend script inherently starts both the REST API on port 5000 and the BullMQ background worker).*

### 4. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing & CI
The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically runs on every push:
- TypeScript type-checking
- ESLint syntax validation
- Unit Tests via **Vitest** (e.g., `useDebounce` hook timer tests and pure string parsing utilities).

You can run these locally via:
```bash
cd frontend
npm run test
```
