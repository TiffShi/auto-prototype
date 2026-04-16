import re
from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

def devops_agent_node(state: AutoPrototypeState) -> dict:
    print("DevOps Agent Active")
    
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
    3. The Dockerfile MUST explicitly `EXPOSE 8080 5173`.
    4. The `startup.sh` script MUST start BOTH servers in the background and keep the container alive. Use `&` to run processes in the background and `wait` at the end. Ensure the backend starts on 8080 and the frontend starts on 5173.
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

    print("DevOps Agent Finished")
    
    return {
        "dockerfile_content": dockerfile_match.group(1).strip() if dockerfile_match else None,
        "startup_script_content": startup_match.group(1).strip() if startup_match else None
    }