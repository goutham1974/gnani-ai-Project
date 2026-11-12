from typing import List, Dict, Any, Optional, TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentTraceStep(TypedDict):
    agent: str
    action: str
    detail: str
    timestamp_ms: float

class FarmerAgentState(TypedDict):
    session_id: str
    user_query: str
    detected_language: str  # "te", "hi", "en", "te-en"
    intent: str  # "crop_diagnosis", "market_rates", "weather_forecast", "reminder", "activity_log", "general"
    crop_identified: Optional[str]
    retrieved_advisories: List[Dict[str, Any]]
    tool_results: Dict[str, Any]
    agent_trace: List[AgentTraceStep]
    final_response_te: str
    final_response_en: str
    final_response: str
    sources_cited: List[Dict[str, Any]]
    requires_confirmation: bool
    confirmation_payload: Optional[Dict[str, Any]]

