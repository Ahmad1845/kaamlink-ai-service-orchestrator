# Kaamlink — AI-Driven Hyper-Local Service Orchestrator

Kaamlink is a next-generation, agentic home service orchestrator designed specifically for localized, unstructured markets like Pakistan. Powered by a collaborative team of **11 specialized AI and deterministic agents**, Kaamlink translates colloquial user requests in Roman Urdu (e.g., *"AC kharab ho gaya hai, koi mechanic bhej dein urgently!"*) into highly optimized, resilient, and reliable service bookings.

Built for the **Google Antigravity Hackathon**, Kaamlink models the "Always Watching" promise of advanced agentic systems. It actively manages the entire service lifecycle—from initial request understanding, dynamic pricing, progressive radius expansions, and automated cancellation recovery, to trust-loop rating updates and automated dispute resolution.

---

## 🌟 The Solution & Core Value Proposition

In emerging, high-friction gig economies like Pakistan's, home service booking platforms face specific challenges:
* **Colloquial & Unstructured Inputs:** Consumers express intent using unstructured Roman Urdu, mixed with English terms, without formal structure.
* **Informal Address Systems:** Local addressing (sectors like `G13`, `F-7/2`, `I10`) is unstructured and inconsistently formatted.
* **Volatile Pricing:** Lack of standard rates leads to price gouging or extreme low-ball bidding that exploits workers.
* **High Cancellation Rates:** Sudden provider dropouts and scheduling conflicts derail standard queue bookings.

Kaamlink solves these issues by placing an intelligent **Multi-Agent Orchestrator** in charge of the booking lifecycle, establishing a marketplace governed by automated AI guardrails, dynamic market boundaries, and transparent reasoning logs.

---

## 🏗️ Architecture Overview

The system operates across a decoupled, highly cohesive three-tier architecture:

```
                  ┌────────────────────────────────────────┐
                  │          React Native Frontend         │
                  │   (Expo Go, Cascading Bids Screen,     │
                  │     9-Agent Trace Panel Console)       │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼ [HTTP/REST]
                  ┌────────────────────────────────────────┐
                  │       FastAPI Orchestration API        │
                  │      (Dynamic Endpoints, Tracing)      │
                  └───────────────────┬────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼ [JSON API]                                    ▼ [SQL Queries]
┌───────────────────────────┐                   ┌───────────────────────────┐
│     Gemini 2.5 Flash      │                   │    Supabase PostgreSQL    │
│  (Intent, Complexity,     │                   │ (Persistent Tables, logs, │
│   Location, Pricing)      │                   │     with Memory Fallback) │
└───────────────────────────┘                   └───────────────────────────┘
```

### Request Flow Lifecycle:
1. **User Request:** A natural-language statement is sent to `/api/orchestrate`.
2. **Intent & Complexity Agents:** Extract service requirements, location sector, urgency levels, and job complexity.
3. **Discovery & Radius Expansion Agents:** Query localized candidates, progressively expanding from `500m` to `10km` if matches are scarce.
4. **Ranking Agent:** Scores providers across 9 distinct signals to pick the optimal matching candidates.
5. **Dynamic Pricing Agent:** Guides budget selection by calculating a reasonable price range and acceptance probability.
6. **Bidding Engine:** Generates real-time, competitive provider bids for the user.
7. **Booking & Scheduling Agents:** Create the transaction, resolving slot overlaps and queuing notifications.
8. **Standby Recovery Agent:** Actively monitors the booking, executing seamless rerouting if simulated cancellations occur.

---

## 🤖 The 11-Agent Registry

Kaamlink is powered by an orchestra of 11 distinct agent roles, collaborating dynamically:

| # | Agent Name | Trigger Point | Technical Mechanism | Output/Responsibility |
|---|---|---|---|---|
| **1** | **Intent Agent** | `/api/request` & `/api/orchestrate` | Gemini 2.5 Flash Parsing + RegEx normalization | Extracts clean category, normalized sector address, urgency, and confidence scores. |
| **2** | **Complexity Agent** | Part of Intent pipeline | Gemini prompt Classification | Classifies job requirements: `basic`, `intermediate`, or `complex`. |
| **3** | **Discovery Agent** | `/api/providers` | Location-sector database filtering | Returns pool of service-matching providers within the local region. |
| **4** | **Radius Expansion Agent** | `/api/discover-radius` | Iterative spatial range queries | Automatically expands bounds (`500m ➔ 2km ➔ 5km ➔ 10km`) until `3+` matching providers are located. |
| **5** | **Advanced Ranking Agent** | Internal helper in Discovery | Multi-signal mathematical score weighting | Ranks top candidates utilizing **9 mathematical factors** (detailed below). |
| **6** | **Dynamic Pricing Agent** | `/api/pricing` | Hybrid statistical model (Gemini-supported) | Calculates reasonable market price and acceptance probability for user's budget. |
| **7** | **Bidding Engine Agent** | `/api/bids` | Weighted random market simulator | Animates up to 5 real-time provider bids showing ETA and bid pricing. |
| **8** | **Scheduling Agent** | `/api/book` | Constraint-based validation logic | Resolves slot overlap conflicts and generates alternate booking suggestions. |
| **9** | **Booking Agent** | `/api/book` | Database transactional creation | Registers booking record and triggers notification queuing. |
| **10** | **Standby Recovery Agent** | `/api/recover` | Standby listener, self-healing routing | Handles simulated booking cancellations by finding replacement candidates, updating the trace, and re-booking. |
| **11** | **Trust & Quality Agent** | `/api/service/complete` | Loop feedback reputation scoring | Captures interactive 5-star reviews, applies reputation scores, and adjusts provider rating scores. |

