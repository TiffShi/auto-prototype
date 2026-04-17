# sandbox/executor.py
import docker
import os
import time

class SandboxExecutor:
    def __init__(self):
        self.client = docker.from_env()
        self.image_name = "autoprototype-dynamic-app"
        self.project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    def _get_target_dir(self, state: dict) -> str:
        """Dynamically retrieve the correct project directory from state."""
        project_dir = state.get("project_dir", "frontend/output_prototype")
        if os.path.isabs(project_dir):
            return project_dir
        return os.path.join(self.project_root, project_dir)

    def _write_infra_files(self, state):
        """Helper to write the dynamically generated Dockerfile and startup script."""
        target_dir = self._get_target_dir(state)
        os.makedirs(target_dir, exist_ok=True)
        
        if state.get("dockerfile_content"):
            with open(os.path.join(target_dir, "Dockerfile"), "w", newline='\n') as f:
                f.write(state["dockerfile_content"])
                
        if state.get("startup_script_content"):
            script_path = os.path.join(target_dir, "startup.sh")
            with open(script_path, "w", newline='\n') as f:
                f.write(state["startup_script_content"])

    # --- FOR RUN_LIVE.PY ---
    def build_prototype_image(self, target_dir: str):
        """Builds the Docker image using the AI-generated prototype files."""
        print(f"Building dynamic image '{self.image_name}' from {target_dir}...")
        
        self.client.images.build(
            path=target_dir,
            tag=self.image_name,
            rm=True 
        )
        print("Image built successfully with AI-generated Dockerfile.")

    def run_prototype(self):
        """Spins up the container securely without host volume mounts."""
        print(f"Starting prototype dynamically in '{self.image_name}'...")

        try:
            container = self.client.containers.run(
                image=self.image_name,
                command="bash startup.sh",
                detach=True,
                cap_drop=["ALL"], # SECURITY: Drops root capabilities
                ports={'8080/tcp': 8080, '5173/tcp': 5173},
                name="autoprototype-live"
            )
            
            print("\n--- Servers are Live! ---")
            print(f"Container ID: {container.id[:10]}")
            print("Frontend running at: http://localhost:5173")
            print("Backend running at:  http://localhost:8080")
            print("To stop: docker rm -f autoprototype-live")
            
            return container

        except docker.errors.APIError as e:
            print(f"Failed to start container: {e}")

    # --- FOR LANGGRAPH WORKFLOW ---
    def test_prototype_and_get_logs(self, state) -> str:
        """Builds, runs briefly to catch startup errors, grabs logs, and cleans up."""
        self._write_infra_files(state)
        target_dir = self._get_target_dir(state)
        
        try:
            print(f" -> Executor: Building dynamic image from {target_dir} for mid-flight testing...")
            self.client.images.build(
                path=target_dir,
                tag=self.image_name,
                rm=True 
            )
            
            print(" -> Executor: Spinning up container for 10 seconds to catch errors...")
            
            container = self.client.containers.run(
                image=self.image_name,
                command="bash startup.sh",
                detach=True,
                cap_drop=["ALL"],
                name="autoprototype-test-run"
            )
            
            # Wait for servers to attempt startup
            time.sleep(10)

            # Grab the combined logs
            logs = container.logs().decode("utf-8")
            
            # Clean up immediately
            container.stop()
            container.remove()
            
            print(" -> Executor: Logs captured and container destroyed.")
            return logs

        except docker.errors.BuildError as e:
            fatal_error = e.msg
            build_logs = "".join([log.get('stream', '') for log in e.build_log])
            truncated_logs = build_logs[-2500:] if len(build_logs) > 2500 else build_logs
            return f"DOCKER BUILD FAILED:\nFatal Error: {fatal_error}\n\nLast Output:\n{truncated_logs}"
        except Exception as e:
            return f"EXECUTION FAILED:\n{str(e)}"