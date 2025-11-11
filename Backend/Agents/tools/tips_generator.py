"""
Tips Generator Tool
Generates personalized, actionable tips using gpt-4o-mini LLM.
Requires OPENAI_API_KEY environment variable.
"""
from typing import List, Dict, Any
import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


async def generate_tips(
    problem_data: Dict[str, Any],
    scoring_result: Dict[str, Any],
    diagram_str: str
) -> List[str]:
    """
    Use gpt-4o-mini LLM to generate personalized, actionable tips.
    
    Args:
        problem_data: Problem info with title, requirements, etc.
        scoring_result: Score, implemented, missing arrays
        diagram_str: Formatted diagram summary
    
    Returns:
        List of 4-6 actionable tips, empty list if LLM unavailable
    """
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("WARNING: OPENAI_API_KEY not configured - cannot generate personalized tips")
        return []
    
    try:
        model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        llm = ChatOpenAI(model=model_name, temperature=0.7, api_key=api_key)
        
        system_prompt = """You are a system design mentor. Generate 4-6 specific, actionable tips to improve the solution.

Tips must be:
- Concrete and actionable (not vague)
- Reference specific components/patterns
- Encouraging and supportive
- Progress from quick wins to deeper improvements
- Grounded ONLY in the provided problem description, requirements, scoring summary, and diagram. Do not introduce unrelated topics or generic advice.

Return ONLY JSON array: ["Tip 1", "Tip 2", ...]

No markdown, no code blocks, just raw JSON array."""

        score = scoring_result.get("score", 0)
        implemented = scoring_result.get("implemented", [])
        missing = scoring_result.get("missing", [])
        
        # Build context
        implemented_str = "\n".join(f"- {item}" for item in implemented[:5]) if implemented else "- Nothing identified yet"
        missing_str = "\n".join(f"- {item}" for item in missing[:5]) if missing else "- No specific gaps identified"
        
        user_prompt = f"""Problem: {problem_data.get('title', 'System Design')}

Requirements: {', '.join(problem_data.get('requirements', [])[:5])}

Score: {score}/100

Did well: {', '.join(implemented[:3]) if implemented else 'Nothing identified'}

Missing: {', '.join(missing[:3]) if missing else 'No gaps'}

Diagram: {diagram_str[:400]}

Generate 4-6 specific tips."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt)
        ])
        
        chain = prompt | llm
        result = await chain.ainvoke({})
        
        # Parse JSON response
        tips = json.loads(result.content)
        
        # Validate response
        if not isinstance(tips, list):
            print(f"LLM returned non-list tips: {type(tips)}")
            return []
        
        # Ensure tips are strings
        tips = [str(tip) for tip in tips if tip]
        
        print(f"Generated {len(tips)} personalized tips via LLM")
        return tips[:6]
        
    except json.JSONDecodeError as e:
        print(f"LLM returned invalid JSON for tips: {e}")
        return []
    except Exception as e:
        print(f"LLM tips generation error: {e}")
        return []
