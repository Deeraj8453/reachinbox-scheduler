<div align="center">

# 🚀 ReachInbox Email Scheduler Engine
**A production-grade, full-stack email scheduling and dispatch engine.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

An advanced scheduling system built to handle high-volume email queuing with strict rate limits, delayed dispatch, and real-time dashboard analytics. Built exclusively for the **Outbox Labs / ReachInbox** assignment.

</div>

---

## 🌟 Key Features

### ⚡ True Background Processing
- Uses **Redis** and **BullMQ** to orchestrate asynchronous email jobs without blocking the main server thread.
- Guarantees exactly-once execution of scheduled emails, even if the server restarts.

### 🛡️ Advanced Rate Limiting
- Dedicated **Sender Profiles** allow you to define exact API hourly limits.
- Configurable **throttle delays** between dispatches to mimic human behavior and prevent domain blacklisting.

### 🎨 Premium Glassmorphic UI
- Pixel-perfect, Figma-aligned dark mode dashboard.
- Built with **React**, **Tailwind CSS**, and **Framer Motion** for silky-smooth transitions and micro-interactions.

### 📊 Real-Time Analytics & Pagination
- **React Query v5** data fetching with conditional polling (only polls when the browser tab is active to conserve client resources).
- Jitter-free pagination using `keepPreviousData`.

### 📂 Bulk CSV Uploads & Rich Text
- Instantly queue hundreds of dynamically generated emails by parsing CSV mailing lists directly inside the rich-text Compose Modal.
- Built-in dynamic variable injection (e.g., `{{firstName}}`).

---

## 🏗️ System Architecture

The system is divided into three isolated layers for maximum scalability:

```mermaid
graph TD
    Client[React Frontend] -->|REST API calls| Express[Express Node.js Server]
    Express -->|Validates config & limits| Postgres[(PostgreSQL via Prisma)]
    Express -->|Enqueues Job| RedisQueue[(Redis Queue)]
    
    Worker[BullMQ Background Worker] -->|Listens & Dequeues| RedisQueue
    Worker -->|Reads Throttle Settings| Postgres
    Worker -->|Simulates Sending| ExternalAPI((External Mail API))
```

1. **Frontend**: Communicates exclusively via REST. Uses `react-query` to cache state and intelligently poll for email status updates.
2. **REST API**: Handles incoming HTTP requests, validates sender configurations via Prisma, and enqueues tasks into Redis.
3. **Worker Service**: A standalone headless Node process that continuously listens to the Redis queue, respects the throttle limits, and executes the email dispatch safely.

---

## 🚀 Getting Started Locally

Follow these steps to get the application running on your local machine.

### Prerequisites
- **Node.js** (v18 or higher)
- **Docker** (to easily spin up local Redis/Postgres) OR external connection strings for Redis/Postgres.
- **npm** or **pnpm**

### 1. Clone the repository
```bash
git clone https://github.com/Deeraj8453/reachinbox-scheduler.git
cd reachinbox-scheduler
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend` folder:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/reachinbox?schema=public"
REDIS_URL="redis://localhost:6379"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SESSION_SECRET="super-secret-key"
```

### 3. Spin up the Backend Infrastructure
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
> **Note:** Running `npm run dev` in the backend intrinsically starts both the REST API on port `5000` AND the headless BullMQ background worker.

### 4. Spin up the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser to view the application!

---

## 🧪 Testing & CI/CD Pipeline

The repository includes a strict GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically ensures production readiness on every push to `main`:

- ✅ **TypeScript Type-Checking** (`tsc --noEmit`)
- ✅ **ESLint** Syntax Validation
- ✅ **Unit Tests via Vitest** (Includes strict JSDOM tests for custom hooks like `useDebounce` and string parsers).

To run the test suite locally:
```bash
cd frontend
npm run test
```

---

<div align="center">
  <i>Submitted with ❤️ for the ReachInbox / Outbox Labs Assignment.</i>
</div>
