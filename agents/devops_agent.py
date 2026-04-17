import re
from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

def devops_agent_node(state: AutoPrototypeState) -> dict:
    print("DevOps Agent Active")

    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.1)

    bucket_needed = state.get("bucket_needed", False)
    db_readme     = _extract_section(state.get("data_code", ""), "database/README.md")
    bucket_readme = _extract_section(state.get("data_code", ""), "bucket/README.md") if bucket_needed else ""

    system_prompt = """You are a Principal DevOps Engineer.
    Your job is to read the generated frontend, backend, and data layer code and provision the exact
    Docker infrastructure required to run the entire stack in ONE container.

    You must output exactly two files using this format:
    ### Dockerfile
    ```dockerfile
    [CODE]
    ```
    ### startup.sh
    ```bash
    [CODE]
    ```

    CRITICAL RULES — Dockerfile:
    1. Use a base image that supports both frontend and backend languages.
       Node-only stack: node:18-bullseye
       Python+Node stack: python:3.11-bullseye with Node installed via apt or nvm.
    2. Copy backend/, frontend/, and database/ into the container and install all dependencies.
    3. If bucket_needed=True, also copy bucket/ and install the minio Python package.
    4. Always EXPOSE 8080 5173. If bucket_needed=True: also EXPOSE 9000 9001.
    5. DATABASE INSTALLATION: You must install the correct database server package via apt-get for: {selected_db_name}. 
       (e.g., if PostgreSQL, install `postgresql`; if MongoDB, install `mongodb`; if SQLite, no server package is needed). Ensure the data directory is writable.
    6. RUN pip install / npm install inside the Dockerfile so deps are baked into the image layer.

    CRITICAL RULES — startup.sh:
    Start ALL services in the background with & and call wait at the end.

    Startup ORDER must be:
      1. Database Server: Start the {selected_db_name} service in the background (unless it is SQLite, which needs no server).
         Then run the generated init scripts (e.g., `bash /app/database/*_setup.sh` or `python /app/database/init_db.py`).
      2. sleep 2   ← give the DB time to be ready before the backend connects
      3. MinIO (only if bucket_needed=True): run `bash /app/bucket/minio_setup.sh`
      4. Backend server on port 8080 (in background with &)
      5. Frontend dev server on port 5173 (in background with &)
      6. wait

    Environment variables to export before starting the backend:
      - DATABASE_URL  (from the database README — use the correct value for the chosen engine)
      - If bucket_needed=True:
          export MINIO_ENDPOINT=localhost:9000
          export MINIO_ROOT_USER=minioadmin
          export MINIO_ROOT_PASSWORD=minioadmin
    """

    human_prompt = """Stack: {stack}

Architecture Plan:
{plan}

Backend Code (first 1000 chars):
{backend}

Frontend Code (first 1000 chars):
{frontend}

Database README (tells you which engine was chosen and what DATABASE_URL to export):
{db_readme}

bucket_needed: {bucket_needed}
{bucket_section}
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt)
    ])

    response = (prompt | llm).invoke({
        "stack":            state.get("selected_stack_name", "Unknown"),
        "selected_db_name": state.get("selected_db_name", "PostgreSQL"), # <-- PASS DB NAME TO DEVOPS
        "plan":             state.get("architecture_plan", ""),
        "backend":          state.get("backend_code", "")[:1000],
        "frontend":         state.get("frontend_code", "")[:1000],
        "db_readme":        db_readme or "(no database README found — check data_code)",
        "bucket_needed":    bucket_needed,
        "bucket_section":   f"Bucket README:\n{bucket_readme}" if bucket_needed else ""
    })

    content = response.content

    dockerfile_match = re.search(r"###\s*Dockerfile\s*```\w*\n(.*?)```",   content, re.DOTALL)
    startup_match    = re.search(r"###\s*startup\.sh\s*```\w*\n(.*?)```",  content, re.DOTALL)

    print("DevOps Agent Finished")
    return {
        "dockerfile_content":     dockerfile_match.group(1).strip() if dockerfile_match else None,
        "startup_script_content": startup_match.group(1).strip()    if startup_match    else None,
    }


def _extract_section(data_code: str, filename: str) -> str:
    """Pull a specific file's content out of the data agent's multi-file output string."""
    if not data_code:
        return ""
    # Match ### database/README.md or ### bucket/README.md etc.
    escaped = re.escape(filename)
    match = re.search(rf"###\s+{escaped}\s+```\w*\n(.*?)```", data_code, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""
