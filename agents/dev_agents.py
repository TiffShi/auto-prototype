import os
import re
from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from sandbox.executor import SandboxExecutor

def devops_agent_node(state: AutoPrototypeState) -> dict:
    print("--- DevOps Agent Active ---")
    
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.1)
    
    system_prompt = """You are a Principal DevOps Engineer. 
    Your job is to read the generated frontend and backend code and provision the exact Docker infrastructure required to run it.

    You must output exactly two files using this format:
    ### Dockerfile
    ```dockerfile
    [CODE]
    ```
    ### startup.sh
    ```bash
    [CODE]
    ```

    CRITICAL RULES:
    1. The Dockerfile MUST use a base image that supports both the frontend and backend languages (e.g., node:18-bullseye, or a multi-stage build, or python:3.11 with Node installed).
    2. The Dockerfile MUST copy the `backend/` and `frontend/` folders into the container and install all dependencies (e.g., pip install, npm install).
    3. The `startup.sh` script MUST start BOTH servers in the background and keep the container alive. Use `&` to run processes in the background and `wait` at the end.
    4. Ensure the frontend proxy ports match the backend exposure ports.
    """
    
    human_prompt = "Stack Selected: {stack}\n\nArchitecture:\n{plan}\n\nBackend Code Summary:\n{backend}\n\nFrontend Code Summary:\n{frontend}"
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt)
    ])
    
    # We only send a summary (first 1000 chars) of the code to save tokens, 
    # as DevOps usually just needs to see the package.json/requirements.txt
    backend_snippet = state.get("backend_code", "")[:1000]
    frontend_snippet = state.get("frontend_code", "")[:1000]
    
    response = (prompt | llm).invoke({
        "stack": state.get("selected_stack_name", "Unknown"),
        "plan": state.get("architecture_plan", ""),
        "backend": backend_snippet,
        "frontend": frontend_snippet
    })
    
    content = response.content
    
    # Parse the outputs using Regex
    dockerfile_match = re.search(r"###\s*Dockerfile\s*```\w*\n(.*?)```", content, re.DOTALL)
    startup_match = re.search(r"###\s*startup\.sh\s*```\w*\n(.*?)```", content, re.DOTALL)
    
    return {
        "dockerfile_content": dockerfile_match.group(1).strip() if dockerfile_match else None,
        "startup_script_content": startup_match.group(1).strip() if startup_match else None
    }

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
        stack_name = state.get("selected_stack_name", "Python/FastAPI")
        system_prompt = f"""You are a Senior Backend Engineer. Output the full backend source code for the {stack_name} stack.
        Use this exact format for every file:
        ### backend/path/to/file.ext
        ```[language]
        [CODE]
        ```
        CRITICAL RULES:
        1. BOUNDARY LIMIT: You are strictly confined to backend logic. Output only backend source files and the appropriate dependency file (e.g., requirements.txt, package.json, etc.). 
        2. NO INFRASTRUCTURE: Do not generate any Dockerfiles or startup scripts. The DevOps agent will handle that.
        3. NETWORKING: Expose your API on a standard port for your framework. Document this port clearly in your comments so the frontend and DevOps agents know what to target."""
        
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
        stack_name = state.get("selected_stack_name", "React Vite")
        system_prompt = f"""You are a Senior Frontend Engineer. Output the full frontend source code for the {stack_name} stack.
        Use this exact format for every file:
        ### frontend/path/to/file.ext
        ```[language]
        [CODE]
        ```
        CRITICAL RULES:
        1. BOUNDARY LIMIT: You are strictly confined to frontend web logic. Output only frontend components, styles, configurations, and standard web assets.
        2. API CONNECTION: You must configure your frontend to proxy API requests to the backend. Read the backend code to determine the correct port to proxy to.
        3. SCRIPTS: Ensure your dependency file (e.g., package.json) includes a standard start script (like `npm start` or `npm run dev`) that binds to host `0.0.0.0`."""
        
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
    
    # 2. Run the sandbox test (MUST PASS STATE HERE)
    sandbox = SandboxExecutor()
    logs = sandbox.test_prototype_and_get_logs(state) 
    
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
