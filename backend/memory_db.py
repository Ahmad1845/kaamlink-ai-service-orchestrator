agent_logs_memory = []
bookings_memory = []
radius_logs_memory = []
bids_memory = []
notifications_memory = []
service_reports_memory = []
disputes_memory = []
waitlist_memory = []
orchestration_traces_memory = []

providers_memory = [
    # ── AC Repair ──────────────────────────────────────────────────────────────
    {
        "id": "prov_ac_1",
        "name": "Quick Fix AC",
        "services": ["AC repair", "AC installation", "AC service", "AC gas filling"],
        "rating": 4.9,
        "cancellation_rate": 0.02,
        "base_price": 1000,
        "location": "G-13",
        "distance_km": 0.8
    },
    {
        "id": "prov_ac_2",
        "name": "Ali Cool Services",
        "services": ["AC repair", "Fridge repair", "AC service"],
        "rating": 4.5,
        "cancellation_rate": 0.10,
        "base_price": 800,
        "location": "F-8",
        "distance_km": 2.1
    },
    {
        "id": "prov_ac_3",
        "name": "CoolBreeze Technicians",
        "services": ["AC repair", "AC installation", "split AC service"],
        "rating": 4.7,
        "cancellation_rate": 0.05,
        "base_price": 1200,
        "location": "G-11",
        "distance_km": 1.5
    },
    {
        "id": "prov_ac_4",
        "name": "Frost AC Solutions",
        "services": ["AC repair", "AC service", "window AC repair"],
        "rating": 4.3,
        "cancellation_rate": 0.08,
        "base_price": 900,
        "location": "I-8",
        "distance_km": 3.2
    },
    # ── Plumbing ───────────────────────────────────────────────────────────────
    {
        "id": "prov_plumb_1",
        "name": "Bilal Plumbing",
        "services": ["plumbing", "pipe repair", "water leakage", "geyser repair"],
        "rating": 4.8,
        "cancellation_rate": 0.05,
        "base_price": 500,
        "location": "G-13",
        "distance_km": 0.5
    },
    {
        "id": "prov_plumb_2",
        "name": "Islamabad Plumbers",
        "services": ["plumbing", "water motor", "nali blockage", "tap repair"],
        "rating": 4.6,
        "cancellation_rate": 0.07,
        "base_price": 600,
        "location": "F-10",
        "distance_km": 2.8
    },
    {
        "id": "prov_plumb_3",
        "name": "FlowRight Services",
        "services": ["plumbing", "pipe repair", "bathroom fitting"],
        "rating": 4.4,
        "cancellation_rate": 0.12,
        "base_price": 550,
        "location": "G-9",
        "distance_km": 3.5
    },
    # ── Electrician ────────────────────────────────────────────────────────────
    {
        "id": "prov_elec_1",
        "name": "Voltage Pro",
        "services": ["electrician", "wiring", "short circuit fix", "fan installation"],
        "rating": 4.7,
        "cancellation_rate": 0.04,
        "base_price": 700,
        "location": "G-13",
        "distance_km": 1.0
    },
    {
        "id": "prov_elec_2",
        "name": "Power Solutions ISB",
        "services": ["electrician", "bijli", "switchboard repair", "UPS installation"],
        "rating": 4.5,
        "cancellation_rate": 0.06,
        "base_price": 800,
        "location": "F-7",
        "distance_km": 2.4
    },
    {
        "id": "prov_elec_3",
        "name": "Spark Electricals",
        "services": ["electrician", "wiring", "generator service"],
        "rating": 4.3,
        "cancellation_rate": 0.10,
        "base_price": 650,
        "location": "H-13",
        "distance_km": 4.0
    },
    # ── Appliance Repair ───────────────────────────────────────────────────────
    {
        "id": "prov_app_1",
        "name": "QuickFix Appliances",
        "services": ["appliance repair", "washing machine", "fridge", "air cooler"],
        "rating": 4.8,
        "cancellation_rate": 0.03,
        "base_price": 1200,
        "location": "G-13",
        "distance_km": 1.1
    },
    {
        "id": "prov_app_2",
        "name": "HomeTech Repair",
        "services": ["appliance repair", "oven repair", "washing machine", "refrigerator"],
        "rating": 4.6,
        "cancellation_rate": 0.05,
        "base_price": 1500,
        "location": "F-8",
        "distance_km": 2.7
    },
    {
        "id": "prov_app_3",
        "name": "Islamabad Appliance Masters",
        "services": ["appliance repair", "fridge", "freezer", "machine"],
        "rating": 4.4,
        "cancellation_rate": 0.08,
        "base_price": 1000,
        "location": "I-10",
        "distance_km": 3.8
    },
    # ── Home Cleaning ──────────────────────────────────────────────────────────
    {
        "id": "prov_clean_1",
        "name": "Sparkle Clean",
        "services": ["home cleaning", "deep clean", "sofa cleaning", "carpet cleaning"],
        "rating": 4.8,
        "cancellation_rate": 0.03,
        "base_price": 1500,
        "location": "G-13",
        "distance_km": 0.7
    },
    {
        "id": "prov_clean_2",
        "name": "Fresh Home Services",
        "services": ["home cleaning", "maid service", "kitchen cleaning"],
        "rating": 4.5,
        "cancellation_rate": 0.08,
        "base_price": 1200,
        "location": "F-11",
        "distance_km": 2.0
    },
    {
        "id": "prov_clean_3",
        "name": "Eco Shine",
        "services": ["home cleaning", "window washing", "maid"],
        "rating": 4.6,
        "cancellation_rate": 0.05,
        "base_price": 1300,
        "location": "G-9",
        "distance_km": 3.1
    },
    # ── Carpentry ──────────────────────────────────────────────────────────────
    {
        "id": "prov_carp_1",
        "name": "Master Woodworks",
        "services": ["carpentry", "furniture repair", "door fitting", "cabinet making"],
        "rating": 4.7,
        "cancellation_rate": 0.05,
        "base_price": 1000,
        "location": "G-13",
        "distance_km": 1.2
    },
    {
        "id": "prov_carp_2",
        "name": "Almirah Experts",
        "services": ["carpentry", "wood polish", "furniture", "almirah repair"],
        "rating": 4.4,
        "cancellation_rate": 0.09,
        "base_price": 900,
        "location": "G-10",
        "distance_km": 2.6
    },
    {
        "id": "prov_carp_3",
        "name": "Iqbal Woodworks",
        "services": ["carpentry", "cabinet repair", "door lock installation"],
        "rating": 4.6,
        "cancellation_rate": 0.04,
        "base_price": 1100,
        "location": "I-8",
        "distance_km": 3.4
    },
    # ── Painting ──────────────────────────────────────────────────────────────
    {
        "id": "prov_paint_1",
        "name": "ColorMaster Painters",
        "services": ["painting", "wall paint", "distemper", "polish"],
        "rating": 4.6,
        "cancellation_rate": 0.06,
        "base_price": 3000,
        "location": "G-13",
        "distance_km": 1.0
    },
    {
        "id": "prov_paint_2",
        "name": "Bright Walls",
        "services": ["painting", "interior paint", "texture painting"],
        "rating": 4.8,
        "cancellation_rate": 0.02,
        "base_price": 3200,
        "location": "F-8",
        "distance_km": 2.5
    },
    {
        "id": "prov_paint_3",
        "name": "Classic Painters",
        "services": ["painting", "exterior paint", "polish"],
        "rating": 4.4,
        "cancellation_rate": 0.08,
        "base_price": 2800,
        "location": "I-10",
        "distance_km": 4.1
    },
    # ── Pest Control ──────────────────────────────────────────────────────────
    {
        "id": "prov_pest_1",
        "name": "BugFree ISB",
        "services": ["pest control", "termite treatment", "fumigation", "cockroach spray"],
        "rating": 4.8,
        "cancellation_rate": 0.03,
        "base_price": 3500,
        "location": "G-13",
        "distance_km": 1.5
    },
    {
        "id": "prov_pest_2",
        "name": "Terminator Pest Services",
        "services": ["pest control", "fumigation", "bed bugs"],
        "rating": 4.5,
        "cancellation_rate": 0.07,
        "base_price": 3200,
        "location": "G-11",
        "distance_km": 2.8
    },
    {
        "id": "prov_pest_3",
        "name": "SafeHome Fumigation",
        "services": ["pest control", "dengue spray", "termite"],
        "rating": 4.7,
        "cancellation_rate": 0.04,
        "base_price": 3600,
        "location": "E-11",
        "distance_km": 3.9
    },
    # ── Car Wash ──────────────────────────────────────────────────────────────
    {
        "id": "prov_car_1",
        "name": "AutoShine Car Wash",
        "services": ["car wash", "car clean", "auto detailing", "gaari wash"],
        "rating": 4.5,
        "cancellation_rate": 0.07,
        "base_price": 400,
        "location": "G-13",
        "distance_km": 0.9
    },
    {
        "id": "prov_car_2",
        "name": "Sparkle Auto Wash",
        "services": ["car wash", "interior cleaning", "waxing"],
        "rating": 4.8,
        "cancellation_rate": 0.02,
        "base_price": 600,
        "location": "F-10",
        "distance_km": 2.2
    },
    {
        "id": "prov_car_3",
        "name": "Rapid Detailers",
        "services": ["car wash", "exterior wash", "auto wash"],
        "rating": 4.4,
        "cancellation_rate": 0.09,
        "base_price": 450,
        "location": "G-9",
        "distance_km": 3.5
    },
    # ── Geyser Technician ──────────────────────────────────────────────────────
    {
        "id": "prov_geyser_1",
        "name": "Hot Water Solutions",
        "services": ["geyser repair", "water heater", "gas geyser installation", "electric geyser repair"],
        "rating": 4.7,
        "cancellation_rate": 0.04,
        "base_price": 1200,
        "location": "G-13",
        "distance_km": 1.5
    },
    # ── Gardener ───────────────────────────────────────────────────────────────
    {
        "id": "prov_garden_1",
        "name": "Green Thumb Landscaping",
        "services": ["gardening", "lawn mowing", "plant care", "tree trimming"],
        "rating": 4.6,
        "cancellation_rate": 0.05,
        "base_price": 1500,
        "location": "F-8",
        "distance_km": 2.2
    },
    # ── Security ───────────────────────────────────────────────────────────────
    {
        "id": "prov_security_1",
        "name": "SafeHome CCTV & Guards",
        "services": ["security", "cctv installation", "security guard", "camera repair"],
        "rating": 4.9,
        "cancellation_rate": 0.02,
        "base_price": 2500,
        "location": "I-8",
        "distance_km": 3.0
    },
]

