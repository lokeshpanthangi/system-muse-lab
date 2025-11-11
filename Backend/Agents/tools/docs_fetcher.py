"""
Documentation Fetcher Tool
Fetches relevant documentation and article links for learning.
Uses web search APIs or LLM suggestions.
"""
from typing import List, Dict, Any
import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


async def fetch_docs_llm(
    problem_data: Dict[str, Any],
    missing_concepts: List[str]
) -> List[Dict[str, Any]]:
    """
    Use LLM to suggest documentation and learning resources.
    
    Args:
        problem_data: Problem info
        missing_concepts: Missing concepts from scoring
    
    Returns:
        List of doc recommendations
    """
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return []
        
        llm = ChatOpenAI(model="gpt-4", temperature=0.7, api_key=api_key)
        
        system_prompt = """You are an expert system design educator. Suggest 4-6 high-quality documentation sources and articles for learning system design concepts.

Focus on:
- Official documentation (AWS, Azure, GCP)
- System design blogs (High Scalability, Martin Fowler, etc.)
- Educational resources (GeeksforGeeks, Medium articles)

Return ONLY a JSON array:
[
  {"title": "Resource title", "url": "actual or suggested URL", "source": "source name", "reason": "why helpful"},
  ...
]

Prefer real, well-known URLs when possible."""

        user_prompt = f"""Problem: {problem_data.get('title', 'System Design')}

Categories: {', '.join(problem_data.get('categories', []))}

Missing concepts:
{chr(10).join(f"- {concept}" for concept in missing_concepts[:5])}

Suggest documentation and articles to help learn these concepts."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt)
        ])
        
        chain = prompt | llm
        result = await chain.ainvoke({})
        
        docs = json.loads(result.content)
        
        return docs[:6]
        
    except Exception as e:
        print(f"LLM doc suggestion error: {e}")
        return []


async def fetch_documentation(
    problem_data: Dict[str, Any],
    missing_concepts: List[str]
) -> List[Dict[str, Any]]:
    """
    Main function to fetch documentation resources.
    
    Args:
        problem_data: Problem info
        missing_concepts: Missing concepts
    
    Returns:
        List of documentation links
    """
    # Try LLM suggestions
    docs = await fetch_docs_llm(problem_data, missing_concepts)
    
    if docs:
        return docs
    
    # Final fallback: generic resources
    problem_title = problem_data.get("title", "System Design")
    
    return [
        {
            "title": "System Design Primer",
            "url": "https://github.com/donnemartin/system-design-primer",
            "source": "GitHub",
            "reason": "Comprehensive system design resource"
        },
        {
            "title": "AWS Architecture Center",
            "url": "https://aws.amazon.com/architecture/",
            "source": "AWS",
            "reason": "Learn cloud architecture patterns"
        },
        {
            "title": "Google Cloud Architecture Framework",
            "url": "https://cloud.google.com/architecture/framework",
            "source": "Google Cloud",
            "reason": "Best practices for system design"
        },
        {
            "title": f"{problem_title} - System Design",
            "url": f"https://www.google.com/search?q={problem_title.replace(' ', '+')}+system+design",
            "source": "Google Search",
            "reason": "Search for specific implementation guides"
        }
    ]
