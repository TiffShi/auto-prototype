from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

def product_manager_node(state: AutoPrototypeState) -> dict:
    print("--- Product Manager Agent Active ---")
    
    # Initialize the LLM (Make sure your ANTHROPIC_API_KEY is in your .env file)
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.2)
    
    # Define the instructions for the PM
    system_prompt = """You are an expert Software Product Manager. 
    Your job is to take a user's raw idea and output a clear, actionable architecture plan.
    Unless otherwise specified, default to a modern stack using FastAPI for the backend and React for the frontend.
    Break the plan down into functional requirements and a precise file structure."""
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Here is the user's idea: {idea}")
    ])
    
    # Connect the prompt to the LLM
    chain = prompt | llm
    
    # Run the LLM with the user's idea from the state
    response = chain.invoke({"idea": state["user_idea"]})
    
    print("Architecture plan generated.")
    
    # Return the updated dictionary to be merged into the global State
    return {
        "architecture_plan": response.content
    }