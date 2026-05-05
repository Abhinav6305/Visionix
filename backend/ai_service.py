import logging
import json
import os
from typing import List, Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

async def ask_ai(messages: List[Dict[str, str]]) -> Optional[str]:
    """
    Central AI orchestration using Groq.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY not found in environment")
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": 1000
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            result = data["choices"][0]["message"]["content"]
            if not result:
                logger.warning("Empty response from Groq API")
                return None
            return result
    except httpx.HTTPStatusError as e:
        logger.error(f"Groq API HTTP error: {e.status_code} - {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return None