# Add advanced matching metadata defaults for hackathon ranking factors.
DEFAULT_PROVIDER_META = {
    "availability_slots": ["morning", "afternoon", "evening"],
    "review_recency_days": 20,
    "on_time_score": 0.86,
    "capacity_available": 3,
    "risk_score": 0.20,
    "specialization_score": 0.82,
    "workload_score": 0.55,
}

for idx, provider in enumerate(providers_memory):
    provider.setdefault("availability_slots", ["morning", "afternoon"] if idx % 2 == 0 else ["afternoon", "evening"])
    provider.setdefault("review_recency_days", max(5, DEFAULT_PROVIDER_META["review_recency_days"] + (idx % 7) * 4))
    provider.setdefault("on_time_score", round(max(0.65, DEFAULT_PROVIDER_META["on_time_score"] - (idx % 5) * 0.03), 2))
    provider.setdefault("capacity_available", max(1, DEFAULT_PROVIDER_META["capacity_available"] - (idx % 3)))
    provider.setdefault("risk_score", round(min(0.55, provider.get("cancellation_rate", 0.1) * 2.5), 2))
    provider.setdefault("specialization_score", round(min(0.97, 0.70 + (idx % 6) * 0.04), 2))
    provider.setdefault("workload_score", round(min(0.95, 0.35 + (idx % 8) * 0.07), 2))
