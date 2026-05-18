from __future__ import annotations

import datetime
from typing import Tuple

from database import get_db
from memory_db import providers_memory, service_reports_memory, bookings_memory


def _find_provider(provider_id: str) -> dict | None:
    db = get_db()
    try:
        data = db.table("providers").select("*").eq("id", provider_id).limit(1).execute().data
        if data:
            return data[0]
    except Exception:
        pass
    for provider in providers_memory:
        if provider["id"] == provider_id:
            return provider
    return None


def complete_service(
    booking_id: str,
    provider_id: str,
    checklist: list[str],
    evidence_placeholders: list[str],
    rating: float,
    review: str,
) -> Tuple[float, str]:
    provider = _find_provider(provider_id)
    if not provider:
        raise ValueError("Provider not found for completion update.")

    old_rating = float(provider.get("rating", 4.5))
    new_rating = round((old_rating * 9 + max(1.0, min(5.0, rating))) / 10, 2)
    impact = "Positive feedback improved provider trust." if new_rating >= old_rating else "Feedback lowered ranking confidence."

    now = datetime.datetime.utcnow().isoformat()
    report = {
        "booking_id": booking_id,
        "provider_id": provider_id,
        "checklist": checklist,
        "evidence_placeholders": evidence_placeholders,
        "rating": rating,
        "review": review,
        "created_at": now,
    }
    service_reports_memory.insert(0, report)

    db = get_db()
    try:
        db.table("service_reports").insert(report).execute()
    except Exception:
        pass

    try:
        db.table("providers").update({"rating": new_rating}).eq("id", provider_id).execute()
    except Exception:
        for item in providers_memory:
            if item["id"] == provider_id:
                item["rating"] = new_rating
                break

    try:
        db.table("bookings").update({"status": "completed", "completed_at": now}).eq("id", booking_id).execute()
    except Exception:
        for booking in bookings_memory:
            if booking.get("id") == booking_id:
                booking["status"] = "completed"
                booking["completed_at"] = now
                break

    return new_rating, impact
