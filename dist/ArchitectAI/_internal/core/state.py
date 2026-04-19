# core/state.py
from typing import TypedDict, List, Optional

class AutoPrototypeState(TypedDict):
    # The input
    user_idea: str

    project_dir: Optional[str]

    # The PM's high-level stack choice (e.g., "Vue/Express")
    selected_stack_name: Optional[str]
    selected_db_name: Optional[str]

    # The PM's output
    architecture_plan: Optional[str]
    file_structure: Optional[dict]

    # The Builders' output
    frontend_code: Optional[str]
    backend_code: Optional[str]

    # The Data agent's output (database + optional object storage)
    data_code: Optional[str]        # All generated files: schema.sql, seed.sql, init_db.py,
                                    # and optionally bucket/init_bucket.py, bucket/minio_setup.sh
    bucket_needed: Optional[bool]   # Set by the data agent; False = skip MinIO entirely

    # The DevOps output
    infra_code: Optional[str]

    # The Debugger's workflow
    execution_logs: Optional[str]
    error_messages: List[str]
    iteration_count: int
