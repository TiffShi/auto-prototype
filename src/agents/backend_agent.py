from src.core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from src.core.utils import apply_patches, safe_invoke

# --- BACKEND AGENT ---
def backend_agent_node(state: AutoPrototypeState) -> dict:
    """
    Orchestrates backend code generation or refinement based on the current iteration state.

    If iteration > 0, it performs surgical bug fixes using a difference(DIFF)/patch strategy.
    Otherwise, it generates the initial codebase from the architecture plan.
    """
    iteration = state.get('iteration_count', 0)
    print(f"Backend Agent Active (Iteration {iteration})")
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.1)

    is_fix_mode = iteration > 0
    previous_code = state.get("backend_code", "")

    if is_fix_mode:
        # Bug FIX MODE: Uses SEARCH/REPLACE blocks to minimize token usage and avoid rewriting
        # the entire codebase, which prevents "lazy coding" omissions from the LLM
        system_prompt = "You are a Senior Backend Engineer fixing bugs."
        human_prompt = """TASK: SURGICAL BUG FIX (DIFF STRATEGY).
        You must fix the bugs identified by the QA Debugger in the existing code.
        
        CRITICAL: DO NOT OUTPUT THE FULL CODEBASE.
        Output ONLY the specific chunks that need to be changed using SEARCH and REPLACE blocks.
        Include enough surrounding lines in the SEARCH block so it is unique.
        
        FORMAT:
        <<<SEARCH
        [exact code to find in the original file]
        ===REPLACE
        [the new updated code]
        >>>
        
        PREVIOUS CODE:
        {previous_code}
        
        DEBUGGER FEEDBACK:
        {feedback}
        
        CRITICAL DOMAIN INSTRUCTION: You are the Backend Engineer. You must ONLY address the issues listed under "BACKEND ISSUES" in the debugger feedback. Ignore all "FRONTEND ISSUES".
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt), 
            ("human", human_prompt)
        ])

        response = safe_invoke(prompt | llm, {
            "previous_code": previous_code,
            "feedback": state["error_messages"][-1]
        })

        # Apply the SEARCH/REPLACE patches to the existing code string
        new_code = apply_patches(previous_code, response.content)
        return {"backend_code": new_code}

    else:
        # INITIAL BUILD: Generates a full implementation based on the selected tech stack
        stack_name = state.get("selected_stack_name", "Python/FastAPI")
        db_name = state.get("selected_db_name", "PostgreSQL")

        system_prompt = f"""You are a Senior Backend Engineer. Output the full backend source code for the {stack_name} stack, utilizing a {db_name} database.
        Use this exact format for every file:
        ### backend/path/to/file.ext
        ```[language]
        [CODE]
        ```
        CRITICAL RULES:
        1. BOUNDARY LIMIT: You are strictly confined to backend logic. Output only backend source files and the appropriate dependency file (e.g., requirements.txt, package.json, etc.). 
        2. NO INFRASTRUCTURE: Do not generate any Dockerfiles or startup scripts. The DevOps agent will handle that.
        3. NETWORKING & CORS: Expose your API strictly on port 8080. You MUST configure global CORS settings to explicitly whitelist the frontend origin: `http://localhost:5173`. Do NOT use wildcard `*` for CORS origins; explicitly name the frontend port.
        4. MODERN SECURITY DEPENDENCIES: For password hashing and authentication, you must strictly import and use modern, direct, standalone packages. Do NOT use outdated wrapper libraries, context managers, or multi-hashing frameworks (which frequently cause versioning and deprecation errors). Use the underlying implementation directly."""
        human_prompt = "Plan:\n{plan}"

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt), 
            ("human", human_prompt)
        ])

        response = safe_invoke(prompt | llm, {
            "plan": state.get('architecture_plan', '')
        })

        print(f"Backend Agent Finished (Iteration {iteration})")
        return {"backend_code": response.content}