import os
import re
from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from sandbox.executor import SandboxExecutor

# --- DIFF UTILITY FUNCTION ---
def apply_patches(original_code: str, patch_text: str) -> str:
    """Finds SEARCH/REPLACE blocks in the LLM response and applies them to the original code."""
    pattern = r"<<<SEARCH\n(.*?)\n===REPLACE\n(.*?)\n>>>"
    matches = re.findall(pattern, patch_text, re.DOTALL)
    
    patched_code = original_code
    patch_count = 0
    
    for search_block, replace_block in matches:
        if search_block in patched_code:
            patched_code = patched_code.replace(search_block, replace_block)
            patch_count += 1
        else:
            print("\n[PATCH FAILED] Could not locate exact search block in original code. The LLM might have hallucinated the indentation.")
            print(f"Wanted to find:\n{search_block[:100]}...\n")
            
    print(f"-> Applied {patch_count} patches successfully.")
    return patched_code

# --- BACKEND AGENT ---
def backend_agent_node(state: AutoPrototypeState) -> dict:
    iteration = state.get('iteration_count', 0)
    print(f"--- Backend Agent Active (Iteration {iteration}) ---")
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.1)    

    is_fix_mode = iteration > 0
    previous_code = state.get("backend_code", "")

    if is_fix_mode:
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
        
        response = (prompt | llm).invoke({
            "previous_code": previous_code,
            "feedback": state["error_messages"][-1]
        })
        new_code = apply_patches(previous_code, response.content)
        return {"backend_code": new_code}
        
    else:
        system_prompt = """You are a Senior Backend Engineer. Output the full FastAPI source code.
        Use this exact format for every file:
        ### app/path/to/file.py
        ```python
        [CODE]
        ```
        CRITICAL RULES:
        1. BOUNDARY LIMIT: You are strictly confined to backend logic. You are only authorized to output Python files (.py) and requirements.txt. 
        2. IMPORT RULE: The server will be executed from the root 'backend' folder using `uvicorn app.main:app`. Therefore, ALL internal Python imports MUST be absolute and start with the `app.` prefix (e.g., `from app.routers import x`).
        3. NO INFRASTRUCTURE: Do not generate any deployment or container configuration files. The execution environment is managed externally."""
        human_prompt = "Plan:\n{plan}"

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt), 
            ("human", human_prompt)
        ])
        
        response = (prompt | llm).invoke({
            "plan": state.get('architecture_plan', '')
        })
        return {"backend_code": response.content}


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
        system_prompt = """You are a Senior Frontend Engineer. Output the full React source code.
        Use this exact format for every file (including src/ and public/):
        ### src/components/Header.js
        ```javascript
        [CODE]
        ```
        CRITICAL RULES:
        1. BOUNDARY LIMIT: You are strictly confined to frontend web logic. You are only authorized to output React components (.jsx/.js), styles (.css), Vite configurations, and standard web assets (index.html, package.json) index.html should only be in the frontend directory and not the public directory if it is using vite.
        2. EXECUTION RULE: The frontend will be executed inside a container via `npm start`. You MUST include exactly `"start": "vite --host 0.0.0.0 --port 3000"` in the scripts section of your `package.json`.
        3. API CONNECTION: The FastAPI backend will be running on port 8000. You MUST configure `vite.config.js` to proxy `/api` requests to `http://localhost:8000` to avoid CORS issues."""
        
        human_prompt = "Plan:\n{plan}\n\nBackend Source Code:\n{backend_code}"
    
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt), 
            ("human", human_prompt)
        ])
        
        response = (prompt | llm).invoke({
            "plan": state.get('architecture_plan', ''),
            "backend_code": state.get("backend_code", "No backend code available.")
        })
        return {"frontend_code": response.content}

# --- NEW UTILITY: Extracted from your old file_saver_node ---
def write_files_to_disk(state: AutoPrototypeState, base_dir="output_prototype"):
    """Parses code blocks and writes them to the output directory so Docker can build them."""
    def parse_and_write(content, sub_folder):
        pattern = r"###\s+`?([\w\./_-]+\.\w+)`?\s+```\w*\n(.*?)```"
        blocks = re.findall(pattern, content, re.DOTALL)
        for file_path, code in blocks:
            # FIX: Prevent double-nesting if the LLM includes 'backend/' or 'frontend/' in the file path
            clean_path = file_path.strip()
            if clean_path.startswith(f"{sub_folder}/"):
                clean_path = clean_path[len(sub_folder)+1:]
                
            full_path = os.path.join(base_dir, sub_folder, clean_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w") as f:
                f.write(code.strip())

    if state.get("backend_code"):
        parse_and_write(state["backend_code"], "backend")
    if state.get("frontend_code"):
        parse_and_write(state["frontend_code"], "frontend")

# --- NEW: EXECUTION NODE ---
def execution_node(state: AutoPrototypeState) -> dict:
    print("--- Execution Node: Testing Code in Sandbox ---")
    
    # 1. Write the current state to disk so Docker can see it
    write_files_to_disk(state)
    
    # 2. Run the sandbox test
    sandbox = SandboxExecutor()
    logs = sandbox.test_prototype_and_get_logs()
    
    return {"execution_logs": logs}

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


# --- UPDATED: FILE SAVER ---
def file_saver_node(state: AutoPrototypeState) -> dict:
    print("--- Finalizing All Files ---")
    
    # Files are already written by execution_node, just save the metadata
    base_dir = "output_prototype"
    if state.get("architecture_plan"):
        with open(f"{base_dir}/architecture_plan.md", "w") as f:
            f.write(state["architecture_plan"])
            
    if state.get("error_messages"):
        print("--- WARNING: Unresolved bugs remain. Writing bug report. ---")
        with open(f"{base_dir}/unresolved_bugs.md", "w") as f:
            f.write("#Unresolved Bugs Report\n\n")
            f.write(f"## Final QA Feedback:\n{state['error_messages'][-1]}\n")
            
    return state
