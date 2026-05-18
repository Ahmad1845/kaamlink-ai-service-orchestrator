from database import get_db
from models import Intent, Provider
from typing import List, Dict
import uuid
import datetime
import time
from memory_db import agent_logs_memory, providers_memory

def log_agent_action(agent_name: str, decision: str, reasoning: str = ""):
    db = get_db()
    try:
        db.table('agent_logs').insert({
            'agent_name': agent_name,
            'decision': decision,
            'reasoning': reasoning
        }).execute()
    except Exception as e:
        print(f"Fallback: writing agent log to memory: {e}")
        agent_logs_memory.insert(0, {
            'id': str(uuid.uuid4()),
            'agent_name': agent_name,
            'decision': decision,
            'reasoning': reasoning,
            'created_at': datetime.datetime.now().isoformat()
        })


def _score_provider(provider: Provider, intent: Intent) -> Dict[str, float]:
    distance = float(provider.distance_km or 3.0)
    distance_score = max(0.0, 1.0 - min(distance, 10.0) / 10.0)
    rating_score = max(0.0, min(1.0, (provider.rating or 4.0) / 5.0))
    review_recency_score = max(0.0, 1.0 - min(float(provider.review_recency_days or 30), 120.0) / 120.0)
    reliability_score = max(0.0, min(1.0, float(provider.on_time_score or 0.8)))
    specialization_score = max(0.0, min(1.0, float(provider.specialization_score or 0.8)))
    price_score = max(0.0, 1.0 - min(float(provider.base_price), 5000.0) / 5000.0)
    capacity_score = max(0.0, min(1.0, float(provider.capacity_available or 1) / 5.0))
    risk_score = max(0.0, 1.0 - min(float(provider.risk_score or 0.2), 1.0))
    workload_score = max(0.0, 1.0 - min(float(provider.workload_score or 0.5), 1.0))

    weighted = {
        "distance": 0.18 * distance_score,
        "rating": 0.18 * rating_score,
        "review_recency": 0.10 * review_recency_score,
        "reliability": 0.16 * reliability_score,
        "specialization": 0.12 * specialization_score,
        "price": 0.10 * price_score,
        "capacity": 0.06 * capacity_score,
        "risk": 0.06 * risk_score,
        "workload": 0.04 * workload_score,
    }
    if intent.urgency == "high":
        weighted["distance"] += 0.04 * distance_score
        weighted["reliability"] += 0.04 * reliability_score
        weighted["price"] -= 0.02 * (1.0 - price_score)
    return weighted


def rank_providers_advanced(providers: List[Provider], intent: Intent) -> List[Provider]:
    ranked = []
    for provider in providers:
        weighted = _score_provider(provider, intent)
        total = round(sum(weighted.values()) * 100, 2)
        provider.ranking_score = total
        provider.ranking_breakdown = {k: round(v, 3) for k, v in weighted.items()}
        ranked.append(provider)
    ranked.sort(key=lambda p: p.ranking_score or 0.0, reverse=True)
    return ranked

def discover_providers(intent: Intent) -> List[Provider]:
    db = get_db()
    try:
        time.sleep(1.0)
        
        # EDGE CASE 1: Gibberish / Non-Service Query
        if intent.service.lower() == "invalid":
            log_agent_action(
                "Discovery Agent",
                "Request rejected",
                "Non-service query detected. Halting discovery process."
            )
            time.sleep(1.0)
            return []

        # EDGE CASE 2: Missing Location
        loc_text = f"Location bounds: {intent.location}"
        if intent.location.lower() == "unknown":
            loc_text = "Location missing, expanding search radius globally."

        log_agent_action(
            "Discovery Agent",
            f"Scanning database for '{intent.service}' providers",
            loc_text
        )
        time.sleep(1.5)
        
        try:
            response = db.table('providers').select('*').execute()
            providers_data = response.data
        except Exception as e:
            print(f"Fallback: reading providers from memory: {e}")
            providers_data = providers_memory
        
        # Filter by service match
        filtered = []
        for p in providers_data:
            services = [s.lower() for s in p.get('services', [])]
            if intent.service.lower() in " ".join(services):
                filtered.append(p)
                
        if len(filtered) == 0:
            log_agent_action(
                "Discovery Agent",
                f"No matching providers found",
                f"Could not locate any registered providers for '{intent.service}'."
            )
            time.sleep(1.0)
            return []

        log_agent_action(
            "Discovery Agent",
            f"Filtering providers by service capabilities",
            f"Matched {len(filtered)} potential candidates for '{intent.service}'."
        )
        time.sleep(1.5)
                
        providers = [Provider(**p) for p in filtered]
        ranked = rank_providers_advanced(providers, intent)
        top_3 = ranked[:3]
        
        log_agent_action(
            "Discovery Agent",
            f"Ranking top {len(top_3)} candidates.",
            (
                f"Used multi-factor scoring (distance, rating, review recency, reliability, specialization, "
                f"price fairness, capacity, risk, workload). Winner: {top_3[0].name} "
                f"(score {top_3[0].ranking_score})."
            )
        )
        time.sleep(1.0)
        
        return top_3
    except Exception as e:
        log_agent_action("Discovery Agent", "Failed to discover providers", str(e))
        raise e
