# 🎬 Kaamlink Demo Video Script — Hackathon Submission

> **Target Duration:** 3–5 minutes  
> **Tools Needed:** Screen recorder (OBS / phone screen record), phone with APK installed, laptop showing Railway backend logs (optional but impressive)

---

## 🎯 Key Points to Hit (Per Submission Criteria)
1. ✅ Overall workflow of the solution
2. ✅ How **agency** has been achieved (11 agents working together)
3. ✅ How it is **innovative** (Roman Urdu NLP, wage protection, self-healing recovery)

---

## SCENE 1 — INTRO & HOOK (0:00 – 0:30)

### 🎤 Narration:
> *"Imagine you're in Islamabad. Your AC just broke down in the middle of summer. You don't know any trusted repair person. You pull out your phone and just type — in your own language, in Roman Urdu — 'AC kharab ho gaya hai, koi mechanic bhej dein urgently, G-13 mein.' And within seconds, an AI-powered system understands your request, finds the best nearby providers, gives you fair pricing, and books a confirmed technician — all automatically. This is Kaamlink."*

### 📱 On Screen:
- Show the **splash screen** of the app (the Kaamlink logo loading)
- Then show the **Home Screen** with the text input field

---

## SCENE 2 — THE PROBLEM (0:30 – 1:00)

### 🎤 Narration:
> *"In Pakistan's gig economy, booking a home service is chaos. People use WhatsApp, random phone calls, and word of mouth. There's no standard pricing — workers get exploited with low offers, and customers get overcharged. Addresses are informal — 'G-13 ke paas', 'F-7 markaz'. And cancellations happen all the time with no backup plan. Kaamlink solves all of this with a team of 11 specialized AI agents that manage the entire booking lifecycle."*

### 📱 On Screen:
- Stay on the Home Screen
- Optionally show a quick text slide with the 4 problems listed (you can make this in Canva in 2 mins)

---

## SCENE 3 — LIVE DEMO: MAKING A REQUEST (1:00 – 1:45)

### 🎤 Narration:
> *"Let me show you the complete flow. I'll type a natural language request in Roman Urdu..."*

### 📱 On Screen — DO THIS LIVE:
1. Tap the input field on the **Home Screen**
2. Type: **`AC repair chahiye urgently, G-13 Islamabad`**
3. Tap **Submit / Send**
4. **Wait for the agent trace panel** to appear — point out each agent firing:
   - *"Watch — the Intent Agent just extracted 'AC Repair' as the service, 'G-13' as the location, and 'high' urgency."*
   - *"The Complexity Agent classified this as an intermediate job."*
   - *"The Discovery Agent found providers in the area."*

> *"All of this happened in under 2 seconds — 3 AI agents working together."*

---

## SCENE 4 — PRICING SCREEN (1:45 – 2:15)

### 🎤 Narration:
> *"Now the Dynamic Pricing Agent calculates a fair market range based on the service type, complexity, and location..."*

### 📱 On Screen:
1. You're now on the **Pricing Screen**
2. Point out the **price range** and **acceptance probability**
3. **KEY MOMENT — Try entering a very low budget** (e.g., Rs. 200)
4. Show the **red AI guardrail banner** that blocks the booking

> *"This is our AI Wage Protection system. The agent won't allow a price that exploits the worker. This is innovation — AI that protects both sides of the marketplace."*

5. Enter a fair budget and proceed

---

## SCENE 5 — BIDS SCREEN (2:15 – 2:45)

### 🎤 Narration:
> *"Now the Bidding Engine Agent generates real-time competitive bids from nearby providers..."*

### 📱 On Screen:
1. Watch the **bids cascade in one by one** with animations
2. Point out: provider name, ETA, bid amount
3. Select a bid

> *"Each bid is ranked using our 9-factor scoring model — distance, rating, reliability, specialization, price fairness, capacity, risk, recency, and workload balance. The best provider floats to the top."*

---

