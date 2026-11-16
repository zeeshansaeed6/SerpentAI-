# 🐍 SerpentAI Ultra — AI Snake Species Detection & Venom Safety Suite

[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Express%20%7C%20Supabase%20(PostgreSQL)%20%7C%20Node.js-10b981?style=for-the-badge)](https://github.com)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%203.6%20Flash%20Vision-06b6d4?style=for-the-badge)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)

An intelligent, full-stack web platform (React + Express + Supabase/PostgreSQL) powered by **Multimodal Gemini Vision AI** for instant snake species recognition, venom lethality categorization, emergency first-aid protocols, interactive symptom triage, and nearest hospital dispatch.

---

## 🌟 Key Features

* **🔍 Multimodal AI Species Scanner**:
  * Real-time snake identification from image uploads and live webcam streams.
  * **Low-Light / Night-Vision Photo Enhancer** for boosting dark snake encounter photos.
  * Color-coded hazard rating badges (`Deadly 🚨`, `Dangerous ⚠️`, `Moderate 🟡`, `Harmless 🛡️`).
  * Text-to-Speech (TTS) audio narration for Latin species pronunciation & first-aid steps.

* **🏥 Auto-Dispatched Antivenom Hospitals**:
  * Auto-detects user GPS location via browser and calculates real-time distances to verified emergency antivenom centers.
  * 1-touch Emergency direct dialer and Google Maps driving navigation.

* **💬 SerpentBot AI Herpetologist Chatbot**:
  * Real-time conversational AI consultant for snake safety, encounter advice, pet protection, and bite first aid.

* **⏱️ Snakebite Symptom Triage & Risk Calculator**:
  * Clinical evaluation tool comparing 2-fang punctures vs teeth scratches, time elapsed, localized swelling, and whole-body neuro/hemo signs to generate an immediate Envenomation Risk Score.

* **🏡 Snake-Proofing & Farm / Camp Prevention Guide**:
  * Interactive exclusion checklists and scientifically debunked snake myth-busters (carbolic acid, sulfur, powders).

* **📞 Snake Rescuers & Wildlife Helpline Directory**:
  * Searchable contacts of certified snake catchers and forest department units for humane rescue and relocation.

* **📡 Community Danger Radar**:
  * Crowdsourced geo-tagged reptile sighting log with GPS auto-detection to warn nearby hikers and residents.

* **🔀 Side-by-Side Mimic Analyzer**:
  * Side-by-side comparison of dangerous venomous snakes vs harmless lookalike mimics (e.g. *Coral Snake vs Scarlet Kingsnake*).

* **📄 Exportable Medical Incident PDF**:
  * Print-ready clinical dossier for ER doctors containing patient details, bite location, timestamp, and antivenom protocol.

---

## 🏗️ Architecture & Tech Stack

* **Frontend**: React 18, Vite, Vanilla CSS Design System with Glassmorphism, Lucide Icons, Canvas Confetti.
* **Backend**: Node.js, Express.js, Multer (Memory Storage), Helmet, CORS.
* **AI Engine**: Google Gemini Vision (`gemini-3.6-flash`) via `@google/genai`.
* **Database**: PostgreSQL via [Supabase](https://supabase.com) using the `pg` driver. Tables are created and seeded automatically on first start, with Row Level Security enabled. Local development needs no database: it falls back to an in-memory Postgres (PGlite).

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/snake-species-detection.git
cd snake-species-detection
```

### 2. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
DATABASE_URL=
```
*(Note: for **local development only**, if `DATABASE_URL` is left blank the app starts an in-memory Postgres and seeds it with 15 snake species; data is lost on restart. Production requires a real `DATABASE_URL`.)*

#### Getting the Supabase `DATABASE_URL`
1. Create a project at [supabase.com](https://supabase.com) (free tier is fine) and note the database password you choose.
2. Click **Connect** at the top of the dashboard (or **Project Settings → Database → Connection string**).
3. Choose the **Session pooler** string. It works over IPv4, which hosting platforms like Render need; the "Direct connection" string is IPv6-only.
4. Copy it and replace `[YOUR-PASSWORD]` with your password. It looks like:
   ```
   postgresql://postgres.abcdefghij:YourPassword@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
5. If the password contains special characters (`@ # / : ?`), URL-encode them (`@` becomes `%40`), or reset it to letters and numbers in **Project Settings → Database**.
6. Put it in `server/.env` as `DATABASE_URL=...`. No SQL to run: the server creates the tables on first start.

### 3. Install Dependencies
```bash
npm run install-all
```

### 4. Start Development Servers
```bash
npm run dev
```

* **Frontend Client**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Tests

```bash
cd server && npm test
```
Runs 38 integration checks (all API routes, filters, validation, SQL-injection safety, pagination, Row Level Security, idempotent seeding) against an in-memory Postgres, with no setup. Set `TEST_DATABASE_URL` to run them through the real `pg` driver against a **disposable** Postgres database instead.

---

## ☁️ Deployment

### Option A — one service (recommended)
The Express server serves the built React app and the API from the same origin, so there is no CORS or API-URL setup.

| Step | Command / value |
| --- | --- |
| Build command | `npm run install-all && npm run build` |
| Start command | `npm start` |
| Required env | `NODE_ENV=production`, `GEMINI_API_KEY`, `DATABASE_URL` (your Supabase **Session pooler** connection string) |
| Recommended env | `TRUST_PROXY=1` (default in production; number of reverse-proxy hops) |

Health check path: `/api/health` (returns 503 while the database is unreachable).

### Option B — separate frontend and API
* **API** (Render, Railway, Fly...): start with `npm start` in `server/`; set `NODE_ENV`, `GEMINI_API_KEY`, `DATABASE_URL`, and `CLIENT_ORIGIN=https://your-frontend.example` (comma-separate multiple origins).
* **Frontend** (Vercel, Netlify...): build with `npm run build` in `client/`, publish `client/dist`, and set `VITE_API_URL=https://your-api.example/api` at build time.

### Notes
* `/api/detect` and `/api/chat` are rate-limited to 15 requests/minute/IP because they call Gemini.
* Secrets belong in the host's environment settings, never in git (`.env` files are ignored).
* Sample snake photos are bundled in `client/public/samples`; check each photo's license before commercial use.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
