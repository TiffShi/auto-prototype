from langgraph.graph import StateGraph, END
from core.state import AutoPrototypeState
from agents.pm_agent import product_manager_node
from agents.dev_agents import backend_agent_node, frontend_agent_node, file_saver_node

def create_graph():
    # 1. Initialize the Graph
    workflow = StateGraph(AutoPrototypeState)

    # 2. Add the specialized roles as Nodes
    workflow.add_node("pm", product_manager_node)
    workflow.add_node("backend", backend_agent_node)
    workflow.add_node("frontend", frontend_agent_node)
    workflow.add_node("saver", file_saver_node) # Added the saver node

    # 3. Define the Flow (Edges)
    # The journey starts with the User's Idea at the PM
    workflow.set_entry_point("pm")
    
    # Linear Flow: PM -> Backend -> Frontend -> Saver -> END
    workflow.add_edge("pm", "backend")
    workflow.add_edge("backend", "frontend")
    workflow.add_edge("frontend", "saver")
    workflow.add_edge("saver", END)

    # 4. Compile the graph
    return workflow.compile()