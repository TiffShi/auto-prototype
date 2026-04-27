# AutoPrototype

**Project Goal:** To build a fully autonomous, multi-agent workflow that transforms a natural language idea into a functional, multi-file software prototype. AutoPrototype dynamically selects tech stacks (e.g., React, FastAPI, Spring Boot) and writes, tests, and self-corrects its own code.

## Current Project Status: Multi-Service Orchestration & Desktop GUI
The system has been refactored for realism, scalability, and usability. 
* **Docker Compose Integration:** The DevOps agent now provisions a true microservice architecture, splitting the frontend, backend, database, and storage (MinIO) into isolated, networked containers.
* **Data Infrastructure Agent:** A dedicated Data Agent now handles SQL schema generation, idempotent data seeding, and object storage bucket policies. 
* **ArchitectAI GUI:** A rich PyQt6 desktop application now serves as the primary interface, featuring real-time log streaming, pipeline progress tracking, a dynamic file tree view, and live Docker container monitoring.

## Technical Architecture: How it Works

AutoPrototype is a **State Machine** built with **LangGraph**. It mimics a real-world software team by passing context through a shared "Whiteboard" state.

```bash
auto-prototype/
├── src/
│   ├── agents/               # Isolated AI Agent roles
│   │   ├── pm_agent.py       # Product Manager (Architecture, Stack & Storage Selection)
│   │   ├── backend_agent.py  # Backend Developer (Code Generation & Patching)
│   │   ├── frontend_agent.py # Frontend Developer (Code Generation & Patching)
│   │   ├── data_agent.py     # Data Engineer (DB Schemas, Seeding, MinIO Buckets)
│   │   ├── devops_agent.py   # Infrastructure (Generates Docker Compose & Dockerfiles)
│   │   ├── debugger_agent.py # QA/Tech Lead (Analyzes multi-service runtime logs)
│   │   └── system_nodes.py   # Deterministic nodes (Code Execution & File Saving)
│   ├── core/                 # LangGraph Orchestration
│   │   ├── graph.py          # State Machine & Edge routing definitions
│   │   ├── state.py          # Shared "Whiteboard" (AutoPrototypeState)
│   │   └── utils.py          # Helper functions (Surgical Diff patching, File I/O)
│   ├── gui/                  # Desktop Application (ArchitectAI)
│   │   ├── main_window.py    # Main window logic
│   │   ├── ui_autoprototype.py # Compiled UI layout
│   │   └── assets/           # SVGs and Icons
│   └── sandbox/              # The Execution Engine
│       └── executor.py       # Docker Compose Python SDK integration 
├── output_prototype/         # THE GENERATED PRODUCT (AI-Built)
│   ├── architecture_plan.md
│   ├── docker-compose.yml    # AI-generated orchestration
│   ├── backend/              # Source code + backend Dockerfile
│   ├── frontend/             # Source code + frontend Dockerfile
│   ├── database/             # SQL schemas, seed data, and init scripts
│   └── bucket/               # MinIO initialization scripts (if storage requested)
├── requirements.txt          # Project dependencies
├── architectai.spec          # PyInstaller spec for building standalone executables
├── installer.iss             # Inno Setup script for creating Windows installers
├── run_gui.py                # ENTRY POINT 1: Launch the PyQt6 Desktop UI
├── run_cli.py                # ENTRY POINT 2: CLI / Headless run 
└── README.md                 # Project overview
```

### 1. The Shared State (`core/state.py`)
All agents communicate via the **AutoPrototypeState**. This dictionary persists throughout the run, holding the architecture plan, the raw code strings, generated Docker instructions, and runtime error logs.

### 2. The Agent Nodes (`agents/`)
* **Product Manager Agent**: High-level strategist. Defines the tech stack, functional requirements, and enforces strict networking rules (Ports 8080/5173).
* **Developer Agents**: Frontend and Backend coders. On their first pass, they write the full codebase. On subsequent passes, they use a Surgical Diff Strategy (<<<SEARCH and ===REPLACE>>>) to patch specific bugs without rewriting entire files, saving tokens and preserving working logic.
* **Data Agent**: Provisions the data layer. Matches the backend ORM to create exact SQL schemas, writes idempotent seed scripts, and configures MinIO buckets for file uploads if the PM deems it necessary.
* **DevOps Agent**: Reads a summary of the developers' code and dynamically provisions a `docker-compose.yml` and associated `Dockerfile`s. It handles complex volume mount logic to ensure database init scripts run correctly based on the chosen schema strategy (e.g., native DB init vs. backend migrations like Flyway).
* **Debugger Agent**: The QA Lead. It reads the raw execution logs from the Docker Compose sandbox, determines if the build passed or failed, and targets specific feedback back to the responsible agent (Frontend, Backend, DB, or DevOps).

### 3. The Docker Sandbox (`sandbox/executor.py`)
Because autonomous code generation can be unpredictable, we execute the AI's code inside an isolated Docker Compose network. The executor features Multi-Service Log Parsing:

It orchestrates `docker compose up --build -d`, waits for the system to stabilize, and utilizes docker compose logs to capture output on a per-service basis. This allows the Debugger Agent to isolate exactly which container failed (e.g., PostgreSQL failing to seed vs. React failing to compile).

1. Engine Errors: Captures fatal Docker Daemon failures (e.g., failing to pull a base image).
2. Stream Errors: Captures compiler and package manager errors (e.g., Maven, NPM, Python tracebacks), truncating them to the last 10,000 characters to prevent AI context-window overflow while ensuring the final stack trace is always visible.

### 4. The Workflow Graph (`core/graph.py`)
The flow is orchestrated as a directed relay with a conditional self-correction loop:

**Idea** → **PM** → **Backend Dev** → **Frontend Dev** → **Data** → **DevOps** → **Executor** → **Debugger** → **Success/Save**.

(If the Debugger finds bugs, it routes back to the Backend Agent to begin the patching cascade. If max iterations are hit or zero bugs are found, it routes to the final Saver node).

## Setup Instructions (Run from Source)

### 1. Prerequisites
* **Python 3.12** (WSL/Linux preferred).
* **Docker Desktop / Engine** (Must be running in the background).
* **Antropic API Key** (for Claude 3.5 Sonnet).

### 2. Installation

Nagivate to the root of the project and run:

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```
### 3. Environment Variables

You can configure your API key directly inside the AutoPrototype Desktop GUI via Settings > Preferences

### 4. Running the Application
#### The Desktop GUI 
Launch the AutoPrototype visual interface. This provides live streaming logs, file generation tracking, and Docker container management.

```bash
python3 run_gui.py
```
After the run completes, check the prototype output directory folder. You will find:

* docker-compose.yml
* pipeline_execution.log
* architecture_plan.md
* backend/
* frontend/
* database/ (if any database was selected)
* bucket/ (if any bucket was selected)
* unresolved_bugs.md (if any bugs weren't resolved)