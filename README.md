# सुरक्षा साथी · Suraksha Saathi

**A fire drill for scams, in Marathi.** Families schedule safe, simulated scam calls for their elders, so the first time a senior faces a real scammer, it isn't the first time.

| | |
|---|---|
| **Team** | Ultron |
| **Hackathon** | YCCE Hackathon 2026, Yeshwantrao Chavan College of Engineering, Nagpur |
| **Theme** | 03 · Social Issues |
| **Problem statement** | 3 · Digital Literacy and Cyber Fraud Awareness Assistant for Senior Citizens |
| **Demo video (2 min)** | [`public/video/suraksha-saathi-demo.mp4`](public/video/suraksha-saathi-demo.mp4), also playable at the bottom of the app's home page |

---

## The problem

A phone rings: *"Hello, I'm calling from SBI. Your account will be blocked in ten minutes. Please tell me the OTP."* The senior is scared, shares the OTP, and the money is gone.

- **Scams don't break phones. They break judgement.** The victim hands over the OTP willingly, because the caller sounds real and the deadline feels real. No firewall stops that.
- **Help today comes after the money is gone.** The 1930 cyber-fraud helpline and the government's Chakshu portal are for *reporting* fraud. Caller-ID apps only flag numbers already reported, and scammers change numbers constantly.
- **Awareness is not practice.** Posters and videos tell seniors "never share your OTP", but the first time they hear that pressure on a live call is usually the real scam.
- **Language is a barrier.** Most safety tools speak English. Many seniors in Maharashtra are most comfortable in Marathi.

Companies already solve this for their staff with phishing simulations: safe fake attacks, followed by a short lesson. Nobody does this for our parents and grandparents.

## Our solution

Suraksha Saathi trains judgement **before** the real call. It has three parts:

| | What it does | Status |
|---|---|---|
| **Practise: Scam Fire-Drill** | A realistic scam call plays in Marathi (a fake "SBI officer" asking for the OTP). If the senior shares the OTP, the drill stops and a gentle lesson explains the tricks used. If she hangs up, she passes. | ✅ Working in the prototype (in-app call) |
| **Pause: Share-to-Check** | Paste any suspicious SMS or WhatsApp message. The app gives a **red / yellow / green** verdict, lists the warning signs in Marathi, explains why, and reads it aloud in an Indian voice. | ✅ Working |
| **Protect: Caregiver alerts** | The family sees drill results and red alerts, **never** the senior's private messages. | 🟡 Shown as a notification preview in the app; real caregiver linking is in the pilot plan |
| **Family Safe Word** | A secret word any caller claiming to be family must say. Stops "grandson in trouble" voice-clone scams. | 🗓️ Planned (no technology needed) |

### What makes it different

- **It trains before the scam, instead of reporting after it.** It works alongside 1930, not against it.
- **It measures behaviour, not awareness.** The metric is the **drill pass rate**: the share of simulated scams a senior handles correctly, week by week. The pilot target is falling for 3 of 4 drills in week 1, and none by week 4.
- **It's Marathi-first and designed for seniors:** big buttons, short sentences, audio for every verdict, and set up together with the family.
- **It's safe by design:** opt-in, every drill reveals itself kindly, and no SMS interception (every check is shared by the user).

## How to review it (2 minutes)

1. Open the home page and tap **🚨 KYC scam** to load a real-style scam message, then **Check Message**.
   You get a red **धोका — SCAM** verdict with warning signs in Marathi and a safe action. If Gemini is available, an explanation in Marathi appears too. Press **मराठीत ऐका** to hear it.
2. Try **✅ Bank SMS** to see a green verdict, and **⚠️ Prize scam** to see yellow.
3. Tap **🔔 Scam Fire-Drill**, then **Start Drill**. Read or listen (**ऐका**) to the scammer's lines, then choose **Hang Up** (pass) or **Share OTP** (fail, with the lesson).
4. Scroll to the bottom of the home page for the 2-minute demo video.

