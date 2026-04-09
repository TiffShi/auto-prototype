# sandbox/executor.py
import docker
import os
import time

class SandboxExecutor:
    def __init__(self):
        self.client = docker.from_env()
        self.image_name = "autoprototype-secure-app"
        self.project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.output_dir = os.path.join(self.project_root, "output_prototype")
        self.dockerfile_path = os.path.join(self.project_root, "sandbox", "Dockerfile")

    def build_prototype_image(self):
        """Builds the Docker image using the generated prototype files."""
        print(f"Building secure image '{self.image_name}'...")
        
        self.client.images.build(
            path=self.output_dir,
            dockerfile=self.dockerfile_path,
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
                ports={'8000/tcp': 8000, '5173/tcp': 3000},
                name="autoprototype-live"
            )
            
            print("\n--- Servers are Live! ---")
            print("Backend API: http://localhost:8000/docs")
            print("Frontend UI: http://localhost:3000")
            print(f"Container ID: {container.id[:10]}")
            print("To stop: docker rm -f autoprototype-live")
            
            return container

        except docker.errors.APIError as e:
            print(f"Failed to start container: {e}")

    def test_prototype_and_get_logs(self) -> str:
        """Builds, runs briefly to catch startup errors, grabs logs, and cleans up."""
        try:
            print("-> Executor: Building image for mid-flight testing...")
            self.client.images.build(
                path=self.output_dir,
                dockerfile=self.dockerfile_path,
                tag=self.image_name,
                rm=True 
            )
            
            print("-> Executor: Spinning up container for 10 seconds to catch errors...")
            startup_command = (
                "bash -c '"
                "cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 & "
                "cd /app/frontend && npm start"
                "'"
            )
            
            container = self.client.containers.run(
                image=self.image_name,
                command=startup_command,
                detach=True,
                cap_drop=["ALL"]
            )
            
            # Wait for servers to attempt startup (npm start usually takes a few seconds to crash if broken)
            time.sleep(10)

            # Grab the combined logs
            logs = container.logs().decode("utf-8")
            
            # Clean up immediately
            container.stop()
            container.remove()
            
            print("-> Executor: Logs captured and container destroyed.")
            return logs

        except docker.errors.BuildError as e:
            # If the Dockerfile itself fails (e.g., bad requirements.txt), catch it
            build_logs = "".join([log.get('stream', '') for log in e.build_log])
            return f"DOCKER BUILD FAILED:\n{build_logs}"
        except Exception as e:
            return f"EXECUTION FAILED:\n{str(e)}"