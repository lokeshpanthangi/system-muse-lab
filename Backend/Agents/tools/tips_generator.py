"""
Tips Generator Tool
Generates personalized, actionable tips using GPT-4 LLM.
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
    Use GPT-4 LLM to generate personalized, actionable tips.
    
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
        llm = ChatOpenAI(model="gpt-4", temperature=0.7, api_key=api_key)
        
        system_prompt = """You are a supportive system design mentor. Generate 4-6 specific, actionable tips to help the student improve their solution.

Tips should:
- Be concrete and actionable (not vague like "improve your design")
- Reference specific components, patterns, or technologies when relevant
- Be encouraging and supportive in tone
- Progress from quick wins to deeper architectural improvements
- Include both technical details and strategic advice
- Be directly related to the missing concepts and their current score

Format: Return ONLY a JSON array of tip strings:
["Tip 1 with specific actionable advice", "Tip 2 with concrete suggestion", ...]

Do NOT include any markdown, code blocks, or explanatory text - just the raw JSON array."""

        score = scoring_result.get("score", 0)
        implemented = scoring_result.get("implemented", [])
        missing = scoring_result.get("missing", [])
        
        # Build context
        implemented_str = "\n".join(f"- {item}" for item in implemented[:5]) if implemented else "- Nothing identified yet"
        missing_str = "\n".join(f"- {item}" for item in missing[:5]) if missing else "- No specific gaps identified"
        
        user_prompt = f"""Problem: {problem_data.get('title', 'System Design')}

Requirements:
{chr(10).join(f"{i+1}. {req}" for i, req in enumerate(problem_data.get('requirements', [])[:5]))}

Student's Score: {score}/100

What they did well:
{implemented_str}

What's missing or needs improvement:
{missing_str}

Their current diagram summary:
{diagram_str[:600]}

Generate 4-6 specific, actionable tips to help them improve their system design. Focus on the missing concepts and provide concrete next steps."""

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
