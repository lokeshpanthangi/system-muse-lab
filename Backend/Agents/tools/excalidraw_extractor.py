"""
Excalidraw Code Extractor Tool
Extracts and formats Excalidraw diagram components for LLM analysis
"""
from typing import Dict, Any, List
from langchain.tools import tool


@tool
def extract_excalidraw_components(diagram_data: dict) -> str:
    """
    Extract structured components from Excalidraw diagram.
    
    Extracts: id, type, text, groupIds, boundElements, startBinding, endBinding
    Returns formatted string representation of the diagram for LLM analysis.
    
    Args:
        diagram_data: Excalidraw JSON diagram data
        
    Returns:
        Formatted string with extracted components
    """
    if not diagram_data or not isinstance(diagram_data, dict):
        return "No diagram data provided"
    
    elements = diagram_data.get("elements", [])
    
    if not elements:
        return "Empty diagram - no elements found"
    
    # Extract components
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
        
        # Add binding information for arrows
        if elem.get("type") == "arrow":
            component["startBinding"] = elem.get("startBinding", {})
            component["endBinding"] = elem.get("endBinding", {})
            arrows.append(component)
        elif elem.get("type") == "text":
            text_elements.append(component)
        else:
            # Shapes (rectangle, ellipse, diamond)
            components.append(component)
    
    # Format output for LLM
    output_lines = []
    
    # Summary
    output_lines.append(f"=== DIAGRAM SUMMARY ===")
    output_lines.append(f"Total Elements: {len(elements)}")
    output_lines.append(f"Components: {len(components)}")
    output_lines.append(f"Arrows/Connections: {len(arrows)}")
    output_lines.append(f"Text Labels: {len(text_elements)}")
    output_lines.append("")
    
    # Components
    if components:
        output_lines.append("=== COMPONENTS ===")
        for idx, comp in enumerate(components, 1):
            output_lines.append(f"{idx}. {comp['type'].upper()} (ID: {comp['id'][:8]}...)")
            if comp['text']:
                output_lines.append(f"   Label: \"{comp['text']}\"")
            if comp['boundElements']:
                connected = [b.get('id', '')[:8] for b in comp['boundElements']]
                output_lines.append(f"   Connected to: {len(comp['boundElements'])} elements")
            if comp['groupIds']:
                output_lines.append(f"   Part of group: {comp['groupIds'][0][:8]}...")
            output_lines.append("")
    
    # Connections
    if arrows:
        output_lines.append("=== CONNECTIONS ===")
        for idx, arrow in enumerate(arrows, 1):
            start_binding = arrow.get('startBinding') or {}
            end_binding = arrow.get('endBinding') or {}
            start = start_binding.get('elementId', 'unknown')
            end = end_binding.get('elementId', 'unknown')
            label = arrow.get('text', '')
            
            output_lines.append(f"{idx}. ARROW (ID: {arrow['id'][:8]}...)")
            output_lines.append(f"   From: {start[:8] if start != 'unknown' else start}... → To: {end[:8] if end != 'unknown' else end}...")
            if label:
                output_lines.append(f"   Label: \"{label}\"")
            output_lines.append("")
    
    # Standalone text
    if text_elements:
        output_lines.append("=== TEXT ANNOTATIONS ===")
        for idx, text in enumerate(text_elements, 1):
            output_lines.append(f"{idx}. \"{text.get('text', '')}\"")
        output_lines.append("")
    
    return "\n".join(output_lines)


def extract_component_list(diagram_data: dict) -> List[Dict[str, Any]]:
    """
    Helper function to extract raw component list with all required fields.
    Used for structured data processing.
    
    Returns list of components with: id, type, text, groupIds, boundElements, startBinding, endBinding
    """
    if not diagram_data or not isinstance(diagram_data, dict):
        return []
    
    elements = diagram_data.get("elements", [])
    extracted = []
    
    for elem in elements:
        if not isinstance(elem, dict):
            continue
        
        component = {
            "id": elem.get("id", ""),
            "type": elem.get("type", ""),
            "text": elem.get("text", ""),
            "groupIds": elem.get("groupIds", []),
            "boundElements": elem.get("boundElements", []),
        }
        
        # Add arrow bindings if applicable
        if elem.get("type") == "arrow":
            component["startBinding"] = elem.get("startBinding", {})
            component["endBinding"] = elem.get("endBinding", {})
        
        extracted.append(component)
    
    return extracted
