from sandbox.executor import SandboxExecutor

if __name__ == "__main__":
    sandbox = SandboxExecutor()
    
    # Build the image (baking in the AI's generated code)
    sandbox.build_prototype_image()
    
    # Run it securely
    sandbox.run_prototype()