# 🚀 Kaamlink — AI-Driven Hyper-Local Service Orchestrator

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Railway](https://img.shields.io/badge/Deployed_on-Railway-0B0D0E?logo=railway)](https://railway.app/)

> **A Google Antigravity Hackathon Submission**
>
> Kaamlink is a next-generation, agentic home service orchestrator designed specifically for localized, unstructured markets like Pakistan. Powered by a collaborative team of **11 specialized AI and deterministic agents**, Kaamlink translates colloquial user requests in Roman Urdu (e.g., *"AC kharab ho gaya hai, koi mechanic bhej dein urgently!"*) into highly optimized, resilient, and reliable service bookings.

Kaamlink models the **"Always Watching"** promise of advanced agentic systems. It actively manages the entire service lifecycle — from initial request understanding, dynamic pricing, progressive radius expansions, and automated cancellation recovery, to trust-loop rating updates and automated dispute resolution.

---

## 📑 Table of Contents
1. [The Solution & Core Value Proposition](#-the-solution--core-value-proposition)
2. [Full Technology Stack](#-full-technology-stack)
3. [Architecture Overview](#%EF%B8%8F-architecture-overview)
4. [The 11-Agent Registry](#-the-11-agent-registry)
5. [Mock vs. Real Integrations](#-mock-vs-real-integrations--apis)
6. [Database Schema](#-database-schema)
7. [Quick Start Guide](#-quick-start-guide)
8. [Advanced Engineering Achievements](#%EF%B8%8F-advanced-engineering-achievements)
9. [Future Product Roadmap & Scope](#-future-product-roadmap--scope)

---

## 🌟 The Solution & Core Value Proposition

In emerging, high-friction gig economies like Pakistan's, home service booking platforms face specific challenges:
* **Colloquial & Unstructured Inputs:** Consumers express intent using unstructured Roman Urdu, mixed with English terms, without formal structure.
* **Informal Address Systems:** Local addressing (sectors like `G13`, `F-7/2`, `I10`) is unstructured and inconsistently formatted.
* **Volatile Pricing:** Lack of standard rates leads to price gouging or extreme low-ball bidding that exploits workers.
* **High Cancellation Rates:** Sudden provider dropouts and scheduling conflicts derail standard queue bookings.

**Kaamlink solves these issues** by placing an intelligent **Multi-Agent Orchestrator** in charge of the booking lifecycle, establishing a marketplace governed by automated AI guardrails, dynamic market boundaries, and transparent reasoning logs.

---

## 🧰 Full Technology Stack

### 🤖 AI & Intelligence
| Technology | Version | Purpose |
|---|---|---|
| **Google Gemini 2.5 Flash** | API v1 | Intent extraction, complexity classification, location normalization, pricing guidance |
| **`google-genai` SDK** | Latest | Python client for all Gemini API interactions |
| **Structured JSON Prompting** | — | Enforces strict output schemas from LLM responses |
| **Multi-Agent Orchestration** | Custom | 11-agent pipeline coordinated in `antigravity_orchestrator.py` |

### 🐍 Backend (Python)
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | Latest | High-performance async REST API framework |
| **Uvicorn** | Latest | ASGI server powering the FastAPI application |
| **Pydantic** | v2 | Request/response data validation and schema modeling |
| **python-dotenv** | Latest | Secure `.env`-based environment variable management |
| **Supabase Python SDK** | Latest | PostgreSQL database client for all persistent storage |

### 🗄️ Database & Storage
| Technology | Version | Purpose |
|---|---|---|
| **Supabase** | Cloud | Hosted PostgreSQL database for all production data |
| **PostgreSQL** | 15+ | Relational database: providers, bookings, logs, disputes |
| **In-Memory Fallback Store** | Custom | Thread-safe Python dict fallback when Supabase is unavailable |

### 📱 Mobile Frontend (React Native)
| Technology | Version | Purpose |
|---|---|---|
| **React Native** | 0.81.5 | Core cross-platform mobile UI framework |
| **React** | 19.1.0 | UI rendering and component state management |
| **Expo** | ~54.0.33 | Development toolchain, build system, and native API access |
| **Expo Router** | ~6.0.23 | File-system based navigation for React Native |
| **TypeScript** | ~5.9.2 | Static typing for the entire mobile codebase |

### 🎨 UI & Styling (Mobile)
| Technology | Version | Purpose |
|---|---|---|
| **Expo Linear Gradient** | ~15.0.8 | Gradient backgrounds on screens and cards |
| **Expo Blur** | ~15.0.8 | Glassmorphism blur effects on UI overlays |
| **Expo Symbols** | ~1.0.8 | Native SF Symbol icons on iOS |
| **@expo/vector-icons** | ^15.0.3 | Ionicons and icon library across all screens |
| **React Native Reanimated** | ~4.1.1 | High-performance 60fps animations and transitions |
| **React Native Gesture Handler** | ~2.28.0 | Swipe gestures and touch interaction handling |
| **React Native Worklets** | 0.5.1 | JS worklet threads for animation performance |
| **Expo Image** | ~3.0.11 | Optimized image loading and caching |
| **Expo Haptics** | ~15.0.8 | Tactile haptic feedback on interactive elements |

### 🔤 Typography (Mobile)
| Technology | Version | Purpose |
|---|---|---|
| **Plus Jakarta Sans** | @expo-google-fonts ^0.4.2 | Primary display & body typeface throughout the app |
| **JetBrains Mono** | @expo-google-fonts ^0.4.1 | Monospace font used in the agent trace console panels |
| **Inter** | @expo-google-fonts ^0.4.2 | Secondary sans-serif for supporting UI elements |

### 🧭 Navigation (Mobile)
| Technology | Version | Purpose |
|---|---|---|
| **@react-navigation/native** | ^7.1.8 | Core navigation container and primitives |
| **@react-navigation/bottom-tabs** | ^7.4.0 | Bottom tab navigator for HOME / SERVICES / REQUESTS / ACCOUNT |
| **@react-navigation/elements** | ^2.6.3 | Shared navigation UI components |
| **React Native Screens** | ~4.16.0 | Native screen container optimization |
| **React Native Safe Area Context** | ~5.6.0 | Safe area insets for notched and island devices |

### 🌐 Mobile System & Web
| Technology | Version | Purpose |
|---|---|---|
| **Expo Constants** | ~18.0.13 | Access to device and app runtime constants |
| **Expo Linking** | ~8.0.11 | Deep linking and external URL handling |
| **Expo Splash Screen** | ~31.0.13 | Custom splash screen shown on cold boot |
| **Expo Status Bar** | ~3.0.9 | Status bar color and style management |
| **Expo System UI** | ~6.0.9 | System-level UI background color control |
| **Expo Web Browser** | ~15.0.10 | In-app web browser for external links |
| **React Native Web** | ~0.21.0 | Enables the Expo app to run in a browser (web target) |
| **React DOM** | 19.1.0 | React DOM renderer for web target |

### ☁️ Infrastructure & Deployment
| Technology | Purpose |
|---|---|
| **Railway** | Live production hosting for the FastAPI backend (24/7 uptime) |
| **Expo EAS (Expo Application Services)** | Standalone APK build pipeline for Android distribution |
| **Expo Font** | ~14.0.11 — Async custom font loading at startup |

### 🛠️ Developer Tooling
| Technology | Version | Purpose |
|---|---|---|
| **ESLint** | ^9.25.0 | Linting and code quality enforcement for TypeScript |
| **eslint-config-expo** | ~10.0.0 | Expo-specific ESLint ruleset |
| **@types/react** | ~19.1.0 | TypeScript type definitions for React |
| **Python venv** | Built-in | Isolated Python dependency environment for the backend |
| **Google Antigravity AI** | — | Agentic IDE used for all development (vibe coding) |

---

## 🏗️ Architecture Overview

The system operates across a decoupled, highly cohesive three-tier architecture:

```text
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

### 🌐 Production Hosting & Distribution
* **Backend Live on Railway:** The backend API is successfully deployed live on **Railway**, ensuring fast agent trace delivery, optimal response latencies, and 24/7 availability for external API evaluations.
* **EAS Expo Standalone APK:** The mobile client application has been successfully packaged into a standalone Android APK using **Expo Application Services (EAS)**, guaranteeing a streamlined, hassle-free installation on any physical Android device for live testing.

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

# Direct  APK Link: https://drive.google.com/drive/folders/1VhmuK8vpt1bR_ymridTUWakVUXA4BhqU
---

## 🛠️ Advanced Engineering Achievements

### 1. AI Wage Protection Guardrails
To prevent low-budget negotiations that exploit service workers in emerging gig markets, the **Dynamic Pricing Agent** establishes a strict **Market Minimum**. If a user enters a custom budget lower than this threshold on the `PricingScreen`, a red AI guardrail banner triggers, and the primary CTA is strictly disabled, protecting workers' wages.

### 2. Dual Database Fallback System
For seamless offline capabilities, rapid developer velocity, and production stability, both the Supabase integration and the local state storage are linked under a **graceful error-recovery wrapper**. If Supabase encounters a quota limit, latency, or connection failure, the backend immediately cascades operations to a thread-safe, in-memory repository structure without losing state or throwing runtime exceptions.

### 3. Real-Time Cascading Bid Engine
Overhauled with React Native's `LayoutAnimation` API, the **Bidding Engine** simulates a streaming market environment. The mobile UI dynamically accepts up to 5 provider bids, cascading cards into view with a smooth spring response and initiating interactive countdowns, making the platform feel responsive and alive.

---

## 🔮 Future Product Roadmap & Scope

While Kaamlink currently offers a highly sophisticated consumer-facing orchestrator, the underlying architecture has been designed to support rapid scaling into a full-scale commercial gig-platform:

### 1. Dual-Sided Platform (Dedicated Provider Application)
* Develop a specialized professional-side interface for service providers.
* Enable providers to accept real-time booking requests, manage their calendars, set baseline price points, and interact directly with the orchestrator's Scheduling and Radius Expansion systems.

### 2. Real-Time Map & Routing APIs (Google Maps/Mapbox)
* Transition from coordinate-based distance estimation to production-grade spatial mapping engines.
* Calculate highly accurate, traffic-aware ETAs, driving times, and precise route overlays for dispatch calculations.

### 3. SSE/WebSocket Live Provider Tracing
* Implement real-time coordinate updates using Server-Sent Events (SSE) or WebSockets.
* Allow users to visually trace their booked provider's live movement on an interactive map directly within the client app as they travel to the job site.

### 4. Direct In-App VoIP & Encrypted Chat
* Integrate secure VoIP calling (via WebRTC) and instantaneous real-time chat.
* Enable consumers and service professionals to communicate instantly and securely during a booking cycle without sharing personal cellular phone numbers.

### 5. Local Escrow Payment Gateway
* Integrate Pakistan-centric digital payment APIs (JazzCash, Easypaisa, NayaPay).
* Build an escrow framework that secures payment upon request confirmation and releases funds only when the **Quality Agent** validates the customer's job-completion checklist and star rating.

---

*Built with ❤️ for the Google Antigravity Hackathon.*
