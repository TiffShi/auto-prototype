from langgraph.graph import StateGraph, END
from src.core.state import AutoPrototypeState
from src.agents.pm_agent import product_manager_node
from src.agents.backend_agent import backend_agent_node
from src.agents.frontend_agent import frontend_agent_node
from src.agents.data_agent import data_agent_node
from src.agents.devops_agent import devops_agent_node
from src.agents.debugger_agent import debugger_node
from src.agents.system_nodes import execution_node, file_saver_node

# --- ROUTER FUNCTION ---
def route_after_debugger(state: AutoPrototypeState):
    """
    Determines the next node in the graph based on QA evaluation.
    Routes back to the backend agent if bugs are found, or forwards to the saver 
    if the prototype passes or the maximum retry limit is reached.
    """
    MAX_ITERATIONS = 5
    errors = state.get("error_messages")

    # If QA passed (error list was cleared)
    if not state.get("error_messages"):
        print("Router: QA Passed. Proceeding to save.")
        return "saver"

    # If QA failed but we hit the retry limit
    if state.get("iteration_count", 0) >= MAX_ITERATIONS:
        print(f"Router: Max iterations ({MAX_ITERATIONS}) reached. Forcing save with known bugs.")
        return "saver"

    print("Router: Bugs found. Analyzing feedback to route to the earliest required agent...")
    last_error = errors[-1]
    
    if "BACKEND ISSUES:\nNone" not in last_error and "BACKEND ISSUES:" in last_error:
        print(" -> Routing to Backend Agent")
        return "backend"
        
    if "FRONTEND ISSUES:\nNone" not in last_error and "FRONTEND ISSUES:" in last_error:
        print(" -> Routing to Frontend Agent")
        return "frontend"
        
    if ("DATABASE ISSUES:\nNone" not in last_error and "DATABASE ISSUES:" in last_error) or \
       ("BUCKET ISSUES:\nNone" not in last_error and "BUCKET ISSUES:" in last_error):
        print(" -> Routing to Data Agent")
        return "data"
        
    if "DEVOPS ISSUES:\nNone" not in last_error and "DEVOPS ISSUES:" in last_error:
        print(" -> Routing to DevOps Agent")
        return "devops"

    # Default fallback
    print(" -> Fallback: Routing to Backend Agent")
    return "backend"

def create_graph():
    """
    Compiles the LangGraph state machine orchestrating the AI development pipeline.
    Defines the sequential flow from PM to DevOps, followed by the execution/QA loop.
    """

    workflow = StateGraph(AutoPrototypeState)

    workflow.add_node("pm",       product_manager_node)
    workflow.add_node("backend",  backend_agent_node)
    workflow.add_node("frontend", frontend_agent_node)
    workflow.add_node("data",     data_agent_node)
    workflow.add_node("devops",   devops_agent_node)
    workflow.add_node("executor", execution_node)
    workflow.add_node("debugger", debugger_node)
    workflow.add_node("saver",    file_saver_node)

    # Linear flow: pm → backend → frontend → data → devops → executor → debugger
    workflow.set_entry_point("pm")
    workflow.add_edge("pm",       "backend")
    workflow.add_edge("backend",  "frontend")
    workflow.add_edge("frontend", "data")
    workflow.add_edge("data",     "devops")
    workflow.add_edge("devops",   "executor")
    workflow.add_edge("executor", "debugger")

    # QA loop: debugger routes back to backend for fixes, or forward to save
    workflow.add_conditional_edges(
        "debugger",
        route_after_debugger,
        {
            "devops": "devops",
            "data": "data",
            "backend": "backend",
            "frontend": "frontend",
            "saver": "saver"
        }
    )
    workflow.add_edge("saver", END)
    return workflow.compile()
