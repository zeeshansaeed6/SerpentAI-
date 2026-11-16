<div align="center">

# 🐍 SerpentAI

### Snap a snake. Know what it is. Know what to do next.

AI snake identification, venom-safety guidance and a community danger radar, in one fast web app.

[![Live demo](https://img.shields.io/badge/▶_Live_demo-serpentai--g1g1.onrender.com-10b981?style=for-the-badge)](https://serpentai-g1g1.onrender.com)
[![CI](https://img.shields.io/github/actions/workflow/status/zeeshansaeed6/SerpentAI-/ci.yml?branch=main&style=for-the-badge&label=CI)](https://github.com/zeeshansaeed6/SerpentAI-/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)

![React](https://img.shields.io/badge/React_18-20232a?logo=react&logoColor=61dafb)
![Vite](https://img.shields.io/badge/Vite-20232a?logo=vite&logoColor=ffd62e)
![Node](https://img.shields.io/badge/Express-20232a?logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_Postgres-20232a?logo=supabase&logoColor=3ecf8e)
![Gemini](https://img.shields.io/badge/Google_Gemini-20232a?logo=googlegemini&logoColor=8ab4f8)
![GSAP](https://img.shields.io/badge/GSAP-20232a?logo=greensock&logoColor=88ce02)
![a11y](https://img.shields.io/badge/axe--core-0_violations-10b981)

<br>

<img src="docs/screenshots/hero.jpg" alt="SerpentAI landing page" width="900">

</div>

> **Heads up:** the live demo runs on a free Render instance, which sleeps when idle. The first visit after a quiet spell can take about 50 seconds to wake up.

---

## Why this exists

Snakebite kills tens of thousands of people a year, and the first minutes matter. Misidentification and old myths (tourniquets, cutting, "sucking out" venom) make bites worse. SerpentAI puts an identification and first-aid assistant in your pocket, with clear safety rules and fast answers.

> ⚠️ **SerpentAI is an educational aid, not medical advice.** In an emergency call your local emergency number (911 / 112 / 108) immediately.

---

## ✨ What it does

<table>
<tr>
<td width="50%" valign="top">

### 🔍 AI Species Scanner
Upload a photo or use the webcam and get, in about 5 seconds:
- species and scientific name
- venomous or harmless, with a colour-coded danger rating
- first-aid protocol, habitat, range, diet, fun fact
- low-light / night-vision photo enhancer
- audio narration, shareable result, exportable medical PDF

</td>
<td width="50%" valign="top">

<img src="docs/screenshots/scan.jpg" alt="Scan result for a corn snake" width="100%">

</td>
</tr>
<tr>
<td width="50%" valign="top">

<img src="docs/screenshots/chat.jpg" alt="SerpentBot chat" width="100%">

</td>
<td width="50%" valign="top">

### 💬 SerpentBot
An AI herpetologist for snake safety, bite first aid and prevention.
- short, calm, safety-first answers
- remembers the conversation, so follow-ups like "how long until it works?" make sense
- friendly "busy" message and one automatic retry if the AI is slow

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📡 Danger Radar
A crowdsourced map of geo-tagged sightings.
- bundled world map (no tile service), drag, zoom, regions
- danger-level markers with distinct shapes, clustering of nearby reports
- filter scopes the map and the list together
- keyboard accessible, with a table view for screen readers

</td>
<td width="50%" valign="top">

<img src="docs/screenshots/radar.jpg" alt="Danger Radar world map" width="100%">

</td>
</tr>
</table>

<details>
<summary><b>…and everything else (12 tools in total)</b></summary>

<br>

| Tool | What it does |
| --- | --- |
| 🩺 **Bite Triage** | Symptom checklist (fang marks, swelling, neuro/hemo signs, time elapsed) that produces an envenomation risk score |
| 🏡 **Snake-Proofing** | Exclusion checklists for homes, farms and camps, plus myth-busters |
| 📞 **Snake Rescuers** | Searchable directory of snake catchers and wildlife helplines |
| 🏥 **Antivenom Centres** | Nearest centres by GPS, one-tap dialler and navigation |
| 🔀 **Mimic Analyzer** | Side-by-side venomous snakes vs harmless lookalikes (e.g. coral vs scarlet kingsnake) |
| 🧬 **Venom Pathology** | How different venom types affect the body |
| 📚 **Encyclopedia** | Searchable species library with KPI tiles and ranked charts |
| 🕘 **History** | Your past scans, kept per browser |
| 🏆 **Quiz** | Test what you know |
| 📄 **Medical Incident PDF** | Print-ready summary to hand to an ER doctor |
| 🆘 **SOS button** | Emergency numbers always one click away |

</details>

<details>
<summary><b>More screenshots</b></summary>

<br>

<img src="docs/screenshots/triage.jpg" alt="Bite triage" width="48%"> <img src="docs/screenshots/encyclopedia.jpg" alt="Encyclopedia" width="48%">

</details>

---

## 🏗️ How it's built

```
Browser (React + Vite)  ──►  Express API  ──►  Supabase Postgres
   GSAP · d3 map               helmet · CSP        sightings · species · scans
   Lucide · axios              rate limits         row-level security
                                   │
                                   └──►  Google Gemini (vision + chat)
```

| Layer | Choices |
| --- | --- |
| **Frontend** | React 18, Vite, GSAP, d3-geo + topojson (lazy-loaded map chunk), hand-written CSS design system |
| **Backend** | Node.js, Express, Multer (memory storage), Helmet CSP, express-rate-limit |
| **AI** | Google Gemini via `@google/genai`: `gemini-3.5-flash-lite` with automatic fallback to `gemini-3.1-flash-lite` |
| **Database** | Supabase PostgreSQL via `pg`. Tables are created and seeded on first start; row-level security is on. Local dev needs no database (in-memory Postgres via PGlite) |
| **Privacy** | No accounts. Each browser gets an anonymous random ID, so you only see and manage your own history and sightings |

### Engineering highlights

- **Fast, bounded AI calls.** Gemini latency is spiky (the same call can take 5s or 60s+). Requests use minimal thinking, a hedged backup request to a second model after a short wait, and a hard deadline, taking scans from 30–170s down to about 5s.
- **Secure by default.** Helmet CSP, per-route rate limits on the AI endpoints (15/min) and sighting submissions, strict input validation, parameterised SQL, and secrets only in environment variables.
- **Accessible.** Audited with axe-core to zero violations across every tab, dialog and result view. Keyboard support, focus management, reduced-motion support, and table alternatives to charts.
- **Tested.** 63 integration checks cover every API route, filters, validation, SQL-injection safety, pagination, row-level security and idempotent seeding.
- **CI.** GitHub Actions runs the tests and the production build on every push.

---

## 🚀 Run it locally

**Requirements:** Node.js 18+ (CI runs 22) and a free [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/zeeshansaeed6/SerpentAI-.git
cd SerpentAI-
npm run install-all
```

Create `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
DATABASE_URL=            # leave blank for local dev (in-memory Postgres)
```

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000

> With `DATABASE_URL` blank, the app starts an in-memory Postgres seeded with 15 species. Data is lost on restart. Production requires a real `DATABASE_URL`.

<details>
<summary><b>Getting a Supabase <code>DATABASE_URL</code></b></summary>

<br>

1. Create a project at [supabase.com](https://supabase.com) (the free tier is fine) and note the database password.
2. Click **Connect** at the top of the dashboard (or **Project Settings → Database → Connection string**).
3. Choose the **Session pooler** string. It works over IPv4, which hosts like Render need; the "Direct connection" string is IPv6-only.
4. Replace `[YOUR-PASSWORD]` with your password:
   ```
   postgresql://postgres.abcdefghij:YourPassword@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
5. If the password has special characters (`@ # / : ?`), URL-encode them (`@` becomes `%40`) or reset it to letters and numbers.
6. Put it in `server/.env` as `DATABASE_URL=...`. No SQL to run: the server creates the tables on first start.

</details>

### Optional environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Primary model |
| `GEMINI_FALLBACK_MODEL` | `gemini-3.1-flash-lite` | Backup model |
| `GEMINI_HEDGE_MS` | `8000` | Wait before starting a backup request (scans) |
| `GEMINI_DEADLINE_MS` | `30000` | Hard limit for a scan |
| `CLIENT_ORIGIN` | none | Allowed origins when the frontend is hosted separately |
| `TRUST_PROXY` | `1` in production | Reverse-proxy hops, for correct rate limiting |

---

## 🧪 Tests

```bash
cd server && npm test
```

Runs 63 integration checks against an in-memory Postgres with no setup. Set `TEST_DATABASE_URL` to run them through the real `pg` driver against a **disposable** database instead.

---

## ☁️ Deployment

### One service (recommended)

The Express server serves the built React app and the API from the same origin, so there is no CORS or API-URL setup.

**On Render**, use the included Blueprint ([`render.yaml`](render.yaml)): *New → Blueprint → select this repo*, then paste your `DATABASE_URL` and `GEMINI_API_KEY` when prompted. Free instances sleep after about 15 minutes idle; a paid plan stays awake.

| Step | Value |
| --- | --- |
| Build command | `npm run install-all && npm run build` |
| Start command | `npm start` |
| Required env | `NODE_ENV=production`, `GEMINI_API_KEY`, `DATABASE_URL` (Supabase **Session pooler** string) |
| Health check | `/api/health` (503 while the database is unreachable) |

### Separate frontend and API

- **API** (Render, Railway, Fly…): `npm start` in `server/`; set `NODE_ENV`, `GEMINI_API_KEY`, `DATABASE_URL` and `CLIENT_ORIGIN=https://your-frontend.example`.
- **Frontend** (Vercel, Netlify…): build with `npm run build` in `client/`, publish `client/dist`, and set `VITE_API_URL=https://your-api.example/api` at build time.

> Secrets belong in your host's environment settings, never in git. Sample snake photos live in `client/public/samples`; check each photo's licence before commercial use.

---

## 🗺️ Project layout

```
client/            React app (components, hooks, services, utils)
server/
  routes/          detect, chat, snakes, sightings, history, hospitals
  services/        Gemini integration (hedging, deadlines, chat memory)
  models/          Postgres data access
  middleware/      anonymous client identity, error handling
  test/            integration tests
render.yaml        one-click Render Blueprint
.github/workflows  CI
```

---

## 🤝 Contributing

Issues and pull requests are welcome. Please run `cd server && npm test` and `cd client && npm run build` before opening a PR.

## 📜 License

[MIT](LICENSE). Not a substitute for professional medical advice.
