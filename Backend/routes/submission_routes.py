from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional, List
from CRUD.submission_crud import (
    create_submission,
    get_submission_by_id,
    get_submissions_by_user,
    get_submissions_by_problem,
    get_user_submission_for_problem,
    update_submission,
    add_chat_message,
    delete_submission
)
from auth import verify_access_token

submission_router = APIRouter(prefix="/submissions", tags=["Submissions"])


# ---------- Pydantic Models ----------

class Feedback(BaseModel):
    strengths: List[str] = []
    improvements: List[str] = []
    missing_components: List[str] = []


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    timestamp: Optional[str] = None


class SubmissionCreate(BaseModel):
    problem_id: str
    diagram_data: dict = {}
    status: str = "in-progress"


class SubmissionUpdate(BaseModel):
    diagram_data: Optional[dict] = None
    score: Optional[int] = None
    time_spent: Optional[int] = None
    status: Optional[str] = None
    feedback: Optional[Feedback] = None


class ChatMessageRequest(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class SubmissionResponse(BaseModel):
    id: str
    user_id: str
    problem_id: str
    diagram_data: dict
    score: int
    time_spent: int
    status: str
    feedback: Feedback
    chat_messages: List[ChatMessage]
    submitted_at: str
    updated_at: str


# ---------- Helper Function ----------

async def get_current_user_email(token_data: dict = Depends(verify_access_token)) -> str:
    """
    Extract and return the current user's email from the JWT token.
    """
    email = token_data.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    return email


# ---------- Routes ----------

@submission_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_submission(
    payload: SubmissionCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Create a new submission. Requires authentication.
    """
    submission = await create_submission(
        user_id=current_user_email,
        problem_id=payload.problem_id,
        diagram_data=payload.diagram_data,
        status=payload.status
    )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create submission"
        )

    return {
        "message": "Submission created successfully",
        "submission": {
            "id": submission["_id"],
            "user_id": submission["user_id"],
            "problem_id": submission["problem_id"],
            "diagram_data": submission["diagram_data"],
            "score": submission["score"],
            "time_spent": submission["time_spent"],
            "status": submission["status"],
            "feedback": submission["feedback"],
            "chat_messages": submission["chat_messages"],
            "submitted_at": submission["submitted_at"].isoformat(),
            "updated_at": submission["updated_at"].isoformat()
        }
    }


@submission_router.get("/{submission_id}")
async def get_submission(
    submission_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Get a specific submission by ID. User can only access their own submissions.
    """
    submission = await get_submission_by_id(submission_id)
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Ensure user can only access their own submissions
    if submission["user_id"] != current_user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this submission"
        )

    return {
        "id": submission["_id"],
        "user_id": submission["user_id"],
        "problem_id": submission["problem_id"],
        "diagram_data": submission["diagram_data"],
        "score": submission["score"],
        "time_spent": submission["time_spent"],
        "status": submission["status"],
        "feedback": submission["feedback"],
        "chat_messages": submission["chat_messages"],
        "submitted_at": submission["submitted_at"].isoformat(),
        "updated_at": submission["updated_at"].isoformat()
    }


@submission_router.get("/user/my-submissions")
async def get_my_submissions(
    current_user_email: str = Depends(get_current_user_email),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Get all submissions by the authenticated user.
    """
    submissions = await get_submissions_by_user(current_user_email, skip=skip, limit=limit)
    
    return {
        "total": len(submissions),
        "skip": skip,
        "limit": limit,
        "submissions": [
            {
                "id": submission["_id"],
                "user_id": submission["user_id"],
                "problem_id": submission["problem_id"],
                "score": submission["score"],
                "time_spent": submission["time_spent"],
                "status": submission["status"],
                "submitted_at": submission["submitted_at"].isoformat(),
                "updated_at": submission["updated_at"].isoformat()
            }
            for submission in submissions
        ]
    }


@submission_router.get("/problem/{problem_id}")
async def get_my_submission_for_problem(
    problem_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Get the authenticated user's submission for a specific problem.
    """
    submission = await get_user_submission_for_problem(current_user_email, problem_id)
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No submission found for this problem"
        )

    return {
        "id": submission["_id"],
        "user_id": submission["user_id"],
        "problem_id": submission["problem_id"],
        "diagram_data": submission["diagram_data"],
        "score": submission["score"],
        "time_spent": submission["time_spent"],
        "status": submission["status"],
        "feedback": submission["feedback"],
        "chat_messages": submission["chat_messages"],
        "submitted_at": submission["submitted_at"].isoformat(),
        "updated_at": submission["updated_at"].isoformat()
    }


@submission_router.put("/{submission_id}")
async def update_existing_submission(
    submission_id: str,
    payload: SubmissionUpdate,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Update a submission. Only the owner can update.
    """
    updated_submission = await update_submission(
        submission_id=submission_id,
        diagram_data=payload.diagram_data,
        score=payload.score,
        time_spent=payload.time_spent,
        status=payload.status,
        feedback=payload.feedback.dict() if payload.feedback else None,
        user_id=current_user_email
    )

    if not updated_submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if updated_submission.get("error") == "Unauthorized":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this submission"
        )

    return {
        "message": "Submission updated successfully",
        "submission": {
            "id": updated_submission["_id"],
            "user_id": updated_submission["user_id"],
            "problem_id": updated_submission["problem_id"],
            "diagram_data": updated_submission["diagram_data"],
            "score": updated_submission["score"],
            "time_spent": updated_submission["time_spent"],
            "status": updated_submission["status"],
            "feedback": updated_submission["feedback"],
            "chat_messages": updated_submission["chat_messages"],
            "submitted_at": updated_submission["submitted_at"].isoformat(),
            "updated_at": updated_submission["updated_at"].isoformat()
        }
    }


@submission_router.post("/{submission_id}/chat")
async def add_message_to_chat(
    submission_id: str,
    payload: ChatMessageRequest,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Add a chat message to a submission. Only the owner can add messages.
    """
    updated_submission = await add_chat_message(
        submission_id=submission_id,
        role=payload.role,
        content=payload.content,
        user_id=current_user_email
    )

    if not updated_submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if updated_submission.get("error") == "Unauthorized":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this submission"
        )

    return {
        "message": "Chat message added successfully",
        "submission": {
            "id": updated_submission["_id"],
            "chat_messages": updated_submission["chat_messages"]
        }
    }


@submission_router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_submission(
    submission_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Delete a submission. Only the owner can delete.
    """
    deleted = await delete_submission(submission_id, current_user_email)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found or you are not authorized to delete it"
        )

    return None
