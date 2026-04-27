from src.core.state import AutoPrototypeState
from src.sandbox.executor import SandboxExecutor
from src.core.utils import write_files_to_disk
import os

# --- FILE SAVER ---
def file_saver_node(state: AutoPrototypeState) -> dict:
    """
    Finalizes the prototype generation by writing high-level artifacts to disk.
    
    Note: The actual application source code is flushed to disk by `write_files_to_disk` 
    during the execution phase. This node acts as the final cleanup step, persisting 
    the PM's architecture plan and generating a report for any lingering, unresolved bugs.
    """

    print("Finalizing All Files")
    
    # Grab the dynamic path from the state
    base_dir = state.get("project_dir", "output_prototype")
    os.makedirs(base_dir, exist_ok=True)
    
    # Files are already written by execution_node, just save the metadata
    if state.get("architecture_plan"):
        with open(os.path.join(base_dir, "architecture_plan.md"), "w", encoding="utf-8") as f:
            f.write(state["architecture_plan"])
            
    if state.get("error_messages"):
        print("WARNING: Unresolved bugs remain. Writing bug report.")
        with open(os.path.join(base_dir, "unresolved_bugs.md"), "w", encoding="utf-8") as f:
            f.write("# Unresolved Bugs Report\n\n")
            f.write(f"## Final QA Feedback:\n{state['error_messages'][-1]}\n")
            
    return state

# --- EXECUTION NODE ---
def execution_node(state: AutoPrototypeState) -> dict:
    """
    Bridges the LangGraph in-memory state with the local filesystem to test the prototype.
    
    Flushes the current code strings to their respective files, boots the Docker Compose 
    sandbox, and captures the standard output/error logs for the Debugger agent to evaluate.
    """

    print("Execution Node: Testing Code in Sandbox")
    
    # Write the current state to disk so Compose can build from the context
    write_files_to_disk(state)
    
    # Run the sandbox test and extract runtime logs
    sandbox = SandboxExecutor()
    logs = sandbox.test_prototype_and_get_logs(state) 
    
    return {"execution_logs": logs}