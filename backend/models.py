from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class UserRequest(BaseModel):
    text: str

class Intent(BaseModel):
    service: str
    issue: str
    location: str
    preferred_time: str
    budget_sensitive: bool
    urgency: str
    complexity: Optional[str] = "intermediate"
    confidence: float

class Provider(BaseModel):
    id: str
    name: str
    services: List[str]
    rating: float
    cancellation_rate: float
    base_price: int
    location: str
    distance_km: Optional[float] = 1.0
    availability_slots: Optional[List[str]] = None
    review_recency_days: Optional[int] = None
    on_time_score: Optional[float] = None
    capacity_available: Optional[int] = None
    risk_score: Optional[float] = None
    specialization_score: Optional[float] = None
    workload_score: Optional[float] = None
    ranking_score: Optional[float] = None
    ranking_breakdown: Optional[Dict[str, float]] = None

class Bid(BaseModel):
    id: str
    provider_id: str
    provider_name: str
    amount: int
    eta_mins: int
    expires_in: int = 120

class BookingRequest(BaseModel):
    provider_id: str
    user_id: str
    service: str
    amount: Optional[int] = None
    preferred_slot: Optional[str] = "asap"
    location: Optional[str] = "unknown"

class AgentLog(BaseModel):
    id: str
    agent_name: str
    decision: str
    reasoning: Optional[str] = None
    created_at: str

# ── Phase 2 models ────────────────────────────────────────────────────────────

class PricingRequest(BaseModel):
    service: str
    complexity: Optional[str] = "intermediate"
    urgency: str = "medium"
    location: str = "unknown"
    user_budget: Optional[int] = None

class PricingResponse(BaseModel):
    market_min: int
    market_max: int
    suggested_offer: int
    factors: List[str]
    user_budget: Optional[int] = None
    acceptance_probability: Optional[int] = None
    recommendation: str

class BidRequest(BaseModel):
    providers: List[Provider]
    user_budget: Optional[int] = None
    urgency: str = "medium"

class BidResponse(BaseModel):
    bids: List[Bid]

class RecoveryRequest(BaseModel):
    booking_id: str

class RecoveryStep(BaseModel):
    message: str
    detail: str
    ts: str

class RecoveryResponse(BaseModel):
    success: bool
    steps: List[RecoveryStep]
    message: str
    replacement_booking_id: Optional[str] = None
    replacement_provider: Optional[dict] = None

class OrchestrationStep(BaseModel):
    step: str
    agent: str
    decision: str
    reasoning: str
    ts: str

class OrchestratedResponse(BaseModel):
    intent: Intent
    providers: List[Provider]
    traces: List[OrchestrationStep]
    scheduling: Dict[str, Any]

class SchedulingResult(BaseModel):
    accepted: bool
    requested_slot: str
    assigned_slot: Optional[str] = None
    reason: str
    alternates: List[str] = Field(default_factory=list)
    waitlisted: bool = False

class NotificationItem(BaseModel):
    id: str
    booking_id: str
    recipient: str
    channel: str
    type: str
    message: str
    status: str
    created_at: str

class ServiceCompletionRequest(BaseModel):
    booking_id: str
    provider_id: str
    checklist: List[str] = Field(default_factory=list)
    evidence_placeholders: List[str] = Field(default_factory=list)
    rating: float
    review: str

class ServiceCompletionResponse(BaseModel):
    success: bool
    booking_id: str
    reputation_impact: str
    updated_rating: float

class DisputeCreateRequest(BaseModel):
    booking_id: str
    issue_type: str
    description: str
    requested_resolution: Optional[str] = None

class DisputeUpdateRequest(BaseModel):
    dispute_id: str
    action: str
    resolution: Optional[str] = None

class DisputeRecord(BaseModel):
    id: str
    booking_id: str
    issue_type: str
    description: str
    status: str
    requested_resolution: Optional[str] = None
    resolution: Optional[str] = None
    provider_penalty: Optional[str] = None
    created_at: str
    updated_at: str

class ProviderOptimizationResponse(BaseModel):
    provider_id: str
    workload_score: float
    suggested_slots: List[str]
    demand_forecast: Dict[str, int]
    recommendation: str
