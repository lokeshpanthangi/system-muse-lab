"""
Scoring Tool
Evaluates user's system design solution using GPT-4 LLM.
Requires OPENAI_API_KEY environment variable.
"""
from typing import Dict, Any
import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os


async def score_solution(
    problem_data: Dict[str, Any],
    diagram_data: Dict[str, Any],
    diagram_str: str
) -> Dict[str, Any]:
    """
    Use GPT-4 LLM to evaluate the system design solution.
    
    Args:
        problem_data: Problem requirements and info
        diagram_data: Raw Excalidraw data
        diagram_str: Formatted diagram summary
    
    Returns:
        Scoring result dict with score, breakdown, implemented, missing
    """
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not configured - cannot score submission")
        return {
            "score": 0,
            "max_score": 100,
            "breakdown": [{
                "requirement": "LLM Evaluation",
                "achieved": False,
                "points": 0,
                "note": "OpenAI API key not configured"
            }],
            "implemented": [],
            "missing": ["Cannot evaluate - OpenAI API key required"]
        }
    
    # Check if diagram is empty
    elements = diagram_data.get("elements", [])
    if not elements:
        return {
            "score": 0,
            "max_score": 100,
            "breakdown": [{
                "requirement": "Any component",
                "achieved": False,
                "points": 0,
                "note": "Empty diagram"
            }],
            "implemented": [],
            "missing": ["No components drawn on canvas"]
        }
    
    try:
        llm = ChatOpenAI(model="gpt-4", temperature=0.3, api_key=api_key)
        
        system_prompt = """You are an expert system design evaluator. Your task is to score a student's system design diagram against the problem requirements.

Evaluation criteria:
1. Component completeness: Are all required components present?
2. Connections: Are components properly connected to show data flow?
3. Scalability considerations: Does the design account for scale?
4. Best practices: Does it follow system design patterns?
5. Labeling and clarity: Are components properly labeled?

Scoring guidelines:
- 90-100: Exceptional - All requirements met, excellent scalability, best practices
- 80-89: Very Good - Most requirements met, good architecture, minor improvements needed
- 70-79: Good - Core requirements met, some scalability concerns
- 60-69: Adequate - Basic requirements met, significant improvements needed
- 50-59: Needs Work - Missing key components or major flaws
- 0-49: Incomplete - Critical components missing or design doesn't work

Output Format:
Return ONLY a valid JSON object with these keys:
- "score": number (0-100, be realistic and fair)
- "implemented": array of 3-6 strings describing what's done well (be specific, reference component names)
- "missing": array of 2-5 strings describing what's missing or incorrect (be constructive)
- "breakdown": array of objects with {{requirement: string, achieved: boolean, points: number, note: string}}

For breakdown, evaluate each requirement separately and assign partial points based on how well it's implemented.
Be encouraging but accurate. Reference actual components from the diagram by name."""

        user_prompt = f"""Problem:
{problem_data.get('title', 'Unknown')}

Description:
{problem_data.get('description', 'No description provided')}

Requirements:
{chr(10).join(f"{i+1}. {req}" for i, req in enumerate(problem_data.get('requirements', ['No requirements specified'])))}

Student's Diagram:
{diagram_str}

Diagram Statistics:
- Total elements: {len(elements)}
- Components: {len([e for e in elements if e.get('type') in ['rectangle', 'ellipse', 'diamond']])}
- Arrows: {len([e for e in elements if e.get('type') == 'arrow'])}
- Text labels: {len([e for e in elements if e.get('type') == 'text'])}

Provide a comprehensive score and detailed feedback in JSON format."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt)
        ])
        
        chain = prompt | llm
        result = await chain.ainvoke({})
        
        # Parse JSON response
        feedback_json = json.loads(result.content)
        
        # Ensure required keys and validate
        if "score" not in feedback_json or not isinstance(feedback_json["score"], (int, float)):
            feedback_json["score"] = 50
        
        if "implemented" not in feedback_json or not isinstance(feedback_json["implemented"], list):
            feedback_json["implemented"] = ["Diagram structure created"]
        
        if "missing" not in feedback_json or not isinstance(feedback_json["missing"], list):
            feedback_json["missing"] = ["Some requirements may need attention"]
        
        if "breakdown" not in feedback_json or not isinstance(feedback_json["breakdown"], list):
            feedback_json["breakdown"] = [{
                "requirement": "Overall Design",
                "achieved": feedback_json["score"] >= 60,
                "points": feedback_json["score"],
                "note": "Evaluated by AI"
            }]
        
        # Ensure score is within bounds
        feedback_json["score"] = max(0, min(100, float(feedback_json["score"])))
        feedback_json["max_score"] = 100
        
        print(f"LLM scoring successful: {feedback_json['score']}/100")
        return feedback_json
        
    except json.JSONDecodeError as e:
        print(f"LLM returned invalid JSON: {e}")
        return {
            "score": 0,
            "max_score": 100,
            "breakdown": [{
                "requirement": "LLM Evaluation",
                "achieved": False,
                "points": 0,
                "note": "Failed to parse AI response"
            }],
            "implemented": [],
            "missing": ["AI evaluation failed - invalid response format"]
        }
    except Exception as e:
        print(f"LLM scoring error: {e}")
        return {
            "score": 0,
            "max_score": 100,
            "breakdown": [{
                "requirement": "LLM Evaluation",
                "achieved": False,
                "points": 0,
                "note": str(e)
            }],
            "implemented": [],
            "missing": [f"AI evaluation error: {str(e)}"]
        }
