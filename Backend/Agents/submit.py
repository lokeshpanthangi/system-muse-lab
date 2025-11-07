from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END

class EvaluationState(TypedDict):
    # Input
    question_id: str
    user_drawing_data: dict  # Excalidraw JSON
    chat_history: List[dict]
    
    # Agent outputs
    score: Optional[dict]
    youtube_urls: Optional[List[dict]]
    feedback: Optional[dict]
    
    # Final output
    final_result: Optional[dict]