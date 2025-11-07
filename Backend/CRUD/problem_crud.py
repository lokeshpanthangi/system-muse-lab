from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from database import db


async def create_problem(
    question: str,
    description: str,
    functional_requirements: List[str],
    non_functional_requirements: List[str],
    constraints: dict,
    created_by: str  # user email
) -> Optional[dict]:
    """
    Create a new problem in the database.
    """
    problem = {
        "question": question,
        "description": description,
        "requirements": {
            "functional_requirements": functional_requirements,
            "non_functional_requirements": non_functional_requirements
        },
        "constraints": constraints,
        "created_by": created_by,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await db.problems.insert_one(problem)
    problem["_id"] = str(result.inserted_id)
    return problem


async def get_problem_by_id(problem_id: str) -> Optional[dict]:
    """
    Retrieve a problem by its ID.
    """
    if not ObjectId.is_valid(problem_id):
        return None
    
    problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
    if not problem:
        return None

    problem["_id"] = str(problem["_id"])
    return problem


async def get_all_problems(skip: int = 0, limit: int = 100) -> List[dict]:
    """
    Retrieve all problems with pagination.
    """
    cursor = db.problems.find().skip(skip).limit(limit).sort("created_at", -1)
    problems = await cursor.to_list(length=limit)
    
    for problem in problems:
        problem["_id"] = str(problem["_id"])
    
    return problems


async def get_problems_by_user(user_email: str, skip: int = 0, limit: int = 100) -> List[dict]:
    """
    Retrieve all problems created by a specific user.
    """
    cursor = db.problems.find({"created_by": user_email}).skip(skip).limit(limit).sort("created_at", -1)
    problems = await cursor.to_list(length=limit)
    
    for problem in problems:
        problem["_id"] = str(problem["_id"])
    
    return problems


async def update_problem(
    problem_id: str,
    question: Optional[str] = None,
    description: Optional[str] = None,
    functional_requirements: Optional[List[str]] = None,
    non_functional_requirements: Optional[List[str]] = None,
    constraints: Optional[dict] = None,
    user_email: str = None
) -> Optional[dict]:
    """
    Update a problem. Only the creator can update their problem.
    """
    if not ObjectId.is_valid(problem_id):
        return None

    # Check if problem exists and user is the creator
    existing_problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
    if not existing_problem:
        return None
    
    if existing_problem.get("created_by") != user_email:
        return {"error": "Unauthorized"}

    update_data = {"updated_at": datetime.utcnow()}
    
    if question is not None:
        update_data["question"] = question
    if description is not None:
        update_data["description"] = description
    if functional_requirements is not None or non_functional_requirements is not None:
        requirements = existing_problem.get("requirements", {})
        if functional_requirements is not None:
            requirements["functional_requirements"] = functional_requirements
        if non_functional_requirements is not None:
            requirements["non_functional_requirements"] = non_functional_requirements
        update_data["requirements"] = requirements
    if constraints is not None:
        update_data["constraints"] = constraints

    result = await db.problems.update_one(
        {"_id": ObjectId(problem_id)},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        return None

    updated_problem = await get_problem_by_id(problem_id)
    return updated_problem


async def delete_problem(problem_id: str, user_email: str) -> bool:
    """
    Delete a problem. Only the creator can delete their problem.
    """
    if not ObjectId.is_valid(problem_id):
        return False

    # Check if problem exists and user is the creator
    existing_problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
    if not existing_problem:
        return False
    
    if existing_problem.get("created_by") != user_email:
        return False

    result = await db.problems.delete_one({"_id": ObjectId(problem_id)})
    return result.deleted_count > 0


async def search_problems(query: str, skip: int = 0, limit: int = 100) -> List[dict]:
    """
    Search problems by question or description.
    """
    search_filter = {
        "$or": [
            {"question": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
        ]
    }
    
    cursor = db.problems.find(search_filter).skip(skip).limit(limit).sort("created_at", -1)
    problems = await cursor.to_list(length=limit)
    
    for problem in problems:
        problem["_id"] = str(problem["_id"])
    
    return problems
