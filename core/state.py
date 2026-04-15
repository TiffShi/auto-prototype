# core/state.py
from typing import TypedDict, List, Optional

class AutoPrototypeState(TypedDict):
    # The input
    user_idea: str

    # The PM's high-level stack choice (e.g., "Vue/Express")
    selected_stack_name: Optional[str]
    
    # The PM's output
    architecture_plan: Optional[str]
    file_structure: Optional[dict]
    
    # The Builders' output  
    frontend_code: Optional[str]
    backend_code: Optional[str]

    # NEW: The DevOps output
    dockerfile_content: Optional[str]
    startup_script_content: Optional[str]
    
    # The Debugger's workflow
    execution_logs: Optional[str]
    error_messages: List[str]
    iteration_count: int