## How it works

```
 Message pasted / drill started
              │
              ▼
 ┌──────────────────────────────┐
 │ 1. Rules engine (offline)    │  OTP / PIN request, fake authority, UPI collect,
 │    lib/scamRules.ts          │  urgency + unverified link → RED
 │    decides the risk level    │  prize, fake job, fake store patterns → YELLOW
 └──────────────┬───────────────┘
                │ verdict is final
                ▼
 ┌──────────────────────────────┐
 │ 2. Gemini (optional)         │  writes a 2-sentence explanation in Marathi and Hindi.
 │    app/api/analyze           │  It can never change the verdict.
 └──────────────┬───────────────┘
                ▼
 ┌──────────────────────────────┐
 │ 3. Voice                     │  Gemini text-to-speech (natural Indian voice),
 │    app/api/tts               │  falls back to the phone's built-in voice
 └──────────────────────────────┘
```

**Two design decisions matter most:**

1. **Rules decide, AI only explains.** An AI model can be wrong. A scam must never be marked safe, so the deterministic rules engine sets the risk level and Gemini is only allowed to explain it.
2. **It never fails silently.** If Gemini is offline or rate-limited, the app tries the next model, and if all are unavailable it still returns a complete Marathi verdict from the rules engine. Voice falls back to the device's own speech.

## Tech stack

| Layer | Technology | Cost |
|---|---|---|
| App | Next.js 16, React, TypeScript, Tailwind CSS (mobile-first web app) | Free |
| Risk detection | Rule-based engine in TypeScript, runs offline | Free |
| Explanation | Google Gemini API (with a fallback chain of models) | Free tier |
| Voice | Gemini text-to-speech, with Web Speech API as fallback | Free tier |
| Hosting | Vercel | Free tier |

The whole prototype runs on free tiers, so the pilot costs ₹0 to operate.

## Run it locally

Requirements: Node.js 18 or newer. A Gemini API key is optional.

```bash
git clone https://github.com/Iampranav009/suraksha-saathi.git
cd suraksha-saathi
npm install
cp .env.local.example .env.local   # optional: add GEMINI_API_KEY for explanations and the Indian voice
npm run dev
```

Open http://localhost:3000. Without a key, every verdict, warning sign and safe action still works; only the Gemini explanation and Gemini voice are skipped.

## Project structure

```
app/
  page.tsx              Share-to-Check (home page) + demo video
  drill/page.tsx        Scam Fire-Drill
  api/analyze/route.ts  Rules verdict + Gemini explanation
  api/tts/route.ts      Gemini text-to-speech (returns WAV)
lib/scamRules.ts        Rules engine: patterns, verdict, Marathi signals
data/sampleMessages.ts  Demo messages (scam, caution and safe examples)
public/video/           2-minute demo video and poster
```

## Risks we have planned for

| Risk | How we handle it |
|---|---|
| AI marks a scam as safe | Rules set the verdict; AI only explains |
| Seniors won't install an app | The family sets it up; it runs in the browser, with no install needed |
| Play Store limits on reading SMS | No interception; every check is shared by the user |
| Privacy of messages | Messages are only checked, not stored; families see results, not messages |
| Senior feels tricked by a drill | Opt-in, set up together, and every drill ends with a kind reveal |
| Drills misused by bad actors | Only family-linked numbers and fixed, reviewed scripts |
| Scams keep changing | New scam pattern → new drill script and rule |

## Roadmap

| Phase | Who | What |
|---|---|---|
| 1 · Pilot | Senior citizens in Nagpur | Caregiver linking and drill history (Supabase), real phone-call drills, KYC, digital-arrest, electricity-bill and pension drills |
| 2 · Expand | Students and working adults | Fake jobs, fake online stores, investment groups, UPI collect tricks |
| 3 · Cities | City cyber cells | Anonymised weekly "scam radar" of which tricks are rising |

---

Built by **Team Ultron** for YCCE Hackathon 2026.
