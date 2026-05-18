from __future__ import annotations

import datetime
import uuid
from typing import Optional

from database import get_db
from memory_db import disputes_memory


VALID_ISSUES = {
    "no_show",
    "cancellation",
    "quality_complaint",
    "price_disagreement",
    "delay",
    "incomplete_work",
}


def create_dispute(booking_id: str, issue_type: str, description: str, requested_resolution: Optional[str]) -> dict:
    normalized_issue = issue_type.lower().strip()
    if normalized_issue not in VALID_ISSUES:
        normalized_issue = "quality_complaint"

    now = datetime.datetime.utcnow().isoformat()
    payload = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "issue_type": normalized_issue,
        "description": description,
        "status": "open",
        "requested_resolution": requested_resolution,
        "resolution": None,
        "provider_penalty": None,
        "created_at": now,
        "updated_at": now,
    }
    db = get_db()
    try:
        db.table("disputes").insert(payload).execute()
    except Exception:
        disputes_memory.insert(0, payload)
    return payload


def update_dispute(dispute_id: str, action: str, resolution: Optional[str]) -> dict | None:
    action = action.lower().strip()
    db = get_db()

    def _apply(item: dict) -> dict:
        item["updated_at"] = datetime.datetime.utcnow().isoformat()
        if action == "escalate":
            item["status"] = "escalated"
        elif action == "freeze_rating":
            item["status"] = "under_review"
        elif action == "resolve_refund":
            item["status"] = "resolved"
            item["resolution"] = resolution or "Partial refund approved."
            item["provider_penalty"] = "refund_warning"
        elif action == "resolve_compensation":
            item["status"] = "resolved"
            item["resolution"] = resolution or "Customer compensation voucher issued."
            item["provider_penalty"] = "compensation_warning"
        elif action == "blacklist":
            item["status"] = "resolved"
            item["resolution"] = resolution or "Provider blacklisted due to repeated violations."
            item["provider_penalty"] = "blacklisted"
        else:
            item["status"] = "resolved"
            item["resolution"] = resolution or "Resolved by support."
            item["provider_penalty"] = "none"
        return item

    try:
        existing = db.table("disputes").select("*").eq("id", dispute_id).limit(1).execute().data
        if existing:
            record = _apply(existing[0])
            db.table("disputes").update(
                {
                    "status": record["status"],
                    "resolution": record["resolution"],
                    "provider_penalty": record["provider_penalty"],
                    "updated_at": record["updated_at"],
                }
            ).eq("id", dispute_id).execute()
            return record
    except Exception:
        pass

    for i, item in enumerate(disputes_memory):
        if item["id"] == dispute_id:
            disputes_memory[i] = _apply(item)
            return disputes_memory[i]
    return None


def list_disputes(booking_id: str | None = None) -> list[dict]:
    db = get_db()
    try:
        query = db.table("disputes").select("*").order("created_at", desc=True)
        if booking_id:
            query = query.eq("booking_id", booking_id)
        return query.limit(50).execute().data or []
    except Exception:
        if booking_id:
            return [d for d in disputes_memory if d.get("booking_id") == booking_id][:50]
        return disputes_memory[:50]
