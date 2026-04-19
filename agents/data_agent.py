from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from core.utils import apply_patches, safe_invoke

# --- DATA AGENT (Database + Object Storage) ---
def data_agent_node(state: AutoPrototypeState) -> dict:
    iteration = state.get('iteration_count', 0)
    print(f"Data Agent Active (Iteration {iteration})")
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.1)

    is_fix_mode = iteration > 0
    previous_code = state.get("data_code", "")

    if is_fix_mode:
        system_prompt = "You are a Senior Data Infrastructure Engineer fixing bugs."
        human_prompt = """TASK: SURGICAL BUG FIX (DIFF STRATEGY).
        You must fix the bugs identified by the QA Debugger in the existing database/storage setup code.
        
        CRITICAL: DO NOT OUTPUT THE FULL CODEBASE.
        Output ONLY the specific chunks that need to be changed using SEARCH and REPLACE blocks.
        Include enough surrounding lines in the SEARCH block so it is unique.
        
        FORMAT:
        <<<SEARCH
        [exact code to find in the original file]
        ===REPLACE
        [the new updated code]
        >>>
        
        PREVIOUS DATA CODE:
        {previous_code}
        
        DEBUGGER FEEDBACK:
        {feedback}
        
        CRITICAL DOMAIN INSTRUCTION: You are the Data Engineer. ONLY fix issues listed under 
        "DATABASE ISSUES" or "BUCKET ISSUES" in the debugger feedback. Ignore all other sections.
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", human_prompt)
        ])

        response = safe_invoke(prompt | llm, {
            "previous_code": previous_code,
            "feedback": state["error_messages"][-1]
        })
        new_code = apply_patches(previous_code, response.content)
        return {"data_code": new_code}

    else:
        system_prompt = """You are a Senior Data Infrastructure Engineer. Analyze the architecture plan
        and backend code to provision the database layer AND (if required) object storage.

        PART 1 — DATABASE

        The Product Manager has selected the following database engine: {selected_db_name}
        You MUST build the database layer using {selected_db_name}.

        Always output these database files:
        1. `database/schema.sql`
           CREATE TABLE / CREATE INDEX statements that exactly match the backend ORM's model names,
           column names, and types.
         2. `database/seed.sql`
            Generate realistic sample data (5–10 rows per core table) so the UI is populated on first run.

            Rules:
            - Seed SQL must be compatible with both the selected database engine and the generated schema.
            - Make seeding idempotent using the native safe-insert/upsert pattern supported by that database.
            - Do not assume any specific sequence, auto-increment, identity, or conflict syntax unless it is explicitly supported by the generated schema.
            - If explicit IDs are inserted, they must remain consistent with the schema's key-generation strategy.
            - Prefer natural keys / unique business fields for idempotent inserts when possible.
            - The seed file must run successfully on a fresh database and must not break when re-applied in the normal dev workflow.
         3. `database/init_db.*` (Extension matches backend language)
           Standalone script written in the SAME language as the backend stack (e.g., .js for Node, .py for Python, .ts for Deno) that:
             a) Reads DATABASE_URL from the environment.
             b) Connects to the DB using the standard driver for that language.
             c) Runs schema.sql then seed.sql idempotently.
        4. `database/README.md`
           Which engine was chosen and why, the DATABASE_URL env var value, and the command to run
           the init script manually.

        If a standalone database container (like PostgreSQL, MySQL, or MongoDB) was chosen, also output:
        5. `database/db_container_setup.sh`
           Shell script to initialize the data dir, start the database engine, create the database, and run schema/seed files if applicable. Must run as root on Debian/Ubuntu inside a container

        PART 2 — OBJECT STORAGE (MinIO)

        The Product Manager has determined if object storage is required:
        STORAGE REQUIRED: {storage_required}

        If STORAGE REQUIRED is False — do not output any bucket/ files. Proceed directly to outputting database files.

        If STORAGE REQUIRED is True — output these bucket files after the database files:
        1. `bucket/init_bucket.py`
           Uses the minio Python SDK to:
             a) Connect to MinIO at localhost:9000 using env vars MINIO_ROOT_USER and MINIO_ROOT_PASSWORD.
             b) Create the required bucket(s) (infer names from the architecture, e.g. "user-uploads").
             c) Set bucket policy to public-read if the frontend displays files directly,
                or private if the backend signs URLs.
             d) Be idempotent — check bucket_exists before make_bucket.
        2. `bucket/minio_setup.sh`
           Downloads the MinIO binary to /usr/local/bin/minio, chmod +x.
           Starts MinIO in background on port 9000 (API) and 9001 (console).
           Waits 3 seconds, then runs `python /app/bucket/init_bucket.py`.
           Binary URL: https://dl.min.io/server/minio/release/linux-amd64/minio
        3. `bucket/README.md`
           Which buckets were created, MinIO console URL (localhost:9001, login: minioadmin/minioadmin),
           env vars the backend must use (MINIO_ENDPOINT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD,
           MINIO_BUCKET_NAME), and a short example presigned upload URL snippet.

        ============================================================
        OUTPUT FORMAT — use this exact format for every file:
        ### path/to/file.ext
        ```[language]
        [CODE]
        ```

        GLOBAL RULES:
        1. Always use DATABASE_URL env var for DB connections.
           SQLite default:     sqlite:///./app.db
           PostgreSQL default: postgresql://postgres:postgres@localhost:5432/appdb
           Redis default:      redis://localhost:6379/0
        2. Schema must match the backend ORM exactly — do not redefine models.
        3. SQLite needs NO server process — do not add postgres packages if SQLite was chosen.
        4. Do NOT output any Dockerfile or startup.sh — the DevOps agent owns those.
        5. Do NOT output any backend application code — the Backend agent owns that.
        """

        human_prompt = """Architecture Plan:
{plan}

Backend Source Code (match ORM model names/columns/types exactly):
{backend_code}
"""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", human_prompt)
        ])

        # Retrieve values from state (with defaults)
        db_name = state.get("selected_db_name", "PostgreSQL")
        bucket_req = state.get("bucket_needed", False)

        response = safe_invoke(prompt | llm, {
            "plan": state.get("architecture_plan", ""),
            "backend_code": state.get("backend_code", "No backend code available."),
            "selected_db_name": db_name,
            "storage_required": bucket_req
        })

        content = response.content

        print(f"Data Agent Finished (bucket_needed={bucket_req})")
        return {
            "data_code": content,
        }