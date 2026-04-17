import re
from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

def product_manager_node(state: AutoPrototypeState) -> dict:
    print("Product Manager Agent Active")
    
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.2)
    
    system_prompt = """You are an expert Software Product Manager. 
    Your job is to take a user's raw idea and output a clear, actionable architecture plan.
    
    CRITICAL SELECTION RULES (STACK, DATABASE, & STORAGE):
    1. STACK: Read the user's idea carefully. If they request specific frameworks (e.g., "Vue and Express"), you MUST select that stack. Default to React/FastAPI if unspecified.
    2. DATABASE: If the user requests a specific database (e.g., "Use MongoDB", "Use SQLite"), select it. Default to PostgreSQL if unspecified.
    3. STATIC STORAGE: Decide if the app needs object/file storage (e.g., MinIO/AWS S3). It DOES if the app involves user-uploaded photos, video/audio files, or document attachments. It does NOT if the app is pure text data (todo lists, text dashboards). Output TRUE if needed, FALSE otherwise.

    CRITICAL PORT CONTRACT: 
    You MUST explicitly specify in the architecture plan that the Backend API will run on port 8080 and the Frontend will run on port 5173. All downstream agents must adhere to these exact ports.
    
    You MUST output your exact choices wrapped in <stack>, <database>, and <storage> tags at the very beginning of your response.
    
    Example 1 (Complex app with uploads): 
    <stack>React/FastAPI</stack>
    <database>PostgreSQL</database>
    <storage>TRUE</storage>
    
    Example 2 (Simple text-only app): 
    <stack>Svelte/Django</stack>
    <database>SQLite</database>
    <storage>FALSE</storage>
    
    After the tags, provide your functional requirements and a precise file structure for the chosen architecture.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Here is the user's idea: {idea}")
    ])
    
    # Run the LLM with the user's idea
    response = (prompt | llm).invoke({"idea": state["user_idea"]})
    content = response.content
    
    # Parse out the architecture choices
    stack_match = re.search(r"<stack>(.*?)</stack>", content, re.IGNORECASE)
    db_match = re.search(r"<database>(.*?)</database>", content, re.IGNORECASE)
    storage_match = re.search(r"<storage>(.*?)</storage>", content, re.IGNORECASE)
    
    # Fallbacks in case the LLM forgets the tags
    selected_stack_name = stack_match.group(1).strip() if stack_match else "React/FastAPI"
    selected_db_name = db_match.group(1).strip() if db_match else "PostgreSQL"
    storage_str = storage_match.group(1).strip().upper() if storage_match else "FALSE"
    storage_required = storage_str == "TRUE"
    
    # Clean the architecture plan by removing the tags so the devs just see the plan
    clean_plan = re.sub(r"<stack>.*?</stack>", "", content, flags=re.IGNORECASE)
    clean_plan = re.sub(r"<database>.*?</database>", "", clean_plan, flags=re.IGNORECASE)
    clean_plan = re.sub(r"<storage>.*?</storage>", "", clean_plan, flags=re.IGNORECASE).strip()
    
    print(f" -> Selected Frontend/Backend: {selected_stack_name}")
    print(f" -> Selected Database: {selected_db_name}")
    print(f" -> Storage Required: {storage_required}\n")
    print(" -> Architecture plan generated.")
    
    return {
        "architecture_plan": clean_plan,
        "selected_stack_name": selected_stack_name,
        "selected_db_name": selected_db_name,
        "bucket_needed": storage_required
    }