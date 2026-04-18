from core.state import AutoPrototypeState
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

# --- DEBUGGER AGENT ---
def debugger_node(state: AutoPrototypeState) -> dict:
    print("Debugger Agent Active (Analyzing Logs)")
    llm = ChatAnthropic(model="claude-sonnet-4-6", temperature=0.1)

    system_prompt = """You are a QA Reviewer and Tech Lead.
Review the Architecture Plan, all generated code layers, and the RUNTIME LOGS from the Docker Sandbox.

The system now runs using Docker Compose and logs may be grouped by service, for example:
===== SERVICE: db =====
===== SERVICE: backend =====
===== SERVICE: frontend =====
===== SERVICE: minio =====

CRITICAL CHECKLIST — verify each of the following:
1. Did Docker Compose fail to build or start any service?
2. Did the database fail to initialize? (SQL errors, connection refused, missing tables, bad seed/init order)
3. Did the backend crash? (Python tracebacks, ImportErrors, syntax errors, DB connection errors)
4. Did the frontend crash? (React/Vite compilation errors, missing env vars, runtime startup failure)
5. Did MinIO fail to start or create buckets? (only relevant if bucket files are present)
6. Are there networking/configuration issues? (wrong service name, wrong internal port, localhost used between containers)

If the logs show clear startup success across all layers with no crashes, output exactly: 'VERDICT: PASS'.

If there is any crash or error, output 'VERDICT: FAIL' followed by a root-cause analysis and explicit fix instructions for the relevant agent(s).

CRITICAL FORMATTING — always include all sections below, even if a section has no issues
(write "None" in that case). This is required so each agent can find its own feedback:

BACKEND ISSUES:
[Python/FastAPI/Express bugs, import errors, runtime crashes]

FRONTEND ISSUES:
[React/JS/package.json bugs, compilation errors, missing env vars]

DATABASE ISSUES:
[Schema errors, seed/init failures, connection string mismatches, missing tables]

BUCKET ISSUES:
[MinIO startup failures, bucket creation errors, SDK config issues]

DEVOPS ISSUES:
[Compose errors, bad ports, bad service names, wrong volume/init strategy, dependency issues]

INTEGRATION ISSUES:
[Backend cannot reach DB, frontend cannot reach backend, services using wrong hostnames/ports]
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", """Plan:
{plan}

Backend:
{backend}

Frontend:
{frontend}

Data Layer (database + bucket setup):
{data}

RUNTIME LOGS:
{logs}""")
    ])

    response = (prompt | llm).invoke({
        "plan": state["architecture_plan"],
        "backend": state.get("backend_code", ""),
        "frontend": state.get("frontend_code", ""),
        "data": state.get("data_code", "No data layer code generated."),
        "logs": state.get("execution_logs", "No logs available.")
    })

    content = response.content
    print(f"Debugger Output: {content[:150]}...")

    if "VERDICT: PASS" in content.upper():
        return {
            "error_messages": []
        }
    else:
        current_iterations = state.get("iteration_count", 0)
        return {
            "error_messages": state.get("error_messages", []) + [content],
            "iteration_count": current_iterations + 1
        }