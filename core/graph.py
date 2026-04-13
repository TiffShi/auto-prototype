from langgraph.graph import StateGraph, END
from core.state import AutoPrototypeState
from agents.pm_agent import product_manager_node
from agents.backend_agent import backend_agent_node
from agents.frontend_agent import frontend_agent_node
from agents.devops_agent import devops_agent_node
from agents.debugger_agent import debugger_node
from agents.system_nodes import execution_node, file_saver_node

# --- ROUTER FUNCTION ---
def route_after_debugger(state: AutoPrototypeState):
    """Decides where to go next based on the debugger's findings."""
    MAX_ITERATIONS = 3
    
    # 1. If QA passed it (error list was cleared)
    if not state.get("error_messages"):
        print("-> Router: QA Passed. Proceeding to save.")
        return "saver"
        
    # 2. If QA failed, but we hit the retry limit
    if state.get("iteration_count", 0) >= MAX_ITERATIONS:
        print(f"-> Router: Max iterations ({MAX_ITERATIONS}) reached. Forcing save with known bugs.")
        return "saver"
        
    # 3. If QA failed and we still have retries left
    print("-> Router: Bugs found. Sending feedback back to Backend Developer.")
    return "backend"

def create_graph():
    workflow = StateGraph(AutoPrototypeState)

    workflow.add_node("pm", product_manager_node)
    workflow.add_node("backend", backend_agent_node)
    workflow.add_node("frontend", frontend_agent_node)
    workflow.add_node("devops", devops_agent_node) # NEW NODE
    workflow.add_node("executor", execution_node)
    workflow.add_node("debugger", debugger_node)
    workflow.add_node("saver", file_saver_node)

    # Standard linear flow
    workflow.set_entry_point("pm")
    workflow.add_edge("pm", "backend")
    workflow.add_edge("backend", "frontend")
    workflow.add_edge("frontend", "devops")       # ROUTE TO DEVOPS
    workflow.add_edge("devops", "executor")       # DEVOPS TO EXECUTOR
    workflow.add_edge("executor", "debugger")
    
    # Conditional loop logic
    workflow.add_conditional_edges(
        "debugger",
        route_after_debugger,
        {
            "backend": "backend", 
            "saver": "saver"      
        }
    )
    workflow.add_edge("saver", END)
    return workflow.compile()