from core.graph import create_graph
from dotenv import load_dotenv

def run_autoprototype():
    load_dotenv()
    
    # Initialize the LangGraph app
    app = create_graph()
    
    # Define the starting state with a test idea
    initial_state = {
        "user_idea": "I want a simple app that tracks my daily water intake and sends me a reminder.",
        "error_messages": [],
        "iteration_count": 0
    }
    
    # Run the workflow
    print("--- Starting AutoPrototype Workflow ---")
    final_state = app.invoke(initial_state)
    
    print("\n--- FINAL ARCHITECTURE PLAN ---")
    print(final_state["architecture_plan"])

if __name__ == "__main__":
    run_autoprototype()