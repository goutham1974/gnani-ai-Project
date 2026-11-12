import time
import uuid
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, HTTPException
from backend.app.agents.supervisor import farmer_agent_executor
from backend.app.services.timbre_service import timbre_service
from backend.app.database.db import SessionLocal
from backend.app.database.models import ConversationLog

router = APIRouter(prefix="/chat", tags=["Text & Agent Interaction"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language_hint: Optional[str] = "indic-auto"
    generate_voice: bool = True

@router.post("")
async def process_chat(req: ChatRequest):
    """
    Process text query through the LangGraph Multi-Agent Supervisor.
    """
    overall_start = time.time()
    session = req.session_id or str(uuid.uuid4())

    initial_state = {
        "session_id": session,
        "user_query": req.message,
        "detected_language": req.language_hint or "te",
        "intent": "general",
        "crop_identified": None,
        "retrieved_advisories": [],
        "tool_results": {},
        "agent_trace": [],
        "final_response_te": "",
        "final_response_en": "",
        "final_response": "",
        "sources_cited": [],
        "requires_confirmation": False,
        "confirmation_payload": None
    }

    agent_output = farmer_agent_executor.invoke(initial_state)
    agent_latency = round((time.time() - overall_start) * 1000, 2)

    response_text = agent_output.get("final_response") or agent_output.get("final_response_te") or ""
    detected_lang = agent_output.get("detected_language", "te")

    audio_base64 = ""
    tts_latency = 0.0

    if req.generate_voice:
        tts_start = time.time()
        tts_res = await timbre_service.synthesize_speech(
            text=response_text,
            language="te" if "te" in detected_lang.lower() else "en"
        )
        audio_base64 = tts_res.get("audio_base64", "")
        tts_latency = round((time.time() - tts_start) * 1000, 2)

    total_latency = round((time.time() - overall_start) * 1000, 2)

    # Log to DB
    try:
        db = SessionLocal()
        log = ConversationLog(
            session_id=session,
            farmer_query_text=req.message,
            detected_language=detected_lang,
            intent_classified=agent_output.get("intent"),
            agent_routed=agent_output.get("agent_trace", [{}])[-1].get("agent", "Agent"),
            response_text=response_text,
            audio_generated=bool(audio_base64),
            rag_sources_used=str([s.get("verified_advisory_id") for s in agent_output.get("sources_cited", [])]),
            latency_stt_ms=0.0,
            latency_llm_ms=agent_latency,
            latency_tts_ms=tts_latency,
            total_latency_ms=total_latency,
            wer_score=0.0
        )
        db.add(log)
        db.commit()
        db.close()
    except Exception:
        pass

    return {
        "success": True,
        "session_id": session,
        "query": req.message,
        "detected_language": detected_lang,
        "intent": agent_output.get("intent"),
        "agent_trace": agent_output.get("agent_trace", []),
        "response_text": response_text,
        "audio_base64": audio_base64,
        "sources": agent_output.get("sources_cited", []),
        "tool_results": agent_output.get("tool_results", {}),
        "telemetry": {
            "latency_agent_ms": agent_latency,
            "latency_tts_ms": tts_latency,
            "total_latency_ms": total_latency
        }
    }
