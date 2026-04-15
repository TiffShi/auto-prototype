# run_live.py
from sandbox.executor import SandboxExecutor

if __name__ == "__main__":
    sandbox = SandboxExecutor()
    
    # 1. Build the image (baking in the AI's generated code)
    sandbox.build_prototype_image()
    
    # 2. Run it securely
    sandbox.run_prototype()