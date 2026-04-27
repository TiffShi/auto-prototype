import sys
import os
import re
import time
import uuid
import shutil
import subprocess
from src.core.utils import get_app_root

class SandboxExecutor:
    """
    Manages the execution and teardown of Docker Compose environments.
    Responsible for writing generated code to disk, orchestrating containers, 
    and extracting isolated runtime logs for the QA Debugger.
    """
    def __init__(self):
        self.project_root = get_app_root()
        self.default_project_name = "autoprototype"

    def _get_target_dir(self, state: dict) -> str:
        """
        Dynamically retrieve the correct project directory from state.
        """
        project_dir = state.get("project_dir", "output_prototype")
        if os.path.isabs(project_dir):
            return project_dir
        return os.path.join(self.project_root, project_dir)

    def _docker_compose_cmd(self):
        """
        Detects the available Docker Compose executable.
        Prefers 'docker compose', but allow fallback to legacy 'docker-compose'.
        Returns a list suitable for subprocess, e.g. ['docker', 'compose'].
        """
        if shutil.which("docker"):
            try:
                kwargs = {}
                if sys.platform == "win32":
                    kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

                result = subprocess.run(
                    ["docker", "compose", "version"],
                    capture_output=True,
                    text=True,
                    encoding='utf-8',
                    errors='replace',
                    timeout=15,
                    **kwargs
                )
                if result.returncode == 0:
                    return ["docker", "compose"]
            except Exception:
                pass

        if shutil.which("docker-compose"):
            return ["docker-compose"]

        raise RuntimeError(
            "Docker Compose is not available. Install Docker Desktop / docker compose plugin "
            "or docker-compose."
        )

    def _parse_and_write_multifile_blocks(self, content: str, base_dir: str):
        """
        Parses blocks like:

        ### docker-compose.yml
        ```yaml
        ...
        ```

        ### backend/Dockerfile
        ```dockerfile
        ...
        ```

        and writes them to disk.
        """
        if not content:
            return

        # Matches the filepath header (Group 1) and the raw code payload (Group 2)
        pattern = r"###\s+`?([\w\./_-]+(?:\.\w+)?)`?\s+```[\w-]*\n(.*?)```"
        blocks = re.findall(pattern, content, re.DOTALL)

        for rel_path, code in blocks:
            rel_path = rel_path.strip()
            code = code.strip()

            full_path = os.path.join(base_dir, rel_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            with open(full_path, "w", newline="\n", encoding="utf-8") as f:
                f.write(code + "\n")

    def _write_infra_files(self, state: dict):
        """
        Writes infrastructure files for the generated prototype.
        Prioritizes the modern multi-file output (infra_code) while maintaining 
        backward compatibility with older single-container payloads.

        Preferred new format:
        - state['infra_code'] contains ### file blocks

        Backward-compatible fallback:
        - state['dockerfile_content']
        - state['startup_script_content']
        """
        target_dir = self._get_target_dir(state)
        os.makedirs(target_dir, exist_ok=True)

        infra_code = state.get("infra_code")
        if infra_code:
            self._parse_and_write_multifile_blocks(infra_code, target_dir)

    def _compose_file_exists(self, target_dir: str) -> bool:
        return (
            os.path.exists(os.path.join(target_dir, "docker-compose.yml"))
            or os.path.exists(os.path.join(target_dir, "docker-compose.yaml"))
        )

    def _run_subprocess(self, cmd, cwd, timeout=300):
        kwargs = {}
        # Prevent Windows from popping open a terminal window for the Docker subprocess
        if sys.platform == "win32":
            kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

        return subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=timeout,
            **kwargs
        )

    def _collect_compose_logs(self, compose_cmd, project_name: str, target_dir: str) -> str:
        """
        Collect logs per service in labeled sections so the debugger agent
        can reason about backend/frontend/database/minio separately.
        """
        ps_result = self._run_subprocess(
            compose_cmd + ["-p", project_name, "ps", "--services"],
            cwd=target_dir,
            timeout=60
        )

        services = [line.strip() for line in ps_result.stdout.splitlines() if line.strip()]
        if not services:
            # Fallback to general compose logs if service listing failed
            all_logs = self._run_subprocess(
                compose_cmd + ["-p", project_name, "logs", "--no-color"],
                cwd=target_dir,
                timeout=120
            )
            return (
                "===== COMPOSE GENERAL LOGS =====\n"
                f"{all_logs.stdout}\n"
                f"{all_logs.stderr}"
            )

        sections = []
        for svc in services:
            svc_logs = self._run_subprocess(
                compose_cmd + ["-p", project_name, "logs", "--no-color", svc],
                cwd=target_dir,
                timeout=120
            )
            sections.append(
                f"===== SERVICE: {svc} =====\n"
                f"{svc_logs.stdout}\n"
                f"{svc_logs.stderr}".strip()
            )

        return "\n\n".join(sections)

    def run_prototype(self):
        """Detached launcher for manually testing a successfully generated application."""
        target_dir = os.path.join(self.project_root, "output_prototype")

        if not self._compose_file_exists(target_dir):
            raise RuntimeError(
                "No docker-compose.yml found in the target directory. "
                "Generate compose infra first."
            )

        compose_cmd = self._docker_compose_cmd()
        project_name = f"{self.default_project_name}_{uuid.uuid4().hex[:6]}"

        print(f"Starting compose project '{project_name}' from {target_dir}...")

        result = self._run_subprocess(
            compose_cmd + ["-p", project_name, "up", "--build", "-d"],
            cwd=target_dir,
            timeout=600
        )

        if result.returncode != 0:
            raise RuntimeError(
                "Compose up failed.\n\n"
                f"STDOUT:\n{result.stdout}\n\nSTDERR:\n{result.stderr}"
            )

        print("\n--- Services are Live! ---")
        print(f"Compose Project: {project_name}")
        print("Frontend running at: http://localhost:5173")
        print("Backend running at: http://localhost:8080")
        print(f"To stop: {' '.join(compose_cmd)} -p {project_name} down -v")

    def test_prototype_and_get_logs(self, state) -> str:
        """
        Compose-first test flow:
        1. write generated infra files
        2. docker compose up --build -d
        3. wait briefly
        4. collect labeled logs per service
        5. docker compose down -v

        Returns a single log blob for the debugger agent.
        """
        self._write_infra_files(state)
        target_dir = self._get_target_dir(state)

        if not self._compose_file_exists(target_dir):
            return "EXECUTION FAILED:\ndocker-compose.yml was not found."

        compose_cmd = self._docker_compose_cmd()
        project_name = f"{self.default_project_name}_{uuid.uuid4().hex[:6]}"

        try:
            print(f" -> Executor: Starting compose test run from {target_dir}...")

            up_result = self._run_subprocess(
                compose_cmd + ["-p", project_name, "up", "--build", "-d"],
                cwd=target_dir,
                timeout=600
            )

            if up_result.returncode != 0:
                print(" -> Executor: Compose up failed! Harvesting container crash logs...")
                crash_logs = self._collect_compose_logs(compose_cmd, project_name, target_dir)
                return (
                    "DOCKER COMPOSE UP FAILED (Healthcheck or Build Error):\n\n"
                    f"--- COMPOSE OUTPUT ---\n{up_result.stderr}\n\n"
                    f"--- CONTAINER LOGS ---\n{crash_logs}"
                )

            # Wait period allows initialization scripts to fail and throw stack traces
            print(" -> Executor: Compose services started. Waiting 12 seconds for startup...")
            time.sleep(12)

            logs = self._collect_compose_logs(compose_cmd, project_name, target_dir)
            print(" -> Executor: Logs captured. Tearing down compose project...")
            return logs

        except subprocess.TimeoutExpired as e:
            return f"EXECUTION FAILED:\nCommand timed out: {e}"
        except Exception as e:
            return f"EXECUTION FAILED:\n{str(e)}"
        finally:
            try:
                down_result = self._run_subprocess(
                    compose_cmd + ["-p", project_name, "down", "-v", "--remove-orphans"],
                    cwd=target_dir,
                    timeout=180
                )
            except Exception as cleanup_error:
                print(f" -> Executor Cleanup Warning: {cleanup_error}")