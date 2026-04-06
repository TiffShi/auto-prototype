import os
import re
from core.state import AutoPrototypeState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

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
    llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
    
    is_fix_mode = iteration > 0
    previous_code = state.get("backend_code", "")

    if is_fix_mode:
        system_prompt = "You are a Senior Backend Engineer fixing bugs."
        human_prompt = f"""TASK: SURGICAL BUG FIX (DIFF STRATEGY).
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
        {state["error_messages"][-1]}"""
    else:
        system_prompt = """You are a Senior Backend Engineer. Output the full FastAPI source code.
        Use this exact format for every file:
        ### app/path/to/file.py
        ```python
        [CODE]
        ```"""
        human_prompt = f"Plan: {state.get('architecture_plan', '')}"

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt), 
        ("human", human_prompt)
    ])
    
    response = (prompt | llm).invoke({})
    
    # NEW: Apply the diff patch if we are in fix mode
    if is_fix_mode:
        new_code = apply_patches(previous_code, response.content)
        return {"backend_code": new_code}
    else:
        return {"backend_code": response.content}

# --- FRONTEND AGENT ---
def frontend_agent_node(state: AutoPrototypeState) -> dict:
    iteration = state.get('iteration_count', 0)
    print(f"--- Frontend Agent Active (Iteration {iteration}) ---")
    llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
    
    is_fix_mode = iteration > 0
    previous_code = state.get("frontend_code", "")

    if is_fix_mode:
        system_prompt = "You are a Senior Frontend Engineer fixing bugs."
        human_prompt = f"""TASK: SURGICAL BUG FIX (DIFF STRATEGY).
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
        {state.get("backend_code", "No backend code available.")}
        
        PREVIOUS FRONTEND CODE:
        {previous_code}
        
        DEBUGGER FEEDBACK:
        {state["error_messages"][-1]}"""
    else:
        system_prompt = """You are a Senior Frontend Engineer. Output the full React source code.
        Use this exact format for every file (including src/ and public/):
        ### src/components/Header.js
        ```javascript
        [CODE]
        ```
        CRITICAL: Ensure your frontend makes API calls that exactly match the backend routes."""
        human_prompt = f"""Plan:\n{state.get('architecture_plan', '')}\n\nBackend Source Code:\n{state.get("backend_code", "No backend code available.")}"""
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt), 
        ("human", human_prompt)
    ])
    
    response = (prompt | llm).invoke({})
    
    # NEW: Apply the diff patch if we are in fix mode
    if is_fix_mode:
        new_code = apply_patches(previous_code, response.content)
        return {"frontend_code": new_code}
    else:
        return {"frontend_code": response.content}

# --- DEBUGGER AGENT ---
def debugger_node(state: AutoPrototypeState) -> dict:
    print("--- Debugger Agent Active ---")
    llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
    
    system_prompt = """You are a QA Reviewer and Tech Lead. 
    Review the Architecture Plan, Backend Code, and Frontend Code.

    CRITICAL CHECKLIST - You must verify the following before passing:
    1. Cross-File Imports: Verify functions like `get_db` are defined before being imported.
    2. Dependency Versions: `react-scripts` must be at least `5.0.0` in package.json.
    3. Standard Libraries: `sqlite3` must NOT be in requirements.txt.
    4. Endpoint Alignment: Frontend fetch/axios calls must match backend routes.

    If everything is perfect, output exactly: 'VERDICT: PASS'.
    If any rule is broken, output 'VERDICT: FAIL' followed by explicit instructions on what file to fix and how to fix it."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Plan:\n{plan}\n\nBackend:\n{backend}\n\nFrontend:\n{frontend}")
    ])
    
    response = (prompt | llm).invoke({
        "plan": state["architecture_plan"],
        "backend": state.get("backend_code", ""),
        "frontend": state.get("frontend_code", "")
    })
    
    content = response.content
    print(f"Debugger Output: {content[:100]}...")
    
    if "VERDICT: PASS" in content.upper():
        return {"error_messages": []}
    else:
        current_iterations = state.get("iteration_count", 0)
        return {
            "error_messages": state.get("error_messages", []) + [content],
            "iteration_count": current_iterations + 1
        }

# --- FILE SAVER ---
def file_saver_node(state: AutoPrototypeState) -> dict:
    print("--- Parsing and Distributing All Files ---")
    base_dir = "output_prototype"
    
    def parse_and_write(content, sub_folder):
        pattern = r"###\s+`?([\w\./_-]+)`?\s+```\w*\s+(.*?)\s+```"
        blocks = re.findall(pattern, content, re.DOTALL)
        
        for file_path, code in blocks:
            full_path = os.path.join(base_dir, sub_folder, file_path.strip())
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w") as f:
                f.write(code.strip())

    if state.get("backend_code"):
        parse_and_write(state["backend_code"], "backend")
    if state.get("frontend_code"):
        parse_and_write(state["frontend_code"], "frontend")
    if state.get("architecture_plan"):
        with open(f"{base_dir}/architecture_plan.md", "w") as f:
            f.write(state["architecture_plan"])
            
    if state.get("error_messages"):
        print("--- WARNING: Unresolved bugs remain. Writing bug report. ---")
        with open(f"{base_dir}/unresolved_bugs.md", "w") as f:
            f.write("# 🚨 Unresolved Bugs Report\n\n")
            f.write("The AI workflow reached the maximum iteration limit. The following issues could not be resolved by the agents:\n\n")
            f.write(f"## Final QA Feedback:\n{state['error_messages'][-1]}\n")
            
    return state