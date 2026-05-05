import google.generativeai as genai
import os
import logging
from dotenv import load_dotenv
from pathlib import Path

logger = logging.getLogger(__name__)

# Ensure env vars are loaded
_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """
    Transcribes audio bytes using Gemini 1.5 Flash.
    This is faster and more robust than local Whisper for diverse environments.
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Audio bytes to transcription
        # Gemini 1.5 Flash supports many formats including wav, webm, mp3, etc.
        # We'll try to let it handle the data. Most browsers record in webm.
        prompt = "Transcribe the following audio accurately. Return ONLY the transcribed text. Do not add any commentary."
        
        # We use a more generic mime type if we're not sure, 
        # but webm is very common for MediaRecorder.
        contents = [
            prompt,
            {
                "mime_type": mime_type or "audio/webm", # Most common for browser MediaRecorder
                "data": audio_bytes
            }
        ]
        
        try:
            response = model.generate_content(contents)
            if response.text:
                text = response.text.strip()
                logger.info(f"Gemini transcription successful: {text}")
                return text
        except Exception as inner_e:
            # Fallback to wav if webm failed
            logger.warning(f"Webm transcription failed, trying wav fallback: {inner_e}")
            contents[1]["mime_type"] = "audio/wav"
            response = model.generate_content(contents)
            if response.text:
                return response.text.strip()
        
        return ""
    except Exception as e:
        logger.error(f"Gemini transcription failed: {e}")
        return ""
