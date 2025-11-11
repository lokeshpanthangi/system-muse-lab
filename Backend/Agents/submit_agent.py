"""
Submit Agent
Orchestrates the submission evaluation process:
1. Scores the solution
2. Generates tips
3. Fetches learning resources (YouTube videos + docs)
4. Returns comprehensive submission result
"""
from typing import Dict, Any
from .tools.scoring import score_solution
from .tools.tips_generator import generate_tips
from .tools.youtube_fetcher import fetch_youtube_videos
from .tools.docs_fetcher import fetch_documentation


def extract_diagram_summary(diagram_data: Dict[str, Any]) -> str:
    """Extract and format diagram summary for analysis"""
    if not diagram_data or not isinstance(diagram_data, dict):
        return "Empty diagram"
    
    elements = diagram_data.get("elements", [])
    
    if not elements:
        return "No elements in diagram"
    
    components = []
    arrows = []
    text_elements = []
    
    for elem in elements:
        if not isinstance(elem, dict):
            continue
        
        elem_type = elem.get("type", "")
        elem_id = elem.get("id", "")[:8]
        elem_text = elem.get("text", "")
        
        if elem_type == "arrow":
            start = elem.get("startBinding", {}).get("elementId", "")[:8]
            end = elem.get("endBinding", {}).get("elementId", "")[:8]
            arrows.append(f"Arrow({elem_id}): {start} → {end}" + (f' "{elem_text}"' if elem_text else ''))
        elif elem_type == "text":
            text_elements.append(f'Text: "{elem_text}"')
        else:
            components.append(f"{elem_type.upper()}({elem_id})" + (f': "{elem_text}"' if elem_text else ''))
    
    lines = [
        f"=== DIAGRAM SUMMARY ===",
        f"Total: {len(elements)} elements",
        f"Components: {len(components)}",
        f"Connections: {len(arrows)}",
        "",
        "=== COMPONENTS ===" if components else "",
        *[f"- {c}" for c in components],
        "",
        "=== CONNECTIONS ===" if arrows else "",
        *[f"- {a}" for a in arrows],
        "",
        "=== LABELS ===" if text_elements else "",
        *[f"- {t}" for t in text_elements[:10]]
    ]
    
    return "\n".join(line for line in lines if line)


async def evaluate_submission(
    problem_data: Dict[str, Any],
    diagram_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main submission evaluation function.
    
    Args:
        problem_data: Problem requirements and metadata
        diagram_data: User's Excalidraw diagram data
    
    Returns:
        Complete submission result with score, feedback, tips, and resources
    """
    # Extract diagram summary
    diagram_str = extract_diagram_summary(diagram_data)
    
    # Step 1: Score the solution
    scoring_result = await score_solution(problem_data, diagram_data, diagram_str)
    
    score = scoring_result.get("score", 0)
    max_score = scoring_result.get("max_score", 100)
    breakdown = scoring_result.get("breakdown", [])
    implemented = scoring_result.get("implemented", [])
    missing = scoring_result.get("missing", [])
    
    # Step 2: Generate personalized tips
    tips = await generate_tips(problem_data, scoring_result, diagram_str)
    
    # Step 3: Fetch learning resources
    # Run in parallel for speed
    import asyncio
    videos_task = fetch_youtube_videos(problem_data, missing)
    docs_task = fetch_documentation(problem_data, missing)
    
    videos, docs = await asyncio.gather(videos_task, docs_task)
    
    # Assemble final result
    result = {
        "score": score,
        "max_score": max_score,
        "breakdown": breakdown,
        "feedback": {
            "implemented": implemented,
            "missing": missing,
            "next_steps": tips[:3] if len(tips) > 3 else tips  # First 3 tips as next steps
        },
        "tips": tips,
        "resources": {
            "videos": videos,
            "docs": docs
        }
    }
    
    return result
