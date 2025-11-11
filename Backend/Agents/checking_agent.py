"""
Checking Agent
Analyzes user's Excalidraw diagram against question requirements using LangChain and GPT-4
"""
import os
import json
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

from .tools.excalidraw_extractor import extract_excalidraw_components, extract_component_list
from .tools.question_extractor import extract_question_requirements
from .prompts.checking_prompt import CHECKING_SYSTEM_PROMPT, CHECKING_USER_PROMPT_TEMPLATE

load_dotenv()


class CheckingAgent:
    """Agent for checking user's system design solutions"""
    
    def __init__(self):
        """Initialize the checking agent with GPT-4"""
        # Initialize LLM (GPT-4)
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.3,  # Slightly creative but mostly accurate
            api_key=api_key
        )
        
        # Create prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", CHECKING_SYSTEM_PROMPT),
            ("human", "{input}")
        ])
    
    async def check_solution(
        self,
        problem_data: Dict[str, Any],
        diagram_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Check user's solution and provide feedback.
        
        Args:
            problem_data: Question/problem data (title, description, requirements, etc.)
            diagram_data: User's Excalidraw diagram data
            
        Returns:
            Structured feedback dict with keys: implemented, missing, next_steps
        """
        try:
            # Extract data manually (simpler than using LangChain tools/agents)
            question_str = self._extract_question_data(problem_data)
            diagram_str = self._extract_diagram_data(diagram_data)
            
            # Create input for LLM
            user_input = CHECKING_USER_PROMPT_TEMPLATE.format(
                question_data=question_str,
                diagram_data=diagram_str
            )
            
            # Create chain
            chain = self.prompt | self.llm
            
            # Run LLM
            result = await chain.ainvoke({"input": user_input})
            
            # Parse JSON response
            try:
                feedback_json = json.loads(result.content)
                return feedback_json
            except json.JSONDecodeError:
                # Fallback if LLM doesn't return valid JSON
                return {
                    "implemented": ["Unable to parse AI response"],
                    "missing": ["Please try again"],
                    "next_steps": ["Check your internet connection"]
                }
            
        except Exception as e:
            return {
                "implemented": [],
                "missing": [f"Error analyzing solution: {str(e)}"],
                "next_steps": ["Please try again later"]
            }
    
    def _extract_question_data(self, problem_data: Dict[str, Any]) -> str:
        """Extract and format question requirements"""
        output_lines = []
        
        output_lines.append("=== QUESTION ===")
        output_lines.append(f"Title: {problem_data.get('title', 'Unknown')}")
        output_lines.append(f"Difficulty: {problem_data.get('difficulty', 'Unknown').upper()}")
        output_lines.append("")
        
        description = problem_data.get('description', '')
        if description:
            output_lines.append("=== DESCRIPTION ===")
            output_lines.append(description)
            output_lines.append("")
        
        requirements = problem_data.get('requirements', [])
        if requirements:
            output_lines.append("=== REQUIRED COMPONENTS ===")
            for idx, req in enumerate(requirements, 1):
                output_lines.append(f"{idx}. {req}")
            output_lines.append("")
        
        constraints = problem_data.get('constraints', [])
        if constraints:
            output_lines.append("=== CONSTRAINTS & ASSUMPTIONS ===")
            for idx, constraint in enumerate(constraints, 1):
                output_lines.append(f"{idx}. {constraint}")
            output_lines.append("")
        
        return "\n".join(output_lines)
    
    def _extract_diagram_data(self, diagram_data: Dict[str, Any]) -> str:
        """Extract and format Excalidraw diagram components"""
        if not diagram_data or not isinstance(diagram_data, dict):
            return "No diagram data provided"
        
        elements = diagram_data.get("elements", [])
        
        if not elements:
            return "Empty diagram - no elements found"
        
        components = []
        arrows = []
        text_elements = []
        
        for elem in elements:
            if not isinstance(elem, dict):
                continue
            
            component = {
                "id": elem.get("id", "unknown"),
                "type": elem.get("type", "unknown"),
                "text": elem.get("text", ""),
                "groupIds": elem.get("groupIds", []),
                "boundElements": elem.get("boundElements", []),
            }
            
            if elem.get("type") == "arrow":
                component["startBinding"] = elem.get("startBinding", {})
                component["endBinding"] = elem.get("endBinding", {})
                arrows.append(component)
            elif elem.get("type") == "text":
                text_elements.append(component)
            else:
                components.append(component)
        
        output_lines = []
        output_lines.append(f"=== DIAGRAM SUMMARY ===")
        output_lines.append(f"Total Elements: {len(elements)}")
        output_lines.append(f"Components: {len(components)}")
        output_lines.append(f"Arrows/Connections: {len(arrows)}")
        output_lines.append(f"Text Labels: {len(text_elements)}")
        output_lines.append("")
        
        if components:
            output_lines.append("=== COMPONENTS ===")
            for idx, comp in enumerate(components, 1):
                output_lines.append(f"{idx}. {comp['type'].upper()} (ID: {comp['id'][:8]}...)")
                if comp['text']:
                    output_lines.append(f"   Label: \"{comp['text']}\"")
                if comp['boundElements']:
                    output_lines.append(f"   Connected to: {len(comp['boundElements'])} elements")
                output_lines.append("")
        
        if arrows:
            output_lines.append("=== CONNECTIONS ===")
            for idx, arrow in enumerate(arrows, 1):
                start = arrow.get('startBinding', {}).get('elementId', 'unknown')
                end = arrow.get('endBinding', {}).get('elementId', 'unknown')
                label = arrow.get('text', '')
                
                output_lines.append(f"{idx}. ARROW (ID: {arrow['id'][:8]}...)")
                output_lines.append(f"   From: {start[:8]}... → To: {end[:8]}...")
                if label:
                    output_lines.append(f"   Label: \"{label}\"")
                output_lines.append("")
        
        if text_elements:
            output_lines.append("=== TEXT ANNOTATIONS ===")
            for idx, text in enumerate(text_elements, 1):
                output_lines.append(f"{idx}. \"{text.get('text', '')}\"")
            output_lines.append("")
        
        return "\n".join(output_lines)
    
    def check_solution_sync(
        self,
        problem_data: Dict[str, Any],
        diagram_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Synchronous version of check_solution.
        
        Args:
            problem_data: Question/problem data
            diagram_data: User's Excalidraw diagram data
            
        Returns:
            Structured feedback dict
        """
        try:
            # Extract data
            question_str = self._extract_question_data(problem_data)
            diagram_str = self._extract_diagram_data(diagram_data)
            
            # Create input for LLM
            user_input = CHECKING_USER_PROMPT_TEMPLATE.format(
                question_data=question_str,
                diagram_data=diagram_str
            )
            
            # Create chain
            chain = self.prompt | self.llm
            
            # Run LLM (sync)
            result = chain.invoke({"input": user_input})
            
            # Parse JSON response
            try:
                feedback_json = json.loads(result.content)
                return feedback_json
            except json.JSONDecodeError:
                return {
                    "implemented": ["Unable to parse AI response"],
                    "missing": ["Please try again"],
                    "next_steps": ["Check your internet connection"]
                }
            
        except Exception as e:
            return {
                "implemented": [],
                "missing": [f"Error analyzing solution: {str(e)}"],
                "next_steps": ["Please try again later"]
            }


# Singleton instance
_checking_agent = None


def get_checking_agent() -> CheckingAgent:
    """Get or create the singleton checking agent instance"""
    global _checking_agent
    if _checking_agent is None:
        _checking_agent = CheckingAgent()
    return _checking_agent


async def analyze_user_solution(
    problem_data: Dict[str, Any],
    diagram_data: Dict[str, Any]
) -> str:
    """
    Convenience function to analyze user solution.
    
    Args:
        problem_data: Question/problem data
        diagram_data: User's Excalidraw diagram data
        
    Returns:
        Feedback string
    """
    agent = get_checking_agent()
    return await agent.check_solution(problem_data, diagram_data)
