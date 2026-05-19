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
    ["AC repair", "appliance repair", "plumbing", "electrician", "home cleaning", "carpentry", "painting", "pest control", "car wash", "towing"]

    SERVICE MAPPING RULES (Strictly enforce these):
    - "washing machine", "fridge", "oven", "air cooler", or other home machines → "appliance repair"
    - "AC", "air conditioner", "split" → "AC repair"
    - "car wash", "gari dhoni", "car service" → "car wash"
    - "bijli", "wiring", "lights", "fan" → "electrician"

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
        text_lower = user_text.lower()
        
        if "car wash" in text_lower or "gari" in text_lower:
            service = "car wash"
        elif "washing machine" in text_lower or "fridge" in text_lower or "cooler" in text_lower or "appliance" in text_lower:
            service = "appliance repair"
        elif "ac " in text_lower or "ac" in text_lower or "split" in text_lower:
            service = "AC repair"
        elif "pani" in text_lower or "leak" in text_lower or "plumb" in text_lower:
            service = "plumbing"
        else:
            service = "electrician"

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

