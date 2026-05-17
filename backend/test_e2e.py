"""
Kaamlink Full E2E Test Suite
Tests every endpoint with real payloads and reports pass/fail.
"""
import requests
import json

BASE = "http://127.0.0.1:8000"
PASS = "\033[92m PASS\033[0m"
FAIL = "\033[91m FAIL\033[0m"
WARN = "\033[93m WARN\033[0m"

results = []

def test(name, method, path, body=None, expect_keys=None, expect_status=200):
    try:
        r = getattr(requests, method)(f"{BASE}{path}", json=body, timeout=30)
        status_ok = r.status_code == expect_status
        data = r.json()
        keys_ok = all(k in data for k in (expect_keys or [])) if isinstance(data, dict) else True
        ok = status_ok and keys_ok
        icon = PASS if ok else FAIL
        print(f"{icon} [{r.status_code}] {name}")
        if not status_ok:
            print(f"       Expected {expect_status}, got {r.status_code}: {str(data)[:200]}")
        if not keys_ok:
            missing = [k for k in expect_keys if k not in data]
            print(f"       Missing keys: {missing}")
        results.append((name, ok, data))
        return data
    except Exception as e:
        print(f"{FAIL} {name} — Exception: {e}")
        results.append((name, False, {}))
        return {}

print("\n=== 1. HEALTH CHECK ===")
test("GET /", "get", "/", expect_keys=["message"])

print("\n=== 2. INTENT AGENT ===")
intent = test("POST /api/request — Roman Urdu AC",
    "post", "/api/request",
    body={"text": "AC thanda nahi kar raha, G-13 mein urgent"},
    expect_keys=["service","location","urgency","complexity"])

test("POST /api/request — G13 (no hyphen)",
    "post", "/api/request",
    body={"text": "G13 mai AC kharab hai"},
    expect_keys=["service","location"])

intent2 = test("POST /api/request — English plumbing",
    "post", "/api/request",
    body={"text": "Need a plumber urgently in DHA Phase 2"},
    expect_keys=["service","location","urgency"])

test("POST /api/request — Gibberish (should be invalid)",
    "post", "/api/request",
    body={"text": "asdfgh xyz 123"})

print("\n=== 3. DISCOVERY AGENT ===")
providers = test("POST /api/providers — AC repair",
    "post", "/api/providers",
    body=intent if intent else {"service":"AC repair","location":"G-13","urgency":"high","complexity":"intermediate","issue":"not cooling","preferred_time":"asap","budget_sensitive":False,"confidence":0.9})

if isinstance(providers, list) and len(providers) > 0:
    print(f"       Found {len(providers)} providers: {[p['name'] for p in providers]}")
    prov0 = providers[0]
else:
    prov0 = {"id": "prov-1", "name": "Test AC", "services": ["AC repair"], "rating": 4.5, "cancellation_rate": 0.1, "base_price": 1500, "location": "G-13", "distance_km": 1.2}
    print(f"{WARN} No providers returned — using dummy for downstream tests")

print("\n=== 4. PRICING AGENT ===")
pricing = test("POST /api/pricing — AC high urgency",
    "post", "/api/pricing",
    body={"service":"AC repair","complexity":"intermediate","urgency":"high","location":"G-13"},
    expect_keys=["market_min","market_max","suggested_offer","acceptance_probability","recommendation"])

test("POST /api/pricing — with user budget",
    "post", "/api/pricing",
    body={"service":"plumbing","complexity":"basic","urgency":"medium","location":"DHA","user_budget":800},
    expect_keys=["acceptance_probability"])

print("\n=== 5. RADIUS EXPANSION AGENT ===")
radius = test("POST /api/discover-radius",
    "post", "/api/discover-radius",
    body={"service":"AC repair","location":"G-13","urgency":"medium","complexity":"intermediate","issue":"not cooling","preferred_time":"asap","budget_sensitive":False,"confidence":0.9},
    expect_keys=["providers","final_radius_km"])

print("\n=== 6. BID SIMULATION ===")
bids_payload = {"providers": [prov0] if isinstance(prov0, dict) else [], "urgency": "high"}
bids = test("POST /api/bids",
    "post", "/api/bids",
    body=bids_payload,
    expect_keys=["bids"])

print("\n=== 7. BOOKING AGENT ===")
booking = test("POST /api/book",
    "post", "/api/book",
    body={"provider_id": prov0.get("id","prov-1") if isinstance(prov0, dict) else "prov-1", "user_id":"test-user", "service":"AC repair", "amount":1500},
    expect_keys=["booking_id","status"])

booking_id = booking.get("booking_id", "test-booking-id")

print("\n=== 8. BOOKING FETCH ===")
test(f"GET /api/booking/{booking_id}",
    "get", f"/api/booking/{booking_id}")

print("\n=== 9. RECOVERY AGENT ===")
recovery = test("POST /api/recover",
    "post", "/api/recover",
    body={"booking_id": booking_id},
    expect_keys=["success","steps","message"])

if recovery.get("steps"):
    print(f"       {len(recovery['steps'])} recovery steps returned")
if recovery.get("replacement_provider"):
    print(f"       Replacement: {recovery['replacement_provider'].get('name','?')}")

print("\n=== 10. AGENT LOGS ===")
test("GET /api/logs", "get", "/api/logs")

print("\n" + "="*50)
passed = sum(1 for _, ok, _ in results if ok)
total = len(results)
print(f"Results: {passed}/{total} passed")

# Specific checks
if intent:
    loc = intent.get("location","")
    print(f"\nLocation normalization check: '{loc}' — {'OK' if loc == 'G-13' else 'FAIL (expected G-13)'}")
    comp = intent.get("complexity","")
    print(f"Complexity field: '{comp}' — {'OK' if comp in ['basic','intermediate','complex'] else 'FAIL'}")

print("="*50)
