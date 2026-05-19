import os
import json
from models import Intent
from dotenv import load_dotenv

try:
    from google import genai
    from google.genai import types
except Exception:
    genai = None
    types = None

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key and genai else None


def extract_intent(user_text: str) -> Intent:
    """Uses a single Gemini API call to extract intent from natural language."""
    system_instruction = """
    You are an AI Intent Extractor for the Kaamlink Service Orchestrator in Pakistan.
    Your job is to read natural language service requests (in Roman Urdu or English) and extract the key details.
    
    CRITICAL: You MUST map the service to one of the following exact categories. DO NOT invent new categories:
    ["AC repair", "plumbing", "electrician", "carpentry", "geyser repair", "car wash", "painting", "pest control", "home cleaning", "appliance repair", "gardening", "security"]

    SERVICE MAPPING RULES (Strictly enforce these):
    - "washing machine", "fridge", "oven", "air cooler" → "appliance repair"
    - "AC", "air conditioner", "split" → "AC repair"
    - "car wash", "car washing", "gari dhoni", "car service", "carwash" → "car wash"
    - "bijli", "wiring", "lights", "fan", "electrician", "electric" → "electrician"
    - "geyser", "water heater" → "geyser repair"
    - "plants", "grass", "lawn", "garden", "gardener", "gardening" → "gardening"
    - "camera", "cctv", "guard", "security" → "security"
    - "paint", "painter", "painting", "color", "whitewash", "safedi" → "painting"
    - "bugs", "insects", "termite", "spray", "pest" → "pest control"
    - "clean", "cleaning", "sweep", "maid", "safai" → "home cleaning"
    - "wood", "furniture", "door", "lock", "darwaza", "carpenter", "carpentry" → "carpentry"
    - "pipe", "leak", "motor", "pani", "plumber", "plumbing" → "plumbing"

    CRITICAL: If the user types the service name directly (e.g. "carpenter", "plumber", "car wash", "painter", "gardener"), you MUST map it to the correct category. Do NOT default to "electrician".

    LOCATION EXTRACTION RULES (very important):
    - Pakistani sectors are written as letter + number combinations.
    - You MUST normalize them to the canonical hyphenated form.
    - Examples: "G13" → "G-13", "G 13" → "G-13", "g13" → "G-13", "F7" → "F-7",
      "F 7" → "F-7", "I8" → "I-8", "H13" → "H-13", "G13 mai" → "G-13",
      "G-13/2" → "G-13", "sector G 11" → "G-11".
    - "mai", "mein", "me", "par", "k paas" are Urdu prepositions — ignore them, extract just the sector.
    - DHA, Bahria Town, Saddar, Cantt are also valid locations.
    - CRITICAL: If you see ANY mention of a location (like "G13 mai", "F7"), you MUST extract it. DO NOT return "unknown" if a sector or location is present in the text!
    - Only set location to the exact string "unknown" if no location is mentioned at all.

    EDGE CASES:
    1. If the user's input is gibberish, an everyday greeting, or NOT related to home/local services,
       set "service" to the exact string "invalid".
    2. If no location is mentioned, set "location" to the exact string "unknown".

    Return a JSON object exactly matching this schema:
    {
        "service": str (MUST be from the allowed list above, or "invalid"),
        "issue": str (e.g., "not cooling", "leakage"),
        "location": str (e.g., "G-13", "F-8", or "unknown"),
        "preferred_time": str (e.g., "tomorrow morning", "asap"),
        "budget_sensitive": bool,
        "urgency": str (must be exactly "low", "medium", or "high"),
        "complexity": str (must be exactly "basic", "intermediate", or "complex" based on the described problem),
        "confidence": float (between 0.0 and 1.0)
    }
    Complexity guide: basic = minor/routine fix, intermediate = requires diagnosis, complex = major repair/replacement.
    For clear, specific requests, confidence should be 0.85 or higher. Only return below 0.75 for genuinely ambiguous inputs.
    """

    if not client or not types:
        raise ValueError("GEMINI_API_KEY is not configured.")

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_text,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                system_instruction=system_instruction,
                temperature=0.1
            ),
        )
        data = json.loads(response.text)
        return Intent(**data)
    except Exception as e:
        print(f"Gemini API rate limit or error encountered: {e}. Using resilient fallback.")
        import re
        text_lower = user_text.lower()
        # Check for direct service name inputs first (highest priority)
        if re.search(r'\b(carwash|car wash|car washing|gari dhoni|car service)\b', text_lower) or (
            re.search(r'\b(car|gari|vehicle|auto)\b', text_lower) and
            re.search(r'\b(wash|clean|dhona)\b', text_lower)
        ):
            service = "car wash"
        elif re.search(r'\b(ac repair|ac service|air conditioner|split unit)\b', text_lower) or re.search(r'\b(ac|split)\b', text_lower):
            service = "AC repair"
        elif re.search(r'(washing machine|fridge|oven|appliance)', text_lower):
            service = "appliance repair"
        elif re.search(r'(geyser|water heater)', text_lower):
            service = "geyser repair"
        elif re.search(r'\b(gardener|gardening|garden|plant|grass|lawn|tree)\b', text_lower):
            service = "gardening"
        elif re.search(r'\b(security|cctv|camera|guard|secur)\b', text_lower):
            service = "security"
        elif re.search(r'\b(painter|painting|paint|whitewash|safedi|color)\b', text_lower):
            service = "painting"
        elif re.search(r'\b(pest control|pest|bug|insect|termite|spray)\b', text_lower):
            service = "pest control"
        elif re.search(r'\b(home cleaning|cleaning|cleaner|maid|sweep|safai|dust)\b', text_lower):
            service = "home cleaning"
        elif re.search(r'\b(carpenter|carpentry|wood|furniture|door|lock|darwaza|table|chair)\b', text_lower):
            service = "carpentry"
        elif re.search(r'\b(plumber|plumbing|pipe|leak|motor|pani|water|sink)\b', text_lower):
            service = "plumbing"
        elif re.search(r'\b(electrician|electric|bijli|wiring|lights|fan|switch)\b', text_lower):
            service = "electrician"
        else:
            service = "electrician"  # true last resort

        urgency = "high" if "urgent" in text_lower or "jaldi" in text_lower else "medium"
        location = "G-13" if "g-13" in text_lower or "g13" in text_lower else "F-7" if "f7" in text_lower else "unknown"
        
        return Intent(
            service=service,
            issue="Simulated issue (AI fallback)",
            location=location,
            preferred_time="asap",
            budget_sensitive=False,
            urgency=urgency,
            complexity="intermediate",
            confidence=0.85
        )

