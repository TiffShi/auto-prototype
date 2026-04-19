from core.state import AutoPrototypeState
from sandbox.executor import SandboxExecutor
from core.utils import write_files_to_disk
import os

# --- UPDATED: FILE SAVER ---
def file_saver_node(state: AutoPrototypeState) -> dict:
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

# --- NEW: EXECUTION NODE ---
def execution_node(state: AutoPrototypeState) -> dict:
    print("Execution Node: Testing Code in Sandbox")
    
    # 1. Write the current state to disk so Docker can see it
    write_files_to_disk(state)
    
    # 2. Run the sandbox test (MUST PASS STATE HERE)
    sandbox = SandboxExecutor()
    logs = sandbox.test_prototype_and_get_logs(state) 
    
    return {"execution_logs": logs}