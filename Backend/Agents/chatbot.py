"""
Chatbot - AI Insights Chat for Practice Page
Simple LangChain chain (NOT an agent) that provides guidance.
Extracts data before calling LLM, maintains chat history.
"""
from typing import AsyncGenerator, Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

from .tools.excalidraw_extractor import extract_excalidraw_components

load_dotenv()

# Store chat history per session (session_id -> list of messages)
chat_histories: Dict[str, List[Dict[str, str]]] = {}


async def chat_with_bot(
    session_id: str,
    problem_data: Dict[str, Any],
    diagram_data: Dict[str, Any],
    user_message: str
) -> AsyncGenerator[str, None]:
    """
    Simple chat function that extracts data, sends to LLM, and streams response.
    NOT an agent - just a chain.
    
    Args:
        session_id: Session ID for managing chat history
        problem_data: Problem title, requirements, description
        diagram_data: Current Excalidraw diagram data
        user_message: Current user message
    
    Yields:
        Chunks of the AI response
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        yield "ERROR: OPENAI_API_KEY not configured"
        return
    
    # Get or initialize chat history for this session (keep last 10 Q/A pairs = 20 messages)
    if session_id not in chat_histories:
        chat_histories[session_id] = []
    
    history = chat_histories[session_id]
    
    # STEP 1: Extract diagram data BEFORE calling LLM
    diagram_summary = extract_excalidraw_components(diagram_data)
    
    # STEP 2: Format problem info (only needed data)
    problem_title = problem_data.get('title', 'System Design Problem')
    problem_description = problem_data.get('description', '')
    requirements = problem_data.get('requirements', [])[:7]  # Only first 7
    
    problem_summary = f"""Problem: {problem_title}
Description: {problem_description}
Requirements: {', '.join(requirements)}"""
    
    # STEP 3: Create LLM
    llm = ChatOpenAI(
        model="gpt-4",
        temperature=0.7,
        api_key=api_key,
        streaming=True
    )
    
    # STEP 4: Build prompt with system message + history + current question
    system_prompt = """You are a System Design Expert helping a student learn.

Guidelines:
- Give hints, NOT direct solutions
- Guide step by step
- Reference their actual diagram components
- Be concise (2-4 sentences)
- Be encouraging

You'll receive:
1. Problem details
2. Current diagram structure
3. Student's question"""

    # Build messages list
    messages = [
        ("system", system_prompt),
        ("human", f"Problem Context:\n{problem_summary}"),
        ("human", f"Current Diagram:\n{diagram_summary}")
    ]
    
    # Add chat history (last 10 Q/A pairs)
    for msg in history[-20:]:  # 10 pairs = 20 messages
        if msg["role"] == "user":
            messages.append(("human", msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(("ai", msg["content"]))
    
    # Add current user question
    messages.append(("human", user_message))
    
    # STEP 5: Create prompt template and chain
    prompt = ChatPromptTemplate.from_messages(messages)
    chain = prompt | llm
    
    # STEP 6: Stream response and collect it for history
    collected_response = ""
    try:
        async for chunk in chain.astream({}):
            if hasattr(chunk, 'content') and chunk.content:
                collected_response += chunk.content
                yield chunk.content
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        collected_response = error_msg
        yield error_msg
    
    # STEP 7: Save to chat history (user message + assistant response)
    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": collected_response})
    
    # STEP 8: Keep only last 10 Q/A pairs (20 messages)
    if len(history) > 20:
        history[:] = history[-20:]  # Remove old messages
    
    chat_histories[session_id] = history

