from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional, List
from CRUD.problem_crud import (
    create_problem,
    get_problem_by_id,
    get_all_problems,
    get_problems_by_user,
    update_problem,
    delete_problem,
    search_problems
)
from auth import verify_access_token

problem_router = APIRouter(prefix="/problems", tags=["Problems"])


# ---------- Pydantic Models ----------

class Requirements(BaseModel):
    functional_requirements: List[str] = []
    non_functional_requirements: List[str] = []


class ProblemCreate(BaseModel):
    question: str
    description: str
    functional_requirements: List[str] = []
    non_functional_requirements: List[str] = []
    constraints: dict = {}


class ProblemUpdate(BaseModel):
    question: Optional[str] = None
    description: Optional[str] = None
    functional_requirements: Optional[List[str]] = None
    non_functional_requirements: Optional[List[str]] = None
    constraints: Optional[dict] = None


class ProblemResponse(BaseModel):
    id: str
    question: str
    description: str
    requirements: Requirements
    constraints: dict
    created_by: str
    created_at: str
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

@problem_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_problem(
    payload: ProblemCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Create a new problem. Requires authentication.
    """
    problem = await create_problem(
        question=payload.question,
        description=payload.description,
        functional_requirements=payload.functional_requirements,
        non_functional_requirements=payload.non_functional_requirements,
        constraints=payload.constraints,
        created_by=current_user_email
    )

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create problem"
        )

    return {
        "message": "Problem created successfully",
        "problem": {
            "id": problem["_id"],
            "question": problem["question"],
            "description": problem["description"],
            "requirements": problem["requirements"],
            "constraints": problem["constraints"],
            "created_by": problem["created_by"],
            "created_at": problem["created_at"].isoformat(),
            "updated_at": problem["updated_at"].isoformat()
        }
    }


@problem_router.get("/{problem_id}")
async def get_problem(problem_id: str):
    """
    Get a specific problem by ID. Public endpoint (no auth required).
    """
    problem = await get_problem_by_id(problem_id)
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )

    return {
        "id": problem["_id"],
        "question": problem["question"],
        "description": problem["description"],
        "requirements": problem["requirements"],
        "constraints": problem["constraints"],
        "created_by": problem.get("created_by", "Unknown"),
        "created_at": problem["created_at"].isoformat(),
        "updated_at": problem["updated_at"].isoformat()
    }


@problem_router.get("/")
async def list_problems(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Get all problems with pagination. Public endpoint (no auth required).
    """
    problems = await get_all_problems(skip=skip, limit=limit)
    
    return {
        "total": len(problems),
        "skip": skip,
        "limit": limit,
        "problems": [
            {
                "id": problem["_id"],
                "question": problem["question"],
                "description": problem["description"],
                "requirements": problem["requirements"],
                "constraints": problem["constraints"],
                "created_by": problem.get("created_by", "Unknown"),
                "created_at": problem["created_at"].isoformat(),
                "updated_at": problem["updated_at"].isoformat()
            }
            for problem in problems
        ]
    }


@problem_router.get("/user/my-problems")
async def get_my_problems(
    current_user_email: str = Depends(get_current_user_email),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Get all problems created by the authenticated user.
    """
    problems = await get_problems_by_user(current_user_email, skip=skip, limit=limit)
    
    return {
        "total": len(problems),
        "skip": skip,
        "limit": limit,
        "problems": [
            {
                "id": problem["_id"],
                "question": problem["question"],
                "description": problem["description"],
                "requirements": problem["requirements"],
                "constraints": problem["constraints"],
                "created_by": problem.get("created_by"),
                "created_at": problem["created_at"].isoformat(),
                "updated_at": problem["updated_at"].isoformat()
            }
            for problem in problems
        ]
    }


@problem_router.put("/{problem_id}")
async def update_existing_problem(
    problem_id: str,
    payload: ProblemUpdate,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Update a problem. Only the creator can update.
    """
    updated_problem = await update_problem(
        problem_id=problem_id,
        question=payload.question,
        description=payload.description,
        functional_requirements=payload.functional_requirements,
        non_functional_requirements=payload.non_functional_requirements,
        constraints=payload.constraints,
        user_email=current_user_email
    )

    if not updated_problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    if updated_problem.get("error") == "Unauthorized":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this problem"
        )

    return {
        "message": "Problem updated successfully",
        "problem": {
            "id": updated_problem["_id"],
            "question": updated_problem["question"],
            "description": updated_problem["description"],
            "requirements": updated_problem["requirements"],
            "constraints": updated_problem["constraints"],
            "created_by": updated_problem["created_by"],
            "created_at": updated_problem["created_at"].isoformat(),
            "updated_at": updated_problem["updated_at"].isoformat()
        }
    }


@problem_router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_problem(
    problem_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Delete a problem. Only the creator can delete.
    """
    deleted = await delete_problem(problem_id, current_user_email)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found or you are not authorized to delete it"
        )

    return None


@problem_router.get("/search/query")
async def search_for_problems(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Search problems by question or description.
    """
    problems = await search_problems(q, skip=skip, limit=limit)
    
    return {
        "total": len(problems),
        "query": q,
        "skip": skip,
        "limit": limit,
        "problems": [
            {
                "id": problem["_id"],
                "question": problem["question"],
                "description": problem["description"],
                "requirements": problem["requirements"],
                "constraints": problem["constraints"],
                "created_by": problem.get("created_by", "Unknown"),
                "created_at": problem["created_at"].isoformat(),
                "updated_at": problem["updated_at"].isoformat()
            }
            for problem in problems
        ]
    }
