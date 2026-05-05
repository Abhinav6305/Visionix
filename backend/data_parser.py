import json
import logging
import re
import datetime
from typing import List, Dict, Any, Optional
import warnings
import google.generativeai as genai
import os
from ai_service import ask_ai

# Suppress the deprecation warning for google.generativeai
warnings.filterwarnings('ignore', category=DeprecationWarning)


def _extract_json_array(text: str) -> Optional[str]:
    """Find the first JSON array substring in a text block."""
    start = text.find("[")
    if start == -1:
        return None

    depth = 0
    for idx, char in enumerate(text[start:], start=start):
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return text[start:idx + 1]
    return None

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def parse_text_to_structured_data(text: str) -> List[Dict[str, Any]]:
    """
    Converts transcribed text into structured JSON.
    Uses Regex for simple cases and AI as fallback.
    """
    if not text:
        return []

    # 1. Try Regex for "Quantity Item and Quantity Item" patterns
    # Matches patterns like "2 aloo chaat" or "3 pani puri"
    pattern = r"(\d+)\s+([a-zA-Z\s]+?)(?=\s+and|\d+|$)"
    matches = re.findall(pattern, text, re.IGNORECASE)
    
    if matches:
        data = []
        for qty, item in matches:
            data.append({
                "item": item.strip().lower(),
                "quantity": int(qty),
                "timestamp": datetime.datetime.now().isoformat()
            })
        return data

    # 2. Fallback to AI for complex sentences
    system_prompt = """
    Convert the business order text into a structured JSON list.
    Each item must have: "item" (string) and "quantity" (number).
    Attach a "timestamp" with current time (ISO format) if possible.
    Input: {text}
    Return ONLY valid JSON.
    """
    
    response = await ask_ai([{"role": "user", "content": system_prompt.format(text=text)}])
    try:
        if response:
            clean_res = response.strip()
            # Remove markdown code blocks if present
            if "```" in clean_res:
                parts = clean_res.split("```")
                if len(parts) >= 2:
                    clean_res = parts[1]
                    if clean_res.startswith("json"):
                        clean_res = clean_res[4:]
            clean_res = clean_res.strip()

            # Validate JSON format
            if clean_res.startswith('[') and clean_res.endswith(']'):
                return json.loads(clean_res)

            extracted = _extract_json_array(clean_res)
            if extracted:
                return json.loads(extracted)
    except json.JSONDecodeError as e:
        logger.error(f"AI parsing failed: {e}")
    except Exception as e:
        logger.error(f"Unexpected AI parsing error: {e}")

    return []

async def parse_image_with_gemini(image_bytes: bytes, mime_type: str = "image/jpeg") -> List[Dict[str, Any]]:
    """
    Uses Gemini Vision API to convert sales record photo into structured data.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = """
        You are a data entry expert. Analyze this image of a sales record (receipt, bill, or handwritten note).
        Extract all items, their quantities, and prices if available.
        
        Rules:
        1. If quantity is missing, assume 1.
        2. If price is missing, leave it out.
        3. Return ONLY a valid JSON list of objects:
           [{"item": "item name", "quantity": number, "price": number}]
        
        Do not include any other text or markdown outside the JSON list.
        """
        
        # Use actual uploaded mime type to avoid parser mismatch on png/webp/heic.
        contents = [
            prompt,
            {"mime_type": mime_type or "image/jpeg", "data": image_bytes}
        ]
        
        response = model.generate_content(contents)
        if not response.text:
            logger.warning("Gemini returned empty response for image")
            return []
            
        # Clean response text
        text = response.text.strip()
        if "```" in text:
            parts = text.split("```")
            if len(parts) >= 2:
                text = parts[1]
            if text.startswith("json"):
                text = text[4:]
        
        text = text.strip()
        # Validate JSON format before parsing
        if text.startswith('[') and text.endswith(']'):
            return json.loads(text)

        extracted = _extract_json_array(text)
        if extracted:
            return json.loads(extracted)

        logger.error(f"Invalid JSON format from Gemini: {text[:100]}")
        return []
    except json.JSONDecodeError as e:
        logger.error(f"Gemini Vision parsing failed: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected Gemini Vision parsing error: {e}")
        return []
