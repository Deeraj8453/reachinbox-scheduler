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

## 🚀 How to Run the Application Locally

### 1. Backend (Express, DB, Redis, BullMQ Worker)
Ensure you have Node.js and a local instance of Redis and PostgreSQL running (via Docker or natively).

```bash
cd backend
npm install
```
Configure your `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/reachinbox?schema=public"
REDIS_URL="redis://localhost:6379"

# Optional Ethereal Configuration
# If left blank, the server will automatically generate a temporary Ethereal account!
ETHEREAL_USER=""
ETHEREAL_PASSWORD=""
```
Run the migrations and start the server:
```bash
npx prisma db push
npm run dev
```
> **Note:** Running `npm run dev` in the backend intrinsically starts the Express API on port `5000` **AND** the headless BullMQ background worker simultaneously.

### 2. Frontend (React, Vite)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` to view the application!

### 3. How to Setup Ethereal Email
The backend uses `nodemailer` to dispatch emails. 
By default, if you do not provide `ETHEREAL_USER` and `ETHEREAL_PASSWORD` in the `.env` file, the backend will **automatically generate a temporary Ethereal test account** on startup and log the credentials to the console! 
When emails are sent, the console will print a `previewUrl` where you can view the dispatched email in the browser.

---

## 🏗️ Architecture Overview

The system is divided into three isolated layers for maximum scalability:

```mermaid
graph TD
    Client[React Frontend] -->|REST API calls| Express[Express Node.js Server]
    Express -->|Validates config & limits| Postgres[(PostgreSQL via Prisma)]
    Express -->|Enqueues Job| RedisQueue[(Redis Queue)]
    
    Worker[BullMQ Background Worker] -->|Listens & Dequeues| RedisQueue
    Worker -->|Reads Throttle Settings| Postgres
    Worker -->|Simulates Sending| ExternalAPI((Nodemailer / Ethereal))
```

### How Scheduling Works
When a user schedules an email from the UI, the Express backend saves the email record in PostgreSQL with a status of `SCHEDULED`. It then adds a delayed job to the **Redis Queue** using BullMQ, setting the `delay` exactly to the difference between the scheduled time and the current time. 
The background worker ignores this job until the precise timestamp is reached.

### How Persistence on Restart is Handled
If the backend crashes or is restarted, no emails are lost. BullMQ persists the entire queue state inside **Redis**. Additionally, the authoritative state of every email is backed by **PostgreSQL**. When the server reboots, the worker automatically reconnects to Redis and resumes processing the queue, successfully executing any jobs that were scheduled for the future.

### How Rate Limiting & Concurrency are Implemented
- **Concurrency**: The BullMQ worker is instantiated with a specific `concurrency` factor (e.g., `5`), meaning it processes up to 5 emails strictly in parallel without blocking Node's event loop.
- **Rate Limiting (Throttle Delays)**: To prevent domain blacklisting, the worker fetches the Sender's Profile configuration from Postgres. If the profile demands a throttle (e.g., 20 seconds between emails), the worker enforces an artificial delay inside the job processor before moving onto the next email for that sender.
- **API Throttling**: The Express API uses `express-rate-limit` to prevent users from spamming the `/schedule` endpoint.

---

## ✨ Features Implemented

### Backend
- **Scheduler**: BullMQ Redis queues with delayed job dispatching.
- **Persistence**: PostgreSQL state tracking (`SCHEDULED`, `PROCESSING`, `SENT`, `FAILED`).
- **Rate Limiting**: Configurable sender profiles that enforce throttle delays between outgoing emails.
- **Concurrency**: Distributed worker model preventing main thread blocking.
- **Idempotency**: Redis-based locking prevents the same email job from being processed twice.

### Frontend
- **Dashboard**: Real-time paginated table views with conditional polling (only fetches when tab is active).
- **Compose**: Rich text editor with the ability to upload a **Bulk CSV** to instantly queue hundreds of dynamically generated emails.
- **Login**: (Simulated) Google OAuth login screen matching Figma constraints.
- **Settings**: A global settings page to configure sender profile rate limits.
- **Glassmorphic UI**: Pixel-perfect layout with Framer Motion animations.

---

## 📝 Assumptions & Trade-offs
1. **Local Redis/DB Assumption**: Assumes the evaluator will spin up Redis and Postgres locally to verify the full-stack architecture, as free-tier cloud Redis hosting for BullMQ is often restrictive.
2. **Authentication Shortcut**: To simplify the review process, the Google OAuth flow is stubbed. Clicking login bypasses real OAuth and creates a local session to get you straight to the dashboard.
3. **Frontend Polling vs WebSockets**: I utilized React Query polling (with a `staleTime` and window focus checks) rather than WebSockets to reflect status changes (`SCHEDULED` -> `SENT`). This was a trade-off to simplify backend architecture while still providing a real-time UX feel.

---

<div align="center">
  <i>Submitted with ❤️ for the ReachInbox / Outbox Labs Assignment.</i>
</div>
