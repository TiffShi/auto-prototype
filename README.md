# AutoPrototype

**Project Goal:** To build a fully autonomous, multi-agent workflow that transforms a natural language idea into a functional, multi-file software prototype. AutoPrototype dynamically selects tech stacks (e.g., React, FastAPI, Spring Boot) and writes, tests, and self-corrects its own code.

## Current Project Status: Frontend UI and Database Agent
The system has been heavily refactored for maintainability and scalability. Agents are now strictly separated by role, utility functions are isolated, and the Docker Sandbox features advanced dual-log parsing to catch both code compilation errors and infrastructure/engine failures.

## Technical Architecture: How it Works

AutoPrototype is a **State Machine** built with **LangGraph**. It mimics a real-world software team by passing context through a shared "Whiteboard" state.

```bash
auto-prototype/
├── agents/                   # Isolated AI Agent roles
│   ├── pm_agent.py           # Product Manager (Architecture & Stack Selection)
│   ├── backend_agent.py      # Backend Developer (Code Generation & Patching)
│   ├── frontend_agent.py     # Frontend Developer (Code Generation & Patching)
│   ├── devops_agent.py       # Infrastructure (Generates Dockerfile & startup.sh)
│   ├── debugger_agent.py     # QA/Tech Lead (Analyzes runtime logs)
│   └── system_nodes.py       # Deterministic nodes (Code Execution & File Saving)
├── core/                     # LangGraph Orchestration
│   ├── graph.py              # State Machine & Edge routing definitions
│   ├── state.py              # Shared "Whiteboard" (AutoPrototypeState)
│   └── utils.py              # Helper functions (Surgical Diff patching, File I/O)
├── sandbox/                  # The Execution Engine
│   └── executor.py           # Docker Python SDK integration 
├── output_prototype/         # THE GENERATED PRODUCT (AI-Built)
│   ├── architecture_plan.md
│   ├── backend/              # e.g., FastAPI, Spring Boot, or Express App
│   ├── frontend/             # e.g., React Vite App
│   ├── Dockerfile            # AI-generated infra
│   └── startup.sh            # AI-generated run script
├── .env                      # API Keys (Anthropic/OpenAI)
├── .gitignore                
├── requirements.txt          # Project dependencies
├── main.py                   # ENTRY POINT 1: Run the AI Factory loop
├── README.md                 # Project overview
└── run_live.py               # ENTRY POINT 2: Manually boot the generated prototype
```

### 1. The Shared State (`core/state.py`)
All agents communicate via the AutoPrototypeState. This dictionary persists throughout the run, holding the architecture plan, the raw code strings, generated Docker instructions, and runtime error logs.

### 2. The Agent Nodes (`agents/`)
* **Product Manager Agent**: High-level strategist. Defines the tech stack, functional requirements, and enforces strict networking rules (Ports 8080/5173).
* **Developer Agents**: Frontend and Backend coders. On their first pass, they write the full codebase. On subsequent passes, they use a Surgical Diff Strategy (<<<SEARCH and ===REPLACE>>>) to patch specific bugs without rewriting entire files.
* **DevOps Agent**: Reads a summary of the developers' code and dynamically provisions the infrastructure required to run it concurrently.
* **Debugger Agent**: The QA Lead. It reads the raw execution logs from the sandbox, determines if the build passed or failed, and routes targeted feedback back to the specific developers.

### 3. The Docker Sandbox (`sandbox/executor.py`)
Because autonomous code generation can be unpredictable, we execute the AI's code inside an isolated Docker container. The executor features Dual-Log Parsing:

1. Engine Errors: Captures fatal Docker Daemon failures (e.g., failing to pull a base image).
2. Stream Errors: Captures compiler and package manager errors (e.g., Maven, NPM, Python tracebacks), truncating them to the last 10,000 characters to prevent AI context-window overflow while ensuring the final stack trace is always visible.

### 4. The Workflow Graph (`core/graph.py`)
The flow is orchestrated as a directed relay with a conditional self-correction loop:

**Idea** → **PM** → **Backend Dev** → **Frontend Dev** → **DevOps** → **Executor** → **Debugger** → **Success**.
(If Debugger finds bugs, route back to Backend/Frontend. If max iterations hit or 0 bugs found, route to Success).
---

## Setup Instructions

Follow these steps to get the factory running on your local machine:

### 1. Prerequisites
* **Python 3.12** (WSL/Linux preferred).
* **Docker Desktop / Engine** (Must be running in the background).
* **Antropic API Key** (for Claude 3.5 Sonnet).

### 2. Installation
```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```
### 3. Environment Variables
```bash
# Create a .env file in the root:
ANTHROPIC_API_KEY=your_actual_key_here
```
### 4. Running the Workflow
```bash
python3 main.py
```
After the run completes, a debug_log.txt will be generated in the root which will trace the AI inputs/outputs. Check the output_prototype/ folder. You will find:

* startup.sh
* Dockerfile
* architecture_plan.md
* backend/
* frontend/