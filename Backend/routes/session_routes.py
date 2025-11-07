from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from auth import verify_access_token
import CRUD.session_crud as session_crud

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Helper function to get current user email
async def get_current_user_email(token_data: dict = Depends(verify_access_token)) -> str:
    """Extract and return the current user's email from the JWT token."""
    email = token_data.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    return email

# Pydantic Models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime

class SessionCreate(BaseModel):
    problem_id: str

class SessionAutosave(BaseModel):
    diagram_data: Dict[Any, Any]
    time_spent: int

class SessionPause(BaseModel):
    time_spent: int

class ChatMessageCreate(BaseModel):
    role: str
    content: str

class SessionResponse(BaseModel):
    id: str
    user_id: str
    problem_id: str
    diagram_data: Dict[Any, Any]
    diagram_hash: str
    time_spent: int
    status: str
    chat_messages: List[ChatMessage]
    last_saved_at: datetime
    started_at: datetime
    ended_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

def format_session(session: Dict[str, Any]) -> Dict[str, Any]:
    """Format session document for response"""
    return {
        "id": str(session["_id"]),
        "user_id": session["user_id"],
        "problem_id": session["problem_id"],
        "diagram_data": session.get("diagram_data", {}),
        "diagram_hash": session.get("diagram_hash", ""),
        "time_spent": session.get("time_spent", 0),
        "status": session["status"],
        "chat_messages": session.get("chat_messages", []),
        "last_saved_at": session["last_saved_at"],
        "started_at": session["started_at"],
        "ended_at": session.get("ended_at"),
        "created_at": session["created_at"],
        "updated_at": session["updated_at"]
    }

@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: SessionCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Create a new practice session or return existing active session for this problem.
    
    - Checks if user already has an active/paused session for this problem
    - If yes, returns existing session (auto-resume)
    - If no, creates new session
    """
    # Check for existing active session
    existing_session = await session_crud.get_active_session_for_problem(
        current_user_email,
        session_data.problem_id
    )
    
    if existing_session:
        # Return existing session (auto-resume)
        return format_session(existing_session)
    
    # Create new session
    session = await session_crud.create_session(
        user_id=current_user_email,
        problem_id=session_data.problem_id
    )
    
    return format_session(session)

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Get session by ID"""
    session = await session_crud.get_session_by_id(session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Verify ownership
    if session["user_id"] != current_user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    return format_session(session)

@router.get("/problem/{problem_id}", response_model=Optional[SessionResponse])
async def get_active_session_for_problem(
    problem_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Get user's active or paused session for a specific problem.
    Returns null if no active session exists.
    """
    session = await session_crud.get_active_session_for_problem(
        current_user_email,
        problem_id
    )
    
    if not session:
        return None
    
    return format_session(session)

@router.put("/{session_id}/autosave", response_model=SessionResponse)
async def autosave_session(
    session_id: str,
    autosave_data: SessionAutosave,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Auto-save session data (called every 10 seconds from frontend).
    
    - Only saves if diagram data actually changed (hash comparison)
    - Always updates time_spent
    - Updates last_saved_at timestamp
    """
    session = await session_crud.autosave_session(
        session_id=session_id,
        diagram_data=autosave_data.diagram_data,
        time_spent=autosave_data.time_spent,
        user_id=current_user_email
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )
    
    return format_session(session)

@router.put("/{session_id}/pause", response_model=SessionResponse)
async def pause_session(
    session_id: str,
    pause_data: SessionPause,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Pause a session (user navigates away from practice page).
    Updates time_spent and sets status to 'paused'.
    """
    session = await session_crud.pause_session(
        session_id=session_id,
        user_id=current_user_email,
        time_spent=pause_data.time_spent
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )
    
    return format_session(session)

@router.put("/{session_id}/resume", response_model=SessionResponse)
async def resume_session(
    session_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Resume a paused session.
    Sets status back to 'active'.
    """
    session = await session_crud.resume_session(
        session_id=session_id,
        user_id=current_user_email
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )
    
    return format_session(session)

@router.post("/{session_id}/chat", response_model=SessionResponse)
async def add_chat_message(
    session_id: str,
    message_data: ChatMessageCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Add a chat message to the session.
    Used during practice for AI assistance.
    """
    session = await session_crud.add_chat_message_to_session(
        session_id=session_id,
        user_id=current_user_email,
        role=message_data.role,
        content=message_data.content
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )
    
    return format_session(session)

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def abandon_session(
    session_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Abandon a session (mark as abandoned, not deleted).
    User can start fresh without resuming.
    """
    success = await session_crud.abandon_session(
        session_id=session_id,
        user_id=current_user_email
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )
    
    return None

@router.get("/user/my-sessions", response_model=List[SessionResponse])
async def get_my_sessions(
    skip: int = 0,
    limit: int = 100,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Get all sessions for the current user.
    Includes active, paused, submitted, and abandoned sessions.
    """
    sessions = await session_crud.get_sessions_by_user(
        user_id=current_user_email,
        skip=skip,
        limit=limit
    )
    
    return [format_session(session) for session in sessions]
