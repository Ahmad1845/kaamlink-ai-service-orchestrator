# Kaamlink - AI Service Orchestrator

Pakistan-focused hackathon prototype for agentic home service booking with Roman Urdu support, dynamic pricing, bidding, booking, notifications, recovery, service quality, and dispute workflows.

## Architecture Summary

- Mobile: React Native (Expo) 5-screen demo flow
- Backend: FastAPI orchestration API
- LLM layer: Gemini 2.5 Flash for intent extraction (fallback rules included)
- Data layer: Supabase PostgreSQL (with in-memory fallback for local demos)
- Orchestration layer: `antigravity_orchestrator.py` simulating Google Antigravity-style multi-agent execution traces

## Antigravity Workflow (Implemented in Code)

Main workflow endpoint: `POST /api/orchestrate`

1. Intent Agent: extracts service, location, urgency, complexity, confidence.
2. Discovery Agent: finds service-matching providers.
3. Ranking Agent: multi-factor ranking using 9 signals.
4. Scheduling Agent: conflict prevention, alternate slots, waitlist decisions.
5. Pricing Agent: market range, suggested offer, acceptance probability.
6. Booking Agent: booking creation and scheduling-aware confirmation.
7. Notification Agent: queue and dispatch simulated booking lifecycle notifications.
8. Recovery Agent: cancellation handling and replacement provider assignment.
9. Trust Agent: service completion feedback and provider rating impact.
10. Dispute Agent: no-show/quality/price/cancellation dispute lifecycle.
11. Provider Optimization Agent: workload balancing and slot recommendations.

Trace output includes explicit agent decisions and reasoning text.

## Matching Factors (Advanced Ranking)

Provider ranking now uses:

1. Distance proximity
2. Rating
3. Review recency
4. On-time reliability score
5. Specialization score
6. Price fairness
7. Capacity available
8. Risk score
9. Workload balance score

For urgent jobs, reliability and distance are weighted higher.

## API Reference

### Core flow

- `POST /api/request` - Intent extraction (backward compatible for mobile flow)
- `POST /api/orchestrate` - Full multi-agent orchestration + traces
- `POST /api/providers` - Provider discovery and ranking
- `POST /api/pricing` - Dynamic pricing and acceptance probability
- `POST /api/bids` - Bid simulation
- `POST /api/book` - Scheduling-aware booking
- `GET /api/booking/{id}` - Booking status
- `POST /api/recover` - Cancellation recovery
- `POST /api/discover-radius` - Progressive radius search
- `GET /api/logs` - Agent logs

### New workflow endpoints

- `GET /api/notifications` - Notification queue/status
- `POST /api/notifications/dispatch` - Dispatch queued notifications
- `POST /api/service/complete` - Completion checklist + feedback + rating update
- `POST /api/dispute/open` - Open dispute
- `POST /api/dispute/update` - Resolve/escalate/freeze dispute
- `GET /api/disputes` - List disputes
- `GET /api/provider/optimize/{provider_id}` - Workload and demand recommendations

## Database Schema

SQL template: `backend/schema.sql`

Core tables:

- `providers`
- `bookings`
- `agent_logs`
- `notifications`
- `service_reports`
- `disputes`
- `orchestration_traces`

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Mobile

```bash
cd mobile
npm install
# set your local backend IP in mobile/constants/kaamlink.ts
npx expo start --lan --port 8082
```

## Cost and Latency Analysis (Hackathon Assumptions)

- Intent call (Gemini): typically 0.5s to 1.8s
- Non-LLM steps (ranking, scheduling, bidding): under 100ms each in memory mode
- End-to-end orchestration target: 3s to 8s in demo mode
- Cost optimization:
  - only intent/pricing reasoning uses LLM
  - deterministic fallback enabled for quota or network failure

## Baseline vs Agentic Upgrade

- Baseline listing app: static provider list sorted by distance/price
- Kaamlink agentic flow:
  - intent-aware matching
  - dynamic pricing guidance
  - scheduling conflict handling
  - cancellation recovery
  - dispute and trust feedback loops

## Privacy Note

- Prototype uses mock/test data only.
- No real payment, identity verification, or sensitive PII processing is required for demo.
- Any user text should be treated as transient request content.

## Limitations

- Google Antigravity cloud runtime is simulated in this repository via local orchestrator abstraction.
- Maps travel time is mocked from distance for hackathon speed.
- Notification channels are simulated; no live SMS/WhatsApp provider is connected.
- Dispute resolution is rule-based simulation, not human-ops integrated.

## Artifacts

See `ARTIFACTS.md` and `docs/` for planning, walkthroughs, and audit history.
