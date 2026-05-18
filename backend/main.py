import random
import uuid
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from agents.discovery_agent import discover_providers, log_agent_action
from agents.dispute_agent import create_dispute, list_disputes, update_dispute
from agents.notification_agent import (
    dispatch_queued_notifications,
    list_notifications,
    queue_booking_notifications,
)
from agents.pricing_agent import calculate_pricing
from agents.quality_agent import complete_service
from agents.radius_agent import expand_and_discover
from agents.recovery_agent import recover_booking
from agents.scheduling_agent import schedule_booking
from antigravity_orchestrator import orchestrate_request
from database import get_db
from memory_db import agent_logs_memory, bookings_memory, providers_memory
from models import (
    AgentLog,
    Bid,
    BidRequest,
    BidResponse,
    BookingRequest,
    DisputeCreateRequest,
    DisputeRecord,
    DisputeUpdateRequest,
    Intent,
    NotificationItem,
    OrchestratedResponse,
    PricingRequest,
    PricingResponse,
    Provider,
    ProviderOptimizationResponse,
    RecoveryRequest,
    RecoveryResponse,
    RecoveryStep,
    ServiceCompletionRequest,
    ServiceCompletionResponse,
    UserRequest,
)

load_dotenv()

app = FastAPI(title="Kaamlink AI Service Orchestrator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_provider_by_id(provider_id: str) -> dict | None:
    db = get_db()
    try:
        data = db.table("providers").select("*").eq("id", provider_id).limit(1).execute().data
        if data:
            return data[0]
    except Exception:
        pass
    for provider in providers_memory:
        if provider.get("id") == provider_id:
            return provider
    return None


@app.get("/")
def read_root():
    return {"message": "Kaamlink AI Service Orchestrator backend is running."}


@app.post("/api/request", response_model=Intent)
def process_request(req: UserRequest):
    try:
        orchestrated = orchestrate_request(req.text)
        return Intent(**orchestrated["intent"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/orchestrate", response_model=OrchestratedResponse)
def full_orchestrate(req: UserRequest):
    try:
        result = orchestrate_request(req.text)
        return OrchestratedResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/providers", response_model=List[Provider])
def get_providers(intent: Intent):
    try:
        return discover_providers(intent)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/book")
def create_booking(req: BookingRequest):
    provider = _get_provider_by_id(req.provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found.")

    schedule = schedule_booking(
        provider_id=req.provider_id,
        provider_slots=provider.get("availability_slots", []),
        requested_slot=req.preferred_slot,
        service_location=req.location or provider.get("location", "unknown"),
    )

    if not schedule.accepted:
        return {
            "booking_id": None,
            "status": "pending_schedule",
            "scheduling": schedule.model_dump(),
        }

    booking_id = str(uuid.uuid4())
    entry = {
        "id": booking_id,
        "user_id": req.user_id,
        "provider_id": req.provider_id,
        "service": req.service,
        "status": "confirmed",
        "cancelled_by": None,
        "replacement_for": None,
        "recovery_attempts": 0,
        "scheduled_slot": schedule.assigned_slot,
        "location": req.location or provider.get("location", "unknown"),
    }
    db = get_db()
    try:
        db.table("bookings").insert(entry).execute()
    except Exception as e:
        print(f"Fallback: writing booking to memory: {e}")
        bookings_memory.append(entry)

    notifications = queue_booking_notifications(
        booking_id=booking_id,
        provider_name=provider.get("name", "Provider"),
        eta_mins=max(8, int((provider.get("distance_km", 1.5) * 8) + 5)),
    )

    log_agent_action(
        "Booking Agent",
        f"Confirmed booking {booking_id}",
        f"User {req.user_id} booked provider {req.provider_id} for {req.service} at slot {schedule.assigned_slot}",
    )
    return {
        "booking_id": booking_id,
        "status": "confirmed",
        "scheduling": schedule.model_dump(),
        "notifications_queued": len(notifications),
    }


@app.get("/api/logs", response_model=List[AgentLog])
def get_logs():
    db = get_db()
    try:
        res = db.table("agent_logs").select("*").order("created_at", desc=True).limit(50).execute()
        return [AgentLog(**log) for log in res.data]
    except Exception:
        return [AgentLog(**log) for log in agent_logs_memory[:50]]


@app.post("/api/pricing", response_model=PricingResponse)
def get_pricing(req: PricingRequest):
    try:
        result = calculate_pricing(
            service=req.service,
            complexity=req.complexity or "intermediate",
            urgency=req.urgency,
            location=req.location,
            user_budget=req.user_budget,
            log_fn=log_agent_action,
        )
        return PricingResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bids", response_model=BidResponse)
def simulate_bids(req: BidRequest):
    if not req.providers:
        raise HTTPException(status_code=400, detail="No providers supplied.")

    urgency_mult = {"low": 1.0, "medium": 1.0, "high": 1.2}.get(req.urgency.lower(), 1.0)
    bids = []
    for provider in req.providers:
        variation = random.uniform(0.85, 1.15)
        amount = int(provider.base_price * variation * urgency_mult)
        eta = int((provider.distance_km or 1.2) * 8) + random.randint(2, 8)
        bids.append(
            Bid(
                id=str(uuid.uuid4()),
                provider_id=provider.id,
                provider_name=provider.name,
                amount=amount,
                eta_mins=eta,
                expires_in=120,
            )
        )
    bids.sort(key=lambda b: b.amount)
    log_agent_action(
        "Bid Simulation Agent",
        f"Generated {len(bids)} bids | Lowest PKR {bids[0].amount}",
        f"Urgency multiplier: {urgency_mult}x. Bids sorted cheapest first.",
    )
    return BidResponse(bids=bids)


@app.post("/api/recover", response_model=RecoveryResponse)
def trigger_recovery(req: RecoveryRequest):
    try:
        result = recover_booking(req.booking_id)
        steps = [RecoveryStep(**s) for s in result["steps"]]
        return RecoveryResponse(
            success=result["success"],
            steps=steps,
            message=result["message"],
            replacement_booking_id=result.get("replacement_booking_id"),
            replacement_provider=result.get("replacement_provider"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/booking/{booking_id}")
def get_booking(booking_id: str):
    db = get_db()
    try:
        res = db.table("bookings").select("*").eq("id", booking_id).execute()
        if res.data:
            return res.data[0]
    except Exception:
        pass
    for booking in bookings_memory:
        if booking.get("id") == booking_id:
            return booking
    raise HTTPException(status_code=404, detail="Booking not found.")


@app.post("/api/discover-radius")
def discover_with_radius(intent: Intent):
    try:
        providers, final_radius = expand_and_discover(intent.service, intent.location)
        return {
            "providers": [p.model_dump() for p in providers],
            "final_radius_km": final_radius,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/notifications", response_model=List[NotificationItem])
def get_notifications(booking_id: str | None = Query(default=None)):
    return [NotificationItem(**n) for n in list_notifications(booking_id=booking_id)]


@app.post("/api/notifications/dispatch")
def dispatch_notifications(limit: int = 10):
    sent = dispatch_queued_notifications(limit=limit)
    log_agent_action("Notification Agent", f"Dispatched {len(sent)} queued notifications", "Simulated in-app/sms/whatsapp dispatch.")
    return {"dispatched": len(sent), "items": sent}


@app.post("/api/service/complete", response_model=ServiceCompletionResponse)
def service_complete(req: ServiceCompletionRequest):
    try:
        new_rating, impact = complete_service(
            booking_id=req.booking_id,
            provider_id=req.provider_id,
            checklist=req.checklist,
            evidence_placeholders=req.evidence_placeholders,
            rating=req.rating,
            review=req.review,
        )
        log_agent_action(
            "Trust Agent",
            f"Completed service report for booking {req.booking_id}",
            f"Updated provider rating to {new_rating}. Impact: {impact}",
        )
        return ServiceCompletionResponse(
            success=True,
            booking_id=req.booking_id,
            reputation_impact=impact,
            updated_rating=new_rating,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/dispute/open", response_model=DisputeRecord)
def open_dispute(req: DisputeCreateRequest):
    dispute = create_dispute(
        booking_id=req.booking_id,
        issue_type=req.issue_type,
        description=req.description,
        requested_resolution=req.requested_resolution,
    )
    log_agent_action("Dispute Agent", f"Opened dispute {dispute['id']}", f"Issue type: {dispute['issue_type']}")
    return DisputeRecord(**dispute)


@app.post("/api/dispute/update", response_model=DisputeRecord)
def resolve_dispute(req: DisputeUpdateRequest):
    dispute = update_dispute(
        dispute_id=req.dispute_id,
        action=req.action,
        resolution=req.resolution,
    )
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found.")
    log_agent_action("Dispute Agent", f"Updated dispute {req.dispute_id}", f"Action={req.action}, status={dispute['status']}")
    return DisputeRecord(**dispute)


@app.get("/api/disputes", response_model=List[DisputeRecord])
def get_disputes(booking_id: str | None = Query(default=None)):
    return [DisputeRecord(**d) for d in list_disputes(booking_id=booking_id)]


@app.get("/api/provider/optimize/{provider_id}", response_model=ProviderOptimizationResponse)
def provider_optimization(provider_id: str):
    provider = _get_provider_by_id(provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found.")

    workload = float(provider.get("workload_score", 0.5))
    demand = {
        "morning": random.randint(45, 90),
        "afternoon": random.randint(30, 75),
        "evening": random.randint(60, 95),
    }
    suggested = sorted(demand, key=demand.get)[:2]
    recommendation = (
        "High workload detected. Prioritize lower-demand slots."
        if workload > 0.75
        else "Balanced workload. Keep current acceptance settings."
    )

    log_agent_action(
        "Provider Optimization Agent",
        f"Generated workload optimization for {provider.get('name', provider_id)}",
        f"Suggested slots: {', '.join(suggested)} | Workload={workload}",
    )
    return ProviderOptimizationResponse(
        provider_id=provider_id,
        workload_score=workload,
        suggested_slots=suggested,
        demand_forecast=demand,
        recommendation=recommendation,
    )
