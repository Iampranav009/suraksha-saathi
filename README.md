# सुरक्षा साथी — Suraksha Saathi

> **"Scams don't break phones. They break judgement. We train judgement."**

A Marathi-first cyber fraud awareness PWA for senior citizens — built for the YCCE Hackathon 2026 (Social Issues Theme).

---

## The Problem

India has **103 million senior citizens**. In FY2024, cyber fraud cost Indians ₹4,005 Crore. Seniors are the primary target — not because they are careless, but because **no one has trained them** the way KnowBe4 trains corporate employees against phishing.

The national helpline **1930** and apps like **Chakshu** act *after* a scam. We act *before*.

---

## Our Solution: The Scam Fire-Drill

> **"A fire drill for scams."**  
> Families schedule safe, AI-powered fake scam calls for their elders in Marathi, so the first time they face a real scammer, it isn't the first time.

### Three Pillars

| Pillar | Feature | What it does |
|--------|---------|--------------|
| 🏋️ **Practise** | Scam Fire-Drill | AI voice agent calls senior in Marathi playing a realistic scammer. If she shares OTP → call stops → warm lesson. If she hangs up → family gets "Aaji passed!" notification. |
| ⏸️ **Pause** | Pause Before Pay | Opt-in share-to-check: senior pastes any suspicious SMS/WhatsApp message and gets instant RED / YELLOW / GREEN result in Marathi. |
| 🛡️ **Protect** | Caregiver Alert | Every drill result (pass or fail) silently notifies the family caregiver. Families stay in the loop without surveillance. |

**Bonus — Family Safe Word:** A secret word set at setup. Any caller claiming to be family must say it. Stops voice-clone scams. Zero cost.

---

## Live Demo

| | |
|--|--|
| **SMS Checker** | Paste any suspicious message → instant scam analysis in Marathi |
| **Scam Fire-Drill** | Simulated fake bank call → practice hanging up |

Demo messages pre-loaded: KYC scam, Digital Arrest, UPI collect trick, Prize scam, real bank SMS.

---

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS PWA | Free |
| Rules Engine | Pure TypeScript, works fully offline | Free |
| AI Explanation | Gemini API (explanation only, never overrides risk level) | Free tier |
| TTS | Web Speech API (mr-IN → hi-IN → en-IN fallback) | Free |
| Deployment | Vercel | Free |

### Two-Layer Architecture

```
User message
     │
     ▼
┌─────────────────────────────────────────┐
│  Rules Engine  (always runs, offline)   │
│  • OTP / PIN request → RED              │
│  • Authority impersonation → RED        │
│  • Urgency + link combo → RED           │
│  • UPI collect request → RED            │
│  • Prize / money offer → YELLOW         │
│  • Fake job / fake store → YELLOW       │
└─────────────────────────────────────────┘
     │  risk level (never overridden)
     ▼
┌─────────────────────────────────────────┐
│  Gemini API  (explanation only)         │
│  Generates 2-sentence Marathi           │
│  explanation for the senior citizen     │
└─────────────────────────────────────────┘
     │
     ▼
  Result: level + signals_mr + explanation_mr + safeAction_mr
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
git clone https://github.com/Iampranav009/suraksha-saathi.git
cd suraksha-saathi
npm install
```

### Environment Setup

```bash
cp .env.local.example .env.local
# Edit .env.local and add your Gemini API key
```

`.env.local`:
```
GEMINI_API_KEY=your_key_here
```

> **Note:** The app works fully without a Gemini key. The rules engine detects scams offline. Gemini only adds the Marathi explanation paragraph.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
suraksha-saathi/
├── app/
│   ├── page.tsx           # SMS Checker (main page)
│   ├── drill/page.tsx     # Scam Fire-Drill simulation
│   ├── api/analyze/       # POST /api/analyze — rules + Gemini
│   └── layout.tsx         # PWA shell, lang="mr"
├── lib/
│   └── scamRules.ts       # Core rules engine (pure TS, offline)
├── data/
│   └── sampleMessages.ts  # 5 pre-loaded demo messages
└── .env.local.example
```

---

## Scam Detection Rules

The rules engine (`lib/scamRules.ts`) detects:

| Pattern | Signal (Marathi) | Risk |
|---------|-----------------|------|
| OTP / PIN request | OTP किंवा PIN मागत आहे | 🔴 RED |
| Authority impersonation (police, bank, govt) | सरकारी अधिकाऱ्याची तोतयागिरी | 🔴 RED |
| Urgency + suspicious link | घाई आणि संशयास्पद लिंक | 🔴 RED |
| UPI collect request | UPI Collect Request | 🔴 RED |
| Prize / lottery offer | बक्षीस किंवा लॉटरी | 🟡 YELLOW |
| Fake job offer | बनावट नोकरीची ऑफर | 🟡 YELLOW |
| Fake store / COD advance | बनावट दुकान / COD | 🟡 YELLOW |

---

## Scam-Readiness Score

**Metric:** Drill pass rate — % of simulated scams correctly handled.

```
Week 1 baseline  →  Week 4 target
  0 / 4 passed       3 / 4 passed  (+75%)
```

This is a measured outcome, not claimed awareness.

---

## Roadmap

| Phase | Timeline | What |
|-------|----------|------|
| MVP | Now | SMS Checker + KYC Fire-Drill (web PWA) |
| Phase 2 | Month 2 | Supabase caregiver link, real Twilio/Sarvam.ai voice calls, 4 drill types |
| Phase 3 | Month 6 | B2G: sell drill data to Cyber Cell / CERT-In as city-level scam radar |

---

## Why We Win

| Competitor | Gap |
|-----------|-----|
| 1930 Helpline | Reactive — after the scam |
| Chakshu (DoT) | Report portal — after the scam |
| ABHYAS by SAJAG | Awareness quiz, no simulation |
| ScamSlayer | English only, no senior UX |

**Suraksha Saathi** is the only tool that trains seniors *before* the scam, in Marathi, with family in the loop.

---

## Team

Built for **YCCE Hackathon 2026** — Social Issues Theme, Yeshwantrao Chavan College of Engineering, Nagpur.

---

## License

MIT
