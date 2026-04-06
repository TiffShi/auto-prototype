# sandbox/executor.py
import docker
import os

class SandboxExecutor:
    def __init__(self):
        self.client = docker.from_env()
        self.image_name = "autoprototype-secure-app"

    def build_prototype_image(self):
        """Builds the Docker image using the generated prototype files."""
        print(f"Building secure image '{self.image_name}'...")
        
        # The context must be the project root so Docker can access 'output_prototype'
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        dockerfile_path = os.path.join(project_root, "sandbox", "Dockerfile")
        
        self.client.images.build(
            path=project_root,
            dockerfile=dockerfile_path,
            tag=self.image_name,
            rm=True 
        )
        print("Image built successfully with pre-baked dependencies.")

    def run_prototype(self):
        """Spins up the container securely without host volume mounts."""
        print(f"Starting prototype securely in '{self.image_name}'...")
        
        # Dependencies are already installed, so we just start the servers
        startup_command = (
            "bash -c '"
            "cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 & "
            "cd /app/frontend && npm start"
            "'"
        )

        try:
            container = self.client.containers.run(
                image=self.image_name,
                command=startup_command,
                detach=True,
                cap_drop=["ALL"], # SECURITY: Drops root capabilities to prevent container escape
                ports={'8000/tcp': 8000, '3000/tcp': 3000},
                name="autoprototype-live"
            )
            
            print("\n--- Servers are Live! ---")
            print("Backend API: http://localhost:8000/docs")
            print("Frontend UI: http://localhost:3000")
            print(f"Container ID: {container.id[:10]}")
            print("To stop: docker stop autoprototype-live && docker rm autoprototype-live")
            
            return container

        except docker.errors.APIError as e:
            print(f"Failed to start container: {e}")