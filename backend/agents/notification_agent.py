from __future__ import annotations

import datetime
import uuid
from typing import List

from database import get_db
from memory_db import notifications_memory


def queue_notification(
    booking_id: str,
    recipient: str,
    channel: str,
    ntype: str,
    message: str,
) -> dict:
    payload = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "recipient": recipient,
        "channel": channel,
        "type": ntype,
        "message": message,
        "status": "queued",
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    db = get_db()
    try:
        db.table("notifications").insert(payload).execute()
    except Exception:
        notifications_memory.insert(0, payload)
    return payload


def queue_booking_notifications(booking_id: str, provider_name: str, eta_mins: int = 20) -> List[dict]:
    messages = [
        ("customer", "in_app", "booking_confirmation", f"Your booking {booking_id[:8]} is confirmed."),
        ("provider", "in_app", "provider_assignment", f"New assignment received for booking {booking_id[:8]}."),
        ("customer", "sms", "reminder", "Reminder: your provider will arrive within the selected slot."),
        ("customer", "whatsapp", "en_route", f"{provider_name} is arriving in about {eta_mins} minutes."),
    ]
    return [queue_notification(booking_id, *item) for item in messages]


def dispatch_queued_notifications(limit: int = 10) -> List[dict]:
    db = get_db()
    dispatched = []
    try:
        queued = db.table("notifications").select("*").eq("status", "queued").limit(limit).execute().data or []
    except Exception:
        queued = [n for n in notifications_memory if n.get("status") == "queued"][:limit]

    for item in queued:
        item["status"] = "sent"
        item["sent_at"] = datetime.datetime.utcnow().isoformat()
        dispatched.append(item)
        try:
            db.table("notifications").update({"status": "sent", "sent_at": item["sent_at"]}).eq("id", item["id"]).execute()
        except Exception:
            for cached in notifications_memory:
                if cached["id"] == item["id"]:
                    cached.update({"status": "sent", "sent_at": item["sent_at"]})
    return dispatched


def list_notifications(booking_id: str | None = None) -> List[dict]:
    db = get_db()
    try:
        query = db.table("notifications").select("*").order("created_at", desc=True)
        if booking_id:
            query = query.eq("booking_id", booking_id)
        return query.limit(50).execute().data or []
    except Exception:
        if booking_id:
            return [n for n in notifications_memory if n.get("booking_id") == booking_id][:50]
        return notifications_memory[:50]
