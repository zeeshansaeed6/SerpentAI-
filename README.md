# 🐍 SerpentAI Ultra — AI Snake Species Detection & Venom Safety Suite

[![MERN Stack](https://img.shields.io/badge/Stack-MERN%20(MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node.js)-10b981?style=for-the-badge)](https://github.com)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%203.6%20Flash%20Vision-06b6d4?style=for-the-badge)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)

An intelligent, full-stack **MERN** web platform powered by **Multimodal Gemini Vision AI** for instant snake species recognition, venom lethality categorization, emergency first-aid protocols, interactive symptom triage, and nearest hospital dispatch.

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
* **Database**: MongoDB (Supports Mongoose with zero-install `mongodb-memory-server` fallback + auto-seeding).

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
MONGODB_URI=
```
*(Note: If `MONGODB_URI` is left blank, the app will automatically start an in-memory MongoDB database and seed it with 15 snake species!)*

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

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
