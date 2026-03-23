import docker
import os

class SandboxExecutor:
    def __init__(self):
        # This connects to the Docker daemon running on your machine
        self.client = docker.from_env()
        self.image_name = "autoprototype-sandbox"

    def build_image(self):
        """Builds the base Docker image from your Dockerfile."""
        print(f"Building image '{self.image_name}'...")
        dockerfile_path = os.path.dirname(os.path.abspath(__file__))
        
        self.client.images.build(
            path=dockerfile_path,
            tag=self.image_name,
            rm=True # Removes intermediate containers after a successful build
        )
        print("Image built successfully.")

    def run_python_code(self, code_string: str) -> dict:
        """
        Spins up a container, runs the provided Python code, 
        returns the logs, and immediately destroys the container.
        """
        # Command to run the string directly in Python
        command = ["python", "-c", code_string]

        try:
            # run() automatically creates, starts, and waits for the container to finish
            # remove=True ensures the container is deleted instantly after running
            logs = self.client.containers.run(
                image=self.image_name,
                command=command,
                remove=True,
                stderr=True, # Capture errors
                stdout=True  # Capture print statements
            )
            
            return {
                "status": "success",
                "output": logs.decode('utf-8').strip(),
                "error": None
            }

        except docker.errors.ContainerError as e:
            # If the code crashes (e.g., SyntaxError), it throws a ContainerError
            return {
                "status": "error",
                "output": None,
                "error": e.stderr.decode('utf-8').strip()
            }