import os
import re
import sys
from core.state import AutoPrototypeState
import anthropic
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

def get_app_root():
    """Returns the true directory of the app, whether running as a script or an .exe"""
    if getattr(sys, 'frozen', False):
        # Running as a compiled executable (return the folder containing the .exe)
        return os.path.dirname(sys.executable)
    else:
        # Running as a standard python script
        return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def _log_retry(retry_state):
    """Logs the retry countdown to the UI via the stdout redirector."""
    print(f"[SYSTEM] Claude API rate limit/timeout hit. Retrying in {retry_state.next_action.sleep:.1f} seconds...")

@retry(
    wait=wait_exponential(multiplier=2, min=5, max=60),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type((anthropic.RateLimitError, anthropic.APITimeoutError, anthropic.APIConnectionError)),
    before_sleep=_log_retry
)
def safe_invoke(chain, params):
    """Safely invokes a LangChain prompt|llm chain with exponential backoff."""
    return chain.invoke(params)

# --- DIFF UTILITY FUNCTION ---
def apply_patches(original_code: str, patch_text: str) -> str:
    pattern = r"<<<SEARCH\n(.*?)\n===REPLACE\n(.*?)\n>>>"
    matches = re.findall(pattern, patch_text, re.DOTALL)

    patched_code = original_code
    patch_count  = 0

    for search_block, replace_block in matches:
        if search_block in patched_code:
            patched_code = patched_code.replace(search_block, replace_block)
            patch_count += 1
        else:
            print("\n[PATCH FAILED] Could not locate exact search block in original code.")

    print(f"Applied {patch_count} patches successfully.")
    return patched_code

# --- FILE WRITER UTILITY ---
def write_files_to_disk(state: AutoPrototypeState):
    """Parses ### path/to/file.ext ``` code ``` blocks from each agent's output and writes
    them to the dynamic output directory selected by the user."""
    
    # 1. Grab the dynamic path from the UI! Fallback to local folder if missing.
    base_dir = state.get("project_dir", os.path.join(get_app_root(), "output_prototype"))

    def parse_and_write(content: str):
        pattern = r"###\s+`?([\w\./_-]+\.\w+)`?\s+```\w*\n(.*?)```"
        blocks  = re.findall(pattern, content, re.DOTALL)
        for file_path, code in blocks:
            # 2. Trust the LLM's path entirely (e.g. "backend/main.py", "database/schema.sql")
            clean_path = file_path.strip()
            full_path = os.path.join(base_dir, clean_path)
            
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(code.strip())

    if state.get("backend_code"):
        parse_and_write(state["backend_code"])

    if state.get("frontend_code"):
        parse_and_write(state["frontend_code"])

    if state.get("data_code"):
        # Correctly writes to both database/ and bucket/ inside the user's chosen project_dir
        parse_and_write(state["data_code"])