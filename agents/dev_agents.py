import os
import re
from core.state import AutoPrototypeState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# --- BACKEND AGENT ---
def backend_agent_node(state: AutoPrototypeState) -> dict:
    print("--- Backend Agent Active ---")
    llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
    system_prompt = """You are a Senior Backend Engineer. Output the full FastAPI source code.
    Use this exact format for every file:
    ### app/path/to/file.py
    ```python
    [CODE]
    ```"""
    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "Plan: {plan}")])
    response = (prompt | llm).invoke({"plan": state["architecture_plan"]})
    return {"backend_code": response.content}

# --- FRONTEND AGENT ---
def frontend_agent_node(state: AutoPrototypeState) -> dict:
    print("--- Frontend Agent Active ---")
    llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
    system_prompt = """You are a Senior Frontend Engineer. Output the full React source code.
    Use this exact format for every file (including src/ and public/):
    ### src/components/Header.js
    ```javascript
    [CODE]
    ```
    Include App.js, index.js, package.json, and all components/pages from the plan."""
    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "Plan: {plan}")])
    response = (prompt | llm).invoke({"plan": state["architecture_plan"]})
    return {"frontend_code": response.content}

# --- FILE SAVER ---
def file_saver_node(state: AutoPrototypeState) -> dict:
    print("--- Parsing and Distributing All Files ---")
    base_dir = "output_prototype"
    
    # helper function to parse markdown blocks
    def parse_and_write(content, sub_folder):
        # Regex finds "### path/to/file" followed by a code block
        pattern = r"###\s+`?([\w\./_-]+)`?\s+```\w*\s+(.*?)\s+```"
        blocks = re.findall(pattern, content, re.DOTALL)
        
        for file_path, code in blocks:
            full_path = os.path.join(base_dir, sub_folder, file_path.strip())
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w") as f:
                f.write(code.strip())
            print(f" Saved {sub_folder}: {file_path}")

    # Process both Backend and Frontend
    if state.get("backend_code"):
        parse_and_write(state["backend_code"], "backend")
    if state.get("frontend_code"):
        parse_and_write(state["frontend_code"], "frontend")
    
    # Save the architecture plan too!
    if state.get("architecture_plan"):
        with open(f"{base_dir}/architecture_plan.md", "w") as f:
            f.write(state["architecture_plan"])
            
    return state