from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

# --- DEBUGGER AGENT ---
def debugger_node(state: AutoPrototypeState) -> dict:
    print("--- Debugger Agent Active (Analyzing Logs)---")
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.1)    

    system_prompt = """You are a QA Reviewer and Tech Lead. 
    Review the Architecture Plan, Backend Code, Frontend Code, and the RUNTIME LOGS from the Docker Sandbox.

    CRITICAL CHECKLIST - You must verify the following:
    1. Did the build fail? (Check logs for pip or npm install errors).
    2. Did the backend crash? (Check logs for Python tracebacks, ImportErrors, or syntax errors).
    3. Did the frontend crash? (Check logs for React compilation errors).

    If the logs show clear startup success and no crashes, output exactly: 'VERDICT: PASS'.

    If there is a crash or error in the logs, output 'VERDICT: FAIL' followed by explicit instructions on what file to fix and how to fix it based on the stack trace.

    CRITICAL FORMATTING: You must strictly categorize your feedback into two distinct sections:
    
    BACKEND ISSUES:
    [List any Python/FastAPI bugs based on the logs here]
    
    FRONTEND ISSUES:
    [List any React/Javascript/package.json bugs based on the logs here]
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Plan:\n{plan}\n\nBackend:\n{backend}\n\nFrontend:\n{frontend}\n\nRUNTIME LOGS:\n{logs}")
    ])
    
    response = (prompt | llm).invoke({
        "plan": state["architecture_plan"],
        "backend": state.get("backend_code", ""),
        "frontend": state.get("frontend_code", ""),
        "logs": state.get("execution_logs", "No logs available.")
    })
    
    content = response.content
    print(f"Debugger Output: {content[:150]}...")
    
    if "VERDICT: PASS" in content.upper():
        return {"error_messages": []}
    else:
        current_iterations = state.get("iteration_count", 0)
        return {
            "error_messages": state.get("error_messages", []) + [content],
            "iteration_count": current_iterations + 1
        }