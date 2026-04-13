import os
import re
from core.state import AutoPrototypeState

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

# --- NEW UTILITY: Extracted from your old file_saver_node ---
def write_files_to_disk(state: AutoPrototypeState, base_dir="output_prototype"):
    """Parses code blocks and writes them to the output directory so Docker can build them."""
    def parse_and_write(content, sub_folder):
        pattern = r"###\s+`?([\w\./_-]+\.\w+)`?\s+```\w*\n(.*?)```"
        blocks = re.findall(pattern, content, re.DOTALL)
        for file_path, code in blocks:
            # FIX: Prevent double-nesting if the LLM includes 'backend/' or 'frontend/' in the file path
            clean_path = file_path.strip()
            if clean_path.startswith(f"{sub_folder}/"):
                clean_path = clean_path[len(sub_folder)+1:]
                
            full_path = os.path.join(base_dir, sub_folder, clean_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w") as f:
                f.write(code.strip())

    if state.get("backend_code"):
        parse_and_write(state["backend_code"], "backend")
    if state.get("frontend_code"):
        parse_and_write(state["frontend_code"], "frontend")