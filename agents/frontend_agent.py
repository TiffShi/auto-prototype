from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from core.utils import apply_patches

# --- FRONTEND AGENT ---
def frontend_agent_node(state: AutoPrototypeState) -> dict:
    iteration = state.get('iteration_count', 0)
    print(f"--- Frontend Agent Active (Iteration {iteration}) ---")
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.1)    

    is_fix_mode = iteration > 0
    previous_code = state.get("frontend_code", "")

    if is_fix_mode:
        system_prompt = "You are a Senior Frontend Engineer fixing bugs."
        human_prompt = """TASK: SURGICAL BUG FIX (DIFF STRATEGY).
        You must fix the bugs identified by the QA Debugger in the existing frontend code.
        
        CRITICAL: DO NOT OUTPUT THE FULL CODEBASE.
        Output ONLY the specific chunks that need to be changed using SEARCH and REPLACE blocks.
        Include enough surrounding lines in the SEARCH block so it is unique.
        
        FORMAT:
        <<<SEARCH
        [exact code to find in the original file]
        ===REPLACE
        [the new updated code]
        >>>

        BACKEND API REFERENCE (Do not modify backend code):
        {backend_code}
        
        PREVIOUS FRONTEND CODE:
        {previous_code}
        
        DEBUGGER FEEDBACK:
        {feedback}
        
        CRITICAL DOMAIN INSTRUCTION: You are the Frontend Engineer. You must ONLY address the issues listed under "FRONTEND ISSUES" in the debugger feedback. Ignore all "BACKEND ISSUES".
        """
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt), 
            ("human", human_prompt)
        ])
        
        response = (prompt | llm).invoke({
            "backend_code": state.get("backend_code", "No backend code available."),
            "previous_code": previous_code,
            "feedback": state["error_messages"][-1]
        })
        new_code = apply_patches(previous_code, response.content)
        return {"frontend_code": new_code}
        
    else:
        stack_name = state.get("selected_stack_name", "React Vite")
        system_prompt = f"""You are a Senior Frontend Engineer. Output the full frontend source code for the {stack_name} stack.
        Use this exact format for every file:
        ### frontend/path/to/file.ext
        ```[language]
        [CODE]
        ```
        CRITICAL RULES:
        1. BOUNDARY LIMIT: You are strictly confined to frontend web logic. Output only frontend components, styles, configurations, and standard web assets.
        2. ENVIRONMENT VARIABLES: You MUST create an environment variable file (e.g., `.env`) in the frontend root that defines the backend API URL explicitly as `http://localhost:8080` (e.g., `VITE_API_URL=http://localhost:8080` or `REACT_APP_API_URL=http://localhost:8080`).
        3. API CONNECTION: All API calls (Axios, fetch, etc.) in your frontend code MUST use this environment variable for the base URL. Do NOT hardcode `localhost:8080` directly into the component files, and do NOT rely on Vite/Webpack proxying.
        4. SCRIPTS: Ensure your dependency file (e.g., package.json) includes a standard start script (like `npm start` or `npm run dev`) that binds to host `0.0.0.0` and explicitly uses port `5173`."""
        
        human_prompt = "Plan:\n{plan}\n\nBackend Source Code (Use this to find the API port):\n{backend_code}"
    
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt), 
            ("human", human_prompt)
        ])
        
        response = (prompt | llm).invoke({
            "plan": state.get('architecture_plan', ''),
            "backend_code": state.get("backend_code", "No backend code available.")
        })
        return {"frontend_code": response.content}