### The Advanced 9-Factor Ranking Model
The **Ranking Agent** computes a comprehensive match score using nine weighted factors:
1. **Distance Proximity:** Prioritizes closer providers to minimize travel overhead.
2. **Overall Rating:** Weighs higher star-rated professionals.
3. **Review Recency:** Rewards professionals with recent activity.
4. **On-Time Reliability Score:** Heavy multiplier, especially for high-urgency requests.
5. **Specialization Score:** Matches specific provider tags with request categories.
6. **Price Fairness:** Evaluates baseline pricing against historical averages.
7. **Current Capacity:** Checks immediate availability.
8. **Risk Score:** Penalizes professionals with historical disputes.
9. **Workload Balance:** Distributes jobs across the provider network to prevent burnouts.

---

## 🔌 Mock vs. Real Integrations & APIs

Kaamlink balances real-world capabilities with smooth, lightweight prototype packaging:

### Real Production Integrations
* **Gemini 2.5 Flash API:** Drives unstructured parsing, location sector mapping, and intelligent pricing feedback. Powered by structured prompts that strictly enforce category boundaries (e.g., Appliance Repair vs. AC Repair).
* **Supabase PostgreSQL:** Stores live bookings, logs, disputes, and provider tables. Integrates full schema-based operations.

### High-Fidelity Simulations (Mocked APIs)
* **Progressive Travel Durations:** Mapped dynamically based on computed coordinate distance, ensuring consistent ETA metrics throughout the application.
* **Notification Queue:** Simulated dispatch logging. Triggers a live dispatch simulation on booking confirmation, printing out queued message payloads.
* **Dispute and Resolution Models:** Simulated dispute resolutions allowing moderators to freeze accounts, resolve disputes, or award compensation.

---

## 💾 Database Schema

The persistent SQL engine is structured under the following schema (`backend/schema.sql`):

* **`providers`**: Holds candidate records, overall ratings, base pricing, location tags, coordinates, workload scores, and reliability metrics.
* **`bookings`**: Stores active transaction IDs, scheduling slots, statuses (`confirmed`, `cancelled`, `completed`), and recovery metadata.
* **`agent_logs`**: Records atomic execution traces of all system actions for developer audit.
* **`notifications`**: Holds notification dispatch items, message bodies, and transport statuses (`queued`, `sent`).
* **`service_reports`**: Captures completion checklists, star ratings, and written reviews.
* **`disputes`**: Manages issue logs, dispute statuses (`open`, `resolved`, `frozen`), and action pathways.
* **`orchestration_traces`**: Visualizes pipeline logs directly in the mobile console trace.

---

## 🚀 Quick Start Guide

### Prerequisites
* Python 3.11+
* Node.js (with npm)
* Gemini API Key

### 1. Setting Up the Backend Server
```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your Gemini API Key
echo GEMINI_API_KEY="your_api_key_here" > .env

# Run database seeder to populate local memory pools / Supabase
python seed_data.py

# Launch the FastAPI Uvicorn dev server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The server will boot at `http://localhost:8000`. You can inspect the interactive OpenAPI spec at `http://localhost:8000/docs`.

### 2. Setting Up the Mobile Client
```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies
npm install

# Configure your Local Area Network (LAN) IP or Production URL in mobile/constants/kaamlink.ts
# Example: export const API_BASE = "http://192.168.18.143:8000";

# Launch the Expo development server
npx expo start --lan --port 8082 --clear
```
Open **Expo Go** on your iOS/Android device and scan the QR code displayed in the terminal to interact with the high-fidelity flow!

---

## 🛠️ Advanced Engineering Achievements

### 1. AI Wage Protection Guardrails
To prevent low-budget negotiations that exploit service workers in emerging gig markets, the **Dynamic Pricing Agent** establishes a strict **Market Minimum**. If a user enters a custom budget lower than this threshold on the `PricingScreen`, a red AI guardrail banner triggers, and the primary CTA is strictly disabled, protecting workers' wages.

### 2. Dual Database Fallback System
For seamless offline capabilities, rapid developer velocity, and production stability, both the Supabase integration and the local state storage are linked under a **graceful error-recovery wrapper**. If Supabase encounters a quota limit, latency, or connection failure, the backend immediately cascades operations to a thread-safe, in-memory repository structure without losing state or throwing runtime exceptions.

### 3. Real-Time Cascading Bid Engine
Overhauled with React Native's `LayoutAnimation` API, the **Bidding Engine** simulates a streaming market environment. The mobile UI dynamically accepts up to 5 provider bids, cascading cards into view with a smooth spring response and initiating interactive countdowns, making the platform feel responsive and alive.
