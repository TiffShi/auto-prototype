import re
from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

def product_manager_node(state: AutoPrototypeState) -> dict:
    print("--- Product Manager Agent Active ---")
    
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.2)
    
    system_prompt = """You are an expert Software Product Manager. 
    Your job is to take a user's raw idea and output a clear, actionable architecture plan.
    
    CRITICAL STACK SELECTION RULE:
    1. Read the user's idea carefully. If the user explicitly requests specific frameworks (e.g., "Use Vue and Express" or "Svelte/Django"), you MUST select that exact stack.
    2. If the user does NOT specify a tech stack preference, you MUST default to React/FastAPI.

    CRITICAL PORT CONTRACT: 
    You MUST explicitly specify in the architecture plan that the Backend API will run on port 8080 and the Frontend will run on port 5173. All downstream agents must adhere to these exact ports.
    
    You MUST output the exact name of your chosen stack wrapped in <stack> tags at the very beginning of your response.
    Example 1 (User requested Vue/Express): <stack>Vue/Express</stack>
    Example 2 (User did not specify): <stack>React/FastAPI</stack>
    
    After the stack tag, provide your functional requirements and a precise file structure for the chosen stack.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Here is the user's idea: {idea}")
    ])
    
    # Run the LLM with the user's idea
    response = (prompt | llm).invoke({"idea": state["user_idea"]})
    content = response.content
    
    # Parse out the stack choice
    stack_match = re.search(r"<stack>(.*?)</stack>", content, re.IGNORECASE)
    
    # If the LLM forgets the tags, default to React/FastAPI to prevent downstream crashes
    selected_stack_name = stack_match.group(1).strip() if stack_match else "React/FastAPI"
    
    # Clean the architecture plan by removing the <stack> tags so the devs just see the plan
    clean_plan = re.sub(r"<stack>.*?</stack>", "", content, flags=re.IGNORECASE).strip()
    
    print(f"-> Selected Stack: {selected_stack_name}")
    print("-> Architecture plan generated.")
    
    return {
        "architecture_plan": clean_plan,
        "selected_stack_name": selected_stack_name
    }