from __future__ import annotations

import datetime
from typing import List

from agents.discovery_agent import discover_providers, rank_providers_advanced
from agents.intent_agent import extract_intent
from agents.scheduling_agent import schedule_booking
from database import get_db
from memory_db import orchestration_traces_memory
from models import Intent, Provider, OrchestrationStep


def _trace(step: str, agent: str, decision: str, reasoning: str) -> OrchestrationStep:
    event = OrchestrationStep(
        step=step,
        agent=agent,
        decision=decision,
        reasoning=reasoning,
        ts=datetime.datetime.utcnow().isoformat(),
    )
    orchestration_traces_memory.insert(0, event.model_dump())
    db = get_db()
    try:
        db.table("orchestration_traces").insert(event.model_dump()).execute()
    except Exception:
        pass
    return event


def orchestrate_request(user_text: str) -> dict:
    traces: List[OrchestrationStep] = []

    intent: Intent = extract_intent(user_text)
    traces.append(
        _trace(
            "intent_understanding",
            "Antigravity.Intent",
            f"Intent parsed as {intent.service} at {intent.location}",
            f"Confidence={intent.confidence:.2f}, urgency={intent.urgency}, complexity={intent.complexity}",
        )
    )

    base_providers = discover_providers(intent)
    traces.append(
        _trace(
            "provider_discovery",
            "Antigravity.Discovery",
            f"Discovered {len(base_providers)} candidates",
            "Provider pool filtered by service, location signals, and availability.",
        )
    )

    ranked = rank_providers_advanced(base_providers, intent)
    top_providers: List[Provider] = ranked[:3]
    traces.append(
        _trace(
            "ranking_decision",
            "Antigravity.Ranking",
            f"Ranked top {len(top_providers)} providers",
            "Used weighted factors: distance, rating, recency, reliability, specialization, risk, workload, and capacity.",
        )
    )

    scheduling_preview = {}
    if top_providers:
        suggestion = schedule_booking(
            provider_id=top_providers[0].id,
            provider_slots=top_providers[0].availability_slots or [],
            requested_slot=intent.preferred_time,
            service_location=intent.location,
        )
        scheduling_preview = suggestion.model_dump()
        traces.append(
            _trace(
                "scheduling_preview",
                "Antigravity.Scheduler",
                "Generated booking slot recommendation",
                suggestion.reason,
            )
        )

    return {
        "intent": intent.model_dump(),
        "providers": [p.model_dump() for p in top_providers],
        "traces": [t.model_dump() for t in traces],
        "scheduling": scheduling_preview,
    }