## SCENE 6 — CONFIRMED BOOKING (2:45 – 3:15)

### 🎤 Narration:
> *"Once I select a bid, the Scheduling Agent checks for time conflicts, the Booking Agent creates the transaction in our Supabase database, and a notification is dispatched."*

### 📱 On Screen:
1. Show the **Confirmed Screen** with booking details
2. Point out: Booking ID, Provider name, ETA, amount
3. Show the **Track Live** and **Call Provider** buttons

> *"The booking is now live. But here's where it gets really interesting..."*

---

## SCENE 7 — SELF-HEALING RECOVERY (3:15 – 3:50)

### 🎤 Narration:
> *"What happens when a provider cancels last minute? On other platforms — you're stuck. On Kaamlink, the Standby Recovery Agent is always watching."*

### 📱 On Screen:
1. Tap the **Simulate Provider Cancellation** button
2. Watch the **Recovery Screen** load
3. Show the recovery agent trace — finding a replacement provider
4. Show the **new provider details** with updated ETA

> *"Within seconds, the Recovery Agent found a replacement, re-booked automatically, and the user didn't have to do anything. This is what 'Always Watching' means — true agency."*

---

## SCENE 8 — ARCHITECTURE & INNOVATION RECAP (3:50 – 4:30)

### 🎤 Narration:
> *"To summarize what makes Kaamlink innovative:*
> 
> *First — we built 11 specialized agents that work as a team. Not one monolithic AI, but a true multi-agent orchestration system.*
> 
> *Second — we handle Roman Urdu and informal Pakistani addresses natively using Gemini 2.5 Flash with structured prompting.*
> 
> *Third — our AI Wage Protection guardrails prevent worker exploitation — something no other platform does.*
> 
> *Fourth — our self-healing Recovery Agent makes the system resilient to real-world failures.*
> 
> *And fifth — everything is production-ready: backend deployed on Railway, mobile app packaged as a standalone APK via Expo EAS, and data persisted in Supabase PostgreSQL."*

### 📱 On Screen:
- You can show the **GitHub README** scrolling through the architecture diagram and the 11-agent table
- Or show a quick Canva slide with the 5 innovation points

---

## SCENE 9 — FUTURE SCOPE & CLOSING (4:30 – 5:00)

### 🎤 Narration:
> *"Looking ahead, Kaamlink is designed to scale into a full dual-sided platform — with a dedicated provider app, real Google Maps integration for live tracking, in-app VoIP calling, and local payment gateways like JazzCash and Easypaisa.*
> 
> *Kaamlink isn't just a hackathon project — it's a vision for how AI agents can transform unstructured service economies. Thank you!"*

### 📱 On Screen:
- Show the **Future Roadmap** section of the README
- End on the Kaamlink splash screen / logo

---

## 🎥 Recording Tips

| Tip | Details |
|---|---|
| **Screen Record Tool** | Use **OBS Studio** on laptop or built-in screen recorder on Android |
| **Audio** | Record narration separately in a quiet room, overlay in editing. Or narrate live. |
| **Speed** | Don't rush — let the agent traces and animations play out, they look impressive |
| **Highlight agents** | Zoom in or circle the agent trace panel when agents fire — this is your wow factor |
| **Keep it under 5 min** | The script above is ~4:30 if read at natural pace |
| **Editing** | CapCut (free) or DaVinci Resolve. Add subtle background music for polish. |
| **Resolution** | Record in 1080p minimum |

---

## 📋 Pre-Recording Checklist

- [ ] APK installed on phone and working
- [ ] Backend running (Railway URL or local)
- [ ] Test one full flow before recording to make sure API is responsive
- [ ] Phone charged and in Do Not Disturb mode (no notification interruptions!)
- [ ] Screen recorder set up and tested
- [ ] Script printed or on a second screen for reference
- [ ] Quiet room for narration

---

*Good luck with the recording — you've got an incredible project to show off! 🚀*
