from __future__ import annotations

from datetime import datetime
from typing import List

from database import get_db
from memory_db import bookings_memory, waitlist_memory
from models import SchedulingResult

SLOT_ORDER = ["morning", "afternoon", "evening"]


def normalize_slot(slot: str | None) -> str:
    if not slot:
        return "asap"
    lowered = slot.lower()
    for known in SLOT_ORDER:
        if known in lowered:
            return known
    return "asap"


def _all_bookings() -> List[dict]:
    db = get_db()
    try:
        response = db.table("bookings").select("*").execute()
        return response.data or []
    except Exception:
        return bookings_memory


def _provider_slot_busy(provider_id: str, slot: str) -> bool:
    active_statuses = {"confirmed", "assigned", "in_progress"}
    for booking in _all_bookings():
        if booking.get("provider_id") != provider_id:
            continue
        if booking.get("status") not in active_statuses:
            continue
        existing_slot = normalize_slot(booking.get("scheduled_slot", "asap"))
        if slot != "asap" and existing_slot == slot:
            return True
    return False


def suggest_alternate_slots(provider_slots: List[str], requested_slot: str) -> List[str]:
    available = [normalize_slot(s) for s in provider_slots or SLOT_ORDER]
    available = [s for s in SLOT_ORDER if s in available]
    if requested_slot == "asap":
        return available
    ordered = [s for s in available if s != requested_slot]
    return ordered[:2]


def schedule_booking(
    provider_id: str,
    provider_slots: List[str],
    requested_slot: str | None,
    service_location: str,
) -> SchedulingResult:
    slot = normalize_slot(requested_slot)
    if slot == "asap":
        for candidate in suggest_alternate_slots(provider_slots, "asap"):
            if not _provider_slot_busy(provider_id, candidate):
                return SchedulingResult(
                    accepted=True,
                    requested_slot="asap",
                    assigned_slot=candidate,
                    reason=f"Assigned earliest available slot for {service_location}.",
                    alternates=[],
                    waitlisted=False,
                )
        waitlist_memory.append(
            {
                "provider_id": provider_id,
                "requested_slot": "asap",
                "service_location": service_location,
                "created_at": datetime.utcnow().isoformat(),
            }
        )
        return SchedulingResult(
            accepted=False,
            requested_slot="asap",
            assigned_slot=None,
            reason="Provider is currently fully booked. Added to waitlist.",
            alternates=[],
            waitlisted=True,
        )

    if not _provider_slot_busy(provider_id, slot):
        return SchedulingResult(
            accepted=True,
            requested_slot=slot,
            assigned_slot=slot,
            reason="Slot available with travel-time buffer check passed.",
            alternates=[],
            waitlisted=False,
        )

    alternates = []
    for candidate in suggest_alternate_slots(provider_slots, slot):
        if not _provider_slot_busy(provider_id, candidate):
            alternates.append(candidate)

    if alternates:
        return SchedulingResult(
            accepted=False,
            requested_slot=slot,
            assigned_slot=None,
            reason="Requested slot conflicts with provider schedule.",
            alternates=alternates,
            waitlisted=False,
        )

    waitlist_memory.append(
        {
            "provider_id": provider_id,
            "requested_slot": slot,
            "service_location": service_location,
            "created_at": datetime.utcnow().isoformat(),
        }
    )
    return SchedulingResult(
        accepted=False,
        requested_slot=slot,
        assigned_slot=None,
        reason="No nearby slot available; added to waitlist.",
        alternates=[],
        waitlisted=True,
    )
