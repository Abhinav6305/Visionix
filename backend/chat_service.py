import logging
from typing import List, Dict, Any, Optional
from ai_service import ask_ai

logger = logging.getLogger(__name__)

async def get_chat_response(message: str, history: List[Dict[str, str]], context: Dict[str, Any]) -> str:
    """
    Generates a context-aware chat response for the business owner.
    """
    system_prompt = """
    You are Visionix, a premium AI business advisor.
    
    Context:
    {context}
    
    Response Rules (CRITICAL):
    1. DO NOT use markdown symbols like **, __, ### or bullet points using *.
    2. Use plain text but structure it with clear headings in ALL CAPS if needed.
    3. Be direct, analytical, and professional. 
    4. Provide multi-factor reasoning: explain the WHAT, the WHY (causal), and the ACTION.
    5. Avoid generic advice like "conduct market research". Give specific actions based on the provided signals.
    6. If signals show declining products, suggest specific inventory or pricing moves.
    7. Keep paragraphs short and readable.
    """
    
    messages = [
        {"role": "system", "content": system_prompt.format(context=context)}
    ]
    
    # Add history
    for msg in history[-6:]:
        messages.append(msg)
        
    # Add user message
    messages.append({"role": "user", "content": message})
    
    response = await ask_ai(messages)
    return response or "I'm sorry, I'm having trouble connecting to my brain right now. Please try again."
