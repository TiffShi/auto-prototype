from typing import TypedDict, List, Optional

class AutoPrototypeState(TypedDict):
    """
    Defines the shared memory object passed between LangGraph nodes.
    Tracks the user's initial idea, generated code output, and QA iteration state.
    """
    # Base inputs
    user_idea: str
    project_dir: Optional[str]

    # The PM's high-level stack choice (e.g., "Vue/Express")
    selected_stack_name: Optional[str]
    selected_db_name: Optional[str]

    # The PM's output
    architecture_plan: Optional[str]
    file_structure: Optional[dict]

    # The Builders' output
    frontend_code: Optional[str]
    backend_code: Optional[str]

    # The Data agent's output (database + optional object storage)
    data_code: Optional[str]
    bucket_needed: Optional[bool]

    # The DevOps output
    infra_code: Optional[str]

    # The Debugger's workflow
    execution_logs: Optional[str]
    error_messages: List[str]
    iteration_count: int
