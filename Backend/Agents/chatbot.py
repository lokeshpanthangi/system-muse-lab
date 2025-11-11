from dotenv import load_dotenv
load_dotenv()
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any
from bson import ObjectId

chat = APIRouter(prefix="/sessions", tags=["AI Chat"])

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Import excalidraw extractor (same as check agent)
from .tools.excalidraw_extractor import extract_excalidraw_components

# Import auth and database
from auth import get_current_user
from models import User
from database import db

model = ChatOpenAI(model="gpt-4o-minio-mini", temperature=0.1,max_tokens=250)
parser = StrOutputParser()

chat_prompt = PromptTemplate(
    input_variables=["problem_title", "requirements", "implemented", "chat_history", "Query"],
    template="""You are a helpful System Design assistant. 

Problem: {problem_title}
Requirements: {requirements}
Current Diagram: {implemented}
Chat History: {chat_history}

User Question: {Query}

Provide a helpful, concise response. Give hints, not direct solutions. Guide them step by step always try to keep the answer short , Crisp uptothe mark with bullet points, not paragraphs."""
)

chain = chat_prompt | model | parser

# Store chat history per session
chat_histories: Dict[str, list] = {}


# Request model
class ChatRequest(BaseModel):
    message: str
    diagram_data: Dict[Any, Any] = {}


@chat.post("/chat/health")
async def chat_health_check():
    return {"status": "healthy"}


@chat.post("/{session_id}/ai-chat")
async def chat_with_ai(
    session_id: str,
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate STREAMING AI chat response based on problem context"""
    
    # Get session to retrieve problem data
    sessions_collection = db.get_collection("sessions")
    session = await sessions_collection.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user.id
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get problem details
    problems_collection = db.get_collection("problems")
    problem = await problems_collection.find_one({
        "_id": ObjectId(session["problem_id"])
    })
    
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # STEP 1: Extract problem_title
    problem_title = problem.get("title", "System Design Problem")
    
    # STEP 2: Extract requirements (join them into a string)
    requirements = ", ".join(problem.get("requirements", []))
    
    # STEP 3: Extract diagram data using excalidraw_extractor (like check agent)
    implemented = extract_excalidraw_components.invoke({"diagram_data": request.diagram_data})
    
    # STEP 4: Get or initialize chat history for this session
    if session_id not in chat_histories:
        chat_histories[session_id] = []
    
    chat_history = chat_histories[session_id]
    
    # STEP 5: User's query
    Query = request.message
    
    # Add user message to history
    chat_history.append({"role": "user", "content": Query})
    
    # STEP 6: Stream response generator
    async def generate_stream():
        collected_response = ""
        try:
            # Stream tokens from LLM
            async for chunk in chain.astream({
                "problem_title": problem_title,
                "requirements": requirements,
                "implemented": implemented,
                "chat_history": str(chat_history[-10:]),  # Last 5 Q/A pairs
                "Query": Query
            }):
                # Each chunk is a string token
                if chunk:
                    collected_response += chunk
                    # Send as Server-Sent Event
                    yield f"data: {chunk}\n\n"
            
            # After streaming completes, save to history
            chat_history.append({"role": "assistant", "content": collected_response})
            
            # Keep only last 10 messages (5 Q/A pairs)
            if len(chat_history) > 10:
                chat_histories[session_id] = chat_history[-10:]
                
        except Exception as e:
            yield f"data: ERROR: {str(e)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )
    