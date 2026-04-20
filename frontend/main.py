import sys
import os
import traceback
import docker
import re
import uuid
import webbrowser
import subprocess
from docker.errors import NotFound, APIError
from datetime import datetime

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.utils import get_app_root

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QListWidgetItem,
    QTreeWidgetItem, QTableWidgetItem, QHeaderView, QWidget, QHBoxLayout, QVBoxLayout, QLabel, 
    QMessageBox, QGraphicsDropShadowEffect, QDialog, QFormLayout, QLineEdit, 
    QDialogButtonBox, QFileDialog, QInputDialog, QPushButton, QTextBrowser
)

from PyQt6.QtCore import Qt, QThread, pyqtSignal, QSize, QVariantAnimation, QObject, QTimer, QSettings
from PyQt6.QtGui import QColor, QTextCharFormat, QTextCursor, QTextBlockFormat, QIcon, QFont, QFontMetrics, QPixmap, QPainter

# the generated UI class
from ui_architectai import Ui_MainWindow
from core.graph import create_graph
from core import graph as graph_module  
from dotenv import load_dotenv

def get_resource_path(relative_path):
    """Get the absolute path to a resource, working for both dev and PyInstaller."""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        # If not running as a bundled exe, use the current directory
        base_path = os.path.dirname(os.path.abspath(__file__))

    return os.path.join(base_path, relative_path).replace("\\", "/") # PyQt urls prefer forward slashes
    
# --- UI AGENT METADATA ---
# Maps LangGraph node names to UI rendering properties (colors, icons, progress milestones)
AGENTS = {
    "pm":       {"index": 0,    "log_name": "[PM]","name": "Program Manager", "role": "ORCHESTRATOR",   "color": "#3b82f6", "icon_file": "pm_icon.svg", "progress": 10},
    "backend":  {"index": 1,    "log_name": "[BACKEND]","name": "Backend", "role": "API / SERVICES", "color": "#a855f7", "icon_file": "backend_icon.svg", "progress": 25},
    "frontend": {"index": 2,    "log_name": "[FRONTEND]","name": "Frontend", "role": "UI / UX AGENT",  "color": "#22c55e", "icon_file": "frontend_icon.svg", "progress": 40},
    "data":     {"index": 3,    "log_name": "[DATA]",    "name": "Data Layer",      "role": "DB & STORAGE",   "color": "#eab308", "icon_file": "data_icon.svg", "progress": 55}, # <-- NEW AGENT
    "devops":   {"index": 4,    "log_name": "[DEVOPS]","name": "DevOps", "role": "INFRA / DOCKER", "color": "#0ea5e9", "icon_file": "devops_icon.svg", "progress": 70},
    "executor": {"index": 5,    "log_name": "[EXEC]","name": "Exec Node", "role": "EXECUTION NODE", "color": "#f97316", "icon_file": "execution_icon.svg", "progress": 85},
    "debugger": {"index": 6,    "log_name": "[DEBUG]","name": "Debugger", "role": "REVIEW / FIX",   "color": "#db5151", "icon_file": "debugger_icon.svg", "progress": 95},
    "saver":    {"index": None, "log_name": "[SAVER]","name": "Saver", "role": "FILE SAVER", "color": "#64748b", "icon_file": "💾", "progress": 100},
}

# --- STDOUT REDIRECTOR ---
class EmittingStream(QObject):
    """
    Intercepts stdout (print statements) from the backend LangChain processes 
    and emits them as PyQt signals to safely update the GUI thread.
    """
    textWritten = pyqtSignal(str, str, str) # tag, message, color

    def __init__(self):
        super().__init__()
        self.current_tag = "[SYSTEM]"
        self.current_color = "#c8d4e8"

    def write(self, text):
        if text.strip():
            self.textWritten.emit(self.current_tag, text, self.current_color)

    def flush(self):
        pass


class LauncherWorker(QThread):
    """Background worker for spinning up Docker Compose environments."""
    log_line = pyqtSignal(str, str, str)  # agent, message, color
    finished_launch = pyqtSignal(bool)

    def __init__(self, project_dir, project_name):
        super().__init__()
        self.project_dir = project_dir
        self.project_name = project_name.lower().replace("_", "-") 

    def run(self):
        try:
            self.log_line.emit("[SYSTEM]", f"Spinning up Docker Compose for '{self.project_name}'...", "#3b82f6")
            safe_project_name = f"autoprototype-{self.project_name}"

            # Prevent Windows terminal popup
            kwargs = {}
            if sys.platform == "win32":
                kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

            # Run docker compose up --build -d in the project directory
            process = subprocess.Popen(
                ["docker", "compose", "-p", safe_project_name, "up", "--build", "-d"],
                cwd=self.project_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                errors='replace',
                **kwargs
            )

            # Stream the output live to your UI logs!
            for line in process.stdout:
                if line.strip():
                    # We'll tag compose logs as DevOps for visual consistency
                    self.log_line.emit("[DEVOPS]", line.strip(), "#0ea5e9")

            process.wait()

            if process.returncode == 0:
                self.log_line.emit("[SYSTEM]", "Prototype is LIVE!", "#22c55e")
                self.log_line.emit("[SYSTEM]", "Frontend: http://localhost:5173", "#22c55e")
                self.log_line.emit("[SYSTEM]", "Backend: http://localhost:8080", "#22c55e")
                self.finished_launch.emit(True)
            else:
                self.log_line.emit("[SYSTEM]", f"Launch failed with exit code {process.returncode}", "#ef4444")
                self.finished_launch.emit(False)

        except FileNotFoundError:
            self.log_line.emit("[SYSTEM]", "Launch failed: 'docker compose' command not found. Is Docker installed and in your PATH?", "#ef4444")
            self.finished_launch.emit(False)
        except Exception as e:
            self.log_line.emit("[SYSTEM]", f"Launch failed: {str(e)}", "#ef4444")
            self.finished_launch.emit(False)

class StopperWorker(QThread):
    """Background worker to safely tear down running Docker Compose stacks."""
    log_line = pyqtSignal(str, str, str)
    finished_stop = pyqtSignal(bool)

    def __init__(self, container_name):
        super().__init__()
        self.container_name = container_name
        try:
            self.client = docker.from_env()
        except Exception:
            self.client = None

    def run(self):
        if not self.client:
            self.log_line.emit("[SYSTEM]", "Failed to connect to Docker.", "#ef4444")
            self.finished_stop.emit(False)
            return

        try:
            self.log_line.emit("[SYSTEM]", f"Preparing to destroy '{self.container_name}'...", "#eab308")
            
            container = self.client.containers.get(self.container_name)
            labels = container.attrs.get('Config', {}).get('Labels', {})
            
            project_dir = labels.get('com.docker.compose.project.working_dir')
            # Extract the custom project name we injected during launch
            compose_project = labels.get('com.docker.compose.project')

            if project_dir and compose_project and os.path.exists(project_dir):
                self.log_line.emit("[DEVOPS]", f"Running compose down for '{compose_project}'...", "#0ea5e9")

                # Prevent Windows terminal popup
                kwargs = {}
                if sys.platform == "win32":
                    kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

                # -> PASS THE -p FLAG TO DESTROY <-
                process = subprocess.run(
                    ["docker", "compose", "-p", compose_project, "down"], 
                    cwd=project_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    encoding='utf-8',    # <-- Tell Windows to expect modern characters
                    errors='replace',    # <-- If it hits an impossible character, swap it for a '?' instead of crashing
                    **kwargs
                )
                
                if process.returncode == 0:
                    self.log_line.emit("[SYSTEM]", f"Prototype stack destroyed successfully.", "#ef4444")
                    self.finished_stop.emit(True)
                else:
                    self.log_line.emit("[SYSTEM]", f"Docker Compose down failed:\n{process.stdout}", "#ef4444")
                    self.finished_stop.emit(False)
            else:
                # Fallback: Force kill the container if the compose context is lost
                self.log_line.emit("[SYSTEM]", "Compose directory not found. Forcing container removal...", "#eab308")
                container.stop(timeout=5) 
                container.remove(force=True)
                self.log_line.emit("[SYSTEM]", f"Container '{self.container_name}' destroyed.", "#ef4444")
                self.finished_stop.emit(True)
                
        except docker.errors.NotFound:
            self.log_line.emit("[SYSTEM]", f"Container '{self.container_name}' not found.", "#ef4444")
            self.finished_stop.emit(False)
        except Exception as e:
            self.log_line.emit("[SYSTEM]", f"Failed to stop prototype: {str(e)}", "#ef4444")
            self.finished_stop.emit(False)

class PipelineWorker(QThread):
    """
    Core orchestrator thread. Runs the LangGraph AI pipeline while 
    streaming updates (logs, file tree changes, progress) back to the main UI.
    """
    log_line = pyqtSignal(str, str, str)  
    progress = pyqtSignal(int)            
    agent_status = pyqtSignal(int, str)   
    finished_pipeline = pyqtSignal(dict)  
    new_file = pyqtSignal(str)

    def __init__(self, prompt, project_dir):
        super().__init__()
        self.prompt = prompt
        self._is_running = True
        self._seen_files = set()
        self.project_dir = project_dir

    def run(self):
        env_path = os.path.join(get_app_root(), '.env')
        load_dotenv(dotenv_path=env_path)

        # Intercept print statements globally for this thread
        stdout_redirector = EmittingStream()
        stdout_redirector.textWritten.connect(self.log_line.emit)
        sys.stdout = stdout_redirector

        try:
            app = create_graph()
    
            # Map standard linear edge transitions for UI prediction
            linear_edges = {}
            try:
                for edge in app.get_graph().edges:
                    if edge.source == "__start__" or edge.target == "__end__":
                        continue
                    linear_edges.setdefault(edge.source, []).append(edge.target)
            except Exception as e:
                self.log_line.emit("[SYSTEM]", f"Warning: Failed to parse graph edges - {e}", "#eab308")
            
            state = {
                "user_idea": self.prompt,
                "project_dir": self.project_dir,
                "error_messages": [],
                "iteration_count": 0
            }

            output_dir = self.project_dir
    
            # Identify and prime the UI for the first node
            first_node = next((edge.target for edge in app.get_graph().edges if edge.source == "__start__"), "pm")
            if first_node in AGENTS:
                stdout_redirector.current_tag = AGENTS[first_node]["log_name"]
                stdout_redirector.current_color = AGENTS[first_node]["color"]
                if AGENTS[first_node].get("index") is not None:
                    self.agent_status.emit(AGENTS[first_node]["index"], "running")

            # Main LangGraph streaming loop
            for event in app.stream(state):
                if not self._is_running:
                    stdout_redirector.current_tag = "[SYSTEM]"
                    stdout_redirector.current_color = "#ef4444"
                    print("Pipeline execution aborted by user.")
                    break

                for node_name, state_update in event.items():
                    meta = AGENTS.get(node_name, {"log_name": f"[{node_name.upper()}]", "color": "#c8d4e8", "progress": 0})
                    state.update(state_update)
                    
                    curr_idx = meta.get("index")
                    if curr_idx is not None:
                        self.agent_status.emit(curr_idx, "done")
                        
                    if meta.get("progress"):
                        self.progress.emit(meta["progress"])

                    # Determine next node to update UI colors/tags
                    possible_next_nodes = linear_edges.get(node_name, [])
                    next_node = None
                    
                    if len(possible_next_nodes) == 1:
                        next_node = possible_next_nodes[0]
                    elif len(possible_next_nodes) > 1:
                        # Dynamically resolve conditional router functions to predict UI state
                        router_func_name = f"route_after_{node_name}"
                        if hasattr(graph_module, router_func_name):
                            router = getattr(graph_module, router_func_name)
                            next_node = router(state)

                    if next_node and next_node in AGENTS:
                        next_idx = AGENTS[next_node].get("index")
                        
                        stdout_redirector.current_tag = AGENTS[next_node]["log_name"]
                        stdout_redirector.current_color = AGENTS[next_node]["color"]

                        # Loop detection: Reset downstream UI elements if debugger routes back to backend
                        if next_idx is not None and curr_idx is not None and next_idx < curr_idx:
                            for agent_meta in AGENTS.values():
                                idx = agent_meta.get("index")
                                if idx is not None and next_idx < idx <= curr_idx:
                                    self.agent_status.emit(idx, "idle")
                                    
                            iterations = state.get("iteration_count", 0)
                            agent_name = AGENTS[next_node]['name']
                            self.log_line.emit("[SYSTEM]", f"Dynamic loop detected. Routing back to {agent_name} (Iteration {iterations}).", "#eab308")
                            
                        if next_idx is not None:
                            self.agent_status.emit(next_idx, "running")

                    # Live File Tracker: Scan output directory for newly generated files
                    if os.path.exists(output_dir):
                        for root, dirs, files in os.walk(output_dir):
                            for file in files:
                                full_path = os.path.join(root, file)
                                if full_path not in self._seen_files:
                                    self._seen_files.add(full_path)
                                    rel_path = os.path.relpath(full_path, output_dir).replace("\\", "/") 
                                    self.new_file.emit(rel_path)
                                    
        except Exception as e:
            stdout_redirector.current_tag = "[SYSTEM]"
            stdout_redirector.current_color = "#ef4444"
            print(f"Pipeline crashed: {str(e)}")
            print(traceback.format_exc())
            
        finally:
            sys.stdout = sys.__stdout__
            
        self.finished_pipeline.emit(state)

    def stop(self):
        self._is_running = False

class AgentItemWidget(QWidget):
    """Custom sidebar widget representing an AI agent's execution state."""
    def __init__(self, agent_data):
        super().__init__()

        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)

        self.icon_label = QLabel()
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.icon_label.setFixedSize(40, 40) 

        # Get the absolute path to the SVG for this specific agent
        icon_filename = agent_data.get("icon_file", "default.svg")
        icon_path = get_resource_path(f"assets/{icon_filename}")

        self.icon_label.setStyleSheet(f"""
            QLabel {{
                background-color: #1e2330;
                border: 1px solid #2e3849;
                border-radius: 6px;
                image: url('{icon_path}');
                padding: 4px; 
            }}
        """)

        text_layout = QVBoxLayout()
        text_layout.setSpacing(1) 
        
        self.name_label = QLabel(agent_data["name"])
        self.name_label.setStyleSheet(f"color: {agent_data['color']}; font-weight: bold; font-size: 11px; padding-bottom: 2px;")
        
        self.role_label = QLabel(agent_data["role"])
        self.role_label.setStyleSheet("color: #5a6a82; font-size: 9px; padding-bottom: 2px;")
        
        text_layout.addWidget(self.name_label)
        text_layout.addWidget(self.role_label)
        
        self.dot = QLabel("●")
        self.dot.setStyleSheet("color: #5a6a82; font-size: 16px;") 

        # State glow effect (pulsing yellow when active)
        self.glow_effect = QGraphicsDropShadowEffect(self)
        self.glow_effect.setOffset(0, 0) # Centering it makes it a "glow" instead of a shadow
        self.glow_effect.setColor(QColor(0, 0, 0, 0)) # Start fully transparent
        self.glow_effect.setBlurRadius(12)
        self.dot.setGraphicsEffect(self.glow_effect)
        
        layout.addWidget(self.icon_label)
        layout.addLayout(text_layout)
        layout.addStretch() 
        layout.addWidget(self.dot)
        
        self.anim = QVariantAnimation(self)
        self.anim.setDuration(1500) 
        # Start at Bright Yellow, 100% opaque (255)
        self.anim.setStartValue(QColor(244, 255, 94, 255)) 
        # End at Bright Yellow, nearly invisible (30)
        self.anim.setEndValue(QColor(244, 255, 94, 30))
        self.anim.setLoopCount(-1) 
        self.anim.valueChanged.connect(self._on_color_pulse) # Renamed method

    def _on_color_pulse(self, color):
        """Only pulses the shadow's transparency."""
        self.glow_effect.setColor(color)

    def set_status(self, status):
        """Updates styling based on pipeline progress."""
        if status == "running":
            self.setStyleSheet("""
                AgentItemWidget {
                    background-color: #1e2330;
                    border: 1px solid #2e3849;
                    border-radius: 6px;
                }
            """)
        else:
            self.setStyleSheet("""
                AgentItemWidget {
                    background-color: transparent;
                    border: 1px solid transparent;
                    border-radius: 6px;
                }
            """)

        # Animation and dot logic
        if status == "idle":
            self.anim.stop()
            self.dot.setStyleSheet("color: #5a6a82; font-size: 16px;") 
            self.glow_effect.setColor(QColor(0, 0, 0, 0)) # Turn off glow

        elif status == "running":
            self.dot.setStyleSheet("color: #F4FF5E; font-size: 16px;")
            self.anim.start()

        elif status == "done":
            self.anim.stop()
            self.dot.setStyleSheet("color: #22c55e; font-size: 16px;") 
            self.glow_effect.setColor(QColor(0, 0, 0, 0)) # Turn off glow
            
        elif status == "error":
            self.anim.stop()
            self.dot.setStyleSheet("color: #ef4444; font-size: 16px;") 
            self.glow_effect.setColor(QColor(0, 0, 0, 0)) # Turn off glow

class DockerMonitorWorker(QThread):
    """Background polling thread that updates the active containers UI table."""
    docker_update = pyqtSignal(list)
    
    def __init__(self):
        super().__init__()
        self._is_running = True
        self.client = None
        self._try_connect()

    def _try_connect(self):
        try:
            self.client = docker.from_env()
            self.client.ping() 
        except Exception:
            self.client = None

    def run(self):
        while self._is_running:
            if not self.client:
                self._try_connect()
                self.sleep(2)
                continue

            try:
                # Fetch ALL containers
                containers = self.client.containers.list(all=True)
                update_data = []

                for c in containers:
                    # Filter by generated project labels to hide host user's unrelated containers
                    labels = c.attrs.get('Config', {}).get('Labels', {})
                    compose_project = labels.get('com.docker.compose.project', '').lower()

                    # if it's not one of our generated projects, skip it
                    if 'autoprototype' not in compose_project:
                        continue

                    compose_service = labels.get('com.docker.compose.service', '')

                    # Clean up the project name for the UI display
                    clean_project = compose_project.replace('autoprototype-', '').replace('autoprototype_', '').replace('autoprototype', '')
                    
                    if clean_project and compose_service:
                        display_name = f"{clean_project} [{compose_service}]"
                    else:
                        display_name = c.name

                    # Port Extraction Mapping
                    ports = []
                    port_data = c.attrs.get('NetworkSettings', {}).get('Ports', {})
                    if port_data:
                        for container_port, host_bindings in port_data.items():
                            if host_bindings:
                                ports.append(f":{host_bindings[0]['HostPort']}")
                    
                    port_str = ", ".join(ports) if ports else "--"
                    
                    update_data.append({
                        "name": display_name,
                        "raw_name": c.name,
                        "status": c.status,
                        "ports": port_str
                    })
                
                self.docker_update.emit(update_data)
            except Exception:
                self.client = None 
            
            self.sleep(1)

    def stop(self):
        self._is_running = False

class SettingsDialog(QDialog):
    """Preferences modal for API Keys and Output Paths."""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Preferences")
        self.setFixedSize(480, 180) 
        
        self.setStyleSheet("""
            QDialog { background-color: #12151a; color: #c8d4e8; }
            QLabel { color: #c8d4e8; font-weight: bold; font-size: 12px; }
            QLineEdit { 
                background-color: #1e2330; color: #ffffff; 
                border: 1px solid #2e3849; border-radius: 4px; 
                padding: 6px; font-family: "Courier New", monospace;
            }
            QLineEdit:focus { border: 1px solid #3b82f6; }
            QPushButton { 
                background-color: #3b82f6; color: #ffffff; 
                border: none; border-radius: 4px; padding: 6px 16px; 
                font-weight: bold;
            }
            QPushButton:hover { background-color: #1d4ed8; }
        """)
        
        layout = QVBoxLayout(self)
        form_layout = QFormLayout()
        
        # --- API KEY ---
        self.api_key_input = QLineEdit()
        self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password) 
        self.api_key_input.setPlaceholderText("sk-ant-...")
        
        # --- DIRECTORY SELECTION ---
        self.dir_input = QLineEdit()
        self.dir_input.setPlaceholderText("Default: ~/Documents/AutoPrototypes")
        
        self.browse_btn = QPushButton("Browse...")
        self.browse_btn.clicked.connect(self._browse_directory)
        
        # Create a horizontal layout to put the text box and button side-by-side
        dir_layout = QHBoxLayout()
        dir_layout.setContentsMargins(0, 0, 0, 0)
        dir_layout.addWidget(self.dir_input)
        dir_layout.addWidget(self.browse_btn)

        # Load existing settings
        self.settings = QSettings("AutoPrototype", "AppSettings")
        
        if saved_key := self.settings.value("anthropic_api_key", ""):
            self.api_key_input.setText(saved_key)
            
        if saved_dir := self.settings.value("output_directory", ""):
            self.dir_input.setText(saved_dir)
            
        form_layout.addRow("Anthropic API Key:", self.api_key_input)
        form_layout.addRow("Output Directory:", dir_layout)
        layout.addLayout(form_layout)
        
        self.button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Save | QDialogButtonBox.StandardButton.Cancel
        )
        self.button_box.accepted.connect(self.save_settings)
        self.button_box.rejected.connect(self.reject)
        layout.addWidget(self.button_box)

    def _browse_directory(self):
        """Opens a native file dialog to select the output folder."""
        # Start looking in the currently saved dir, or default to home
        start_dir = self.dir_input.text() or os.path.expanduser("~")

        directory = QFileDialog.getExistingDirectory(
            self, 
            "Select Output Directory", 
            start_dir,
        )
        
        if directory:
            self.dir_input.setText(directory)
        
    def save_settings(self):
        key = self.api_key_input.text().strip()
        out_dir = self.dir_input.text().strip()
        
        self.settings.setValue("anthropic_api_key", key)
        self.settings.setValue("output_directory", out_dir)
        
        if key:
            os.environ["ANTHROPIC_API_KEY"] = key
            
        self.accept()

class ProjectSetupDialog(QDialog):
    """Initial modal configured at project creation time."""
    def __init__(self, default_dir, parent=None):
        super().__init__(parent)
        self.setWindowTitle("New Prototype Project")
        self.setFixedSize(450, 150)

        self.setStyleSheet("""
            QDialog { background-color: #12151a; color: #c8d4e8; }
            QLabel { color: #c8d4e8; font-weight: bold; font-size: 12px; }
            QLineEdit { 
                background-color: #1e2330; color: #ffffff; 
                border: 1px solid #2e3849; border-radius: 4px; 
                padding: 6px; font-family: "Courier New", monospace;
            }
            QLineEdit:focus { border: 1px solid #3b82f6; }
            QPushButton { 
                background-color: #3b82f6; color: #ffffff; 
                border: none; border-radius: 4px; padding: 6px 16px; 
                font-weight: bold;
            }
            QPushButton:hover { background-color: #1d4ed8; }
        """)

        layout = QVBoxLayout(self)
        form_layout = QFormLayout()
        
        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("AutoPrototype_xyz")
        
        self.dir_input = QLineEdit()
        self.dir_input.setText(default_dir)
        
        self.browse_btn = QPushButton("Browse...")
        self.browse_btn.clicked.connect(self._browse_directory)
        
        dir_layout = QHBoxLayout()
        dir_layout.setContentsMargins(0, 0, 0, 0)
        dir_layout.addWidget(self.dir_input)
        dir_layout.addWidget(self.browse_btn)

        form_layout.addRow("Project Name:", self.name_input)
        form_layout.addRow("Output Directory:", dir_layout)
        layout.addLayout(form_layout)
        
        self.button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        self.button_box.accepted.connect(self.accept)
        self.button_box.rejected.connect(self.reject)
        layout.addWidget(self.button_box)

    def _browse_directory(self):
        start_dir = self.dir_input.text() or os.path.expanduser("~")
        directory = QFileDialog.getExistingDirectory(self, "Select Output Directory", start_dir)
        if directory:
            self.dir_input.setText(directory)

    def get_values(self):
        return self.name_input.text().strip(), self.dir_input.text().strip()
    
class MainWindow(QMainWindow, Ui_MainWindow):
    """
    Main Application Window. Initializes the Qt UI elements, binds events, 
    and handles the lifecycle of background worker threads.
    """
    def __init__(self):
        super().__init__()
        self.setupUi(self)

        # QTextBrowser for clickable links
        self.allLogsLayout.removeWidget(self.logOutput)
        self.logOutput.deleteLater()
        
        self.logOutput = QTextBrowser(self.tabAllLogs)
        self.logOutput.setObjectName("logOutput")
        self.logOutput.setOpenLinks(False) # This makes links open in your default browser!
        self.logOutput.setOpenExternalLinks(False) # This makes links open in your default browser!
        self.logOutput.anchorClicked.connect(self._handle_link_click) # Route to our custom handler
        self.logOutput.setLineWrapMode(QTextBrowser.LineWrapMode.WidgetWidth)
        
        self.logOutput.setStyleSheet("""
            QTextBrowser#logOutput {
                background-color: #0d0f12;
                border: none;
                color: #c8d4e8;
                padding: 8px;
                selection-background-color: #1e3a5f;
            }
        """)
        self.allLogsLayout.addWidget(self.logOutput)

        prompt_font = QFont("Courier New", 12)
        prompt_font.setStyleHint(QFont.StyleHint.Monospace)
        self.promptEdit.setFont(prompt_font)
        
        console_font = QFont("Courier New", 9) 
        console_font.setStyleHint(QFont.StyleHint.Monospace)
        console_font.setFixedPitch(True)
        self.logOutput.setFont(console_font)

        self._setup_file_tree()

        self.settings = QSettings("AutoPrototype", "AppSettings")
        if saved_key := self.settings.value("anthropic_api_key", ""):
            os.environ["ANTHROPIC_API_KEY"] = saved_key

        self._setup_agent_list()
        self._setup_docker_table()
        self._connect_signals()
        self._start_docker_monitor()

        # Build custom UI badge animation resources
        self.liveBadge.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self.badge_glow = QGraphicsDropShadowEffect(self)
        self.badge_glow.setOffset(0, 0)
        self.badge_glow.setBlurRadius(12)
        self.badge_glow.setColor(QColor(0, 0, 0, 0))
        self.liveBadge.setGraphicsEffect(self.badge_glow)

        self.badge_anim = QVariantAnimation(self)
        self.badge_anim.setDuration(1500)
        self.badge_anim.setStartValue(QColor("#F4FF5E"))
        self.badge_anim.setEndValue(QColor("#F0F5A6"))
        self.badge_anim.setLoopCount(-1)
        self.badge_anim.valueChanged.connect(self._on_badge_pulse)

        self.set_badge_state("IDLE")

        self.spinner_angle = 0
        self.spinner_base = QPixmap(get_resource_path("assets/spinner.svg")).scaled(
            20, 20, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation
        )
        self.spinner_timer = QTimer(self)
        self.spinner_timer.timeout.connect(self._update_spinner)

    # --- Popup Error Handler ---
    def _show_error_popup(self, title: str, message: str):
        """Displays a dark-themed error dialog box to the user."""
        msg = QMessageBox(self)
        msg.setWindowTitle(title)
        msg.setText(message)
        msg.setIcon(QMessageBox.Icon.Warning)
        
        msg.setStyleSheet("""
            QMessageBox {
                background-color: #12151a;
                color: #c8d4e8;
            }
            QLabel {
                color: #c8d4e8;
                font-size: 12px;
            }
            QPushButton {
                background-color: #3b82f6;
                color: #ffffff;
                border: none;
                border-radius: 4px;
                padding: 6px 16px;
                min-height: 20px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #1d4ed8;
            }
        """)
        msg.exec()

    def _update_spinner(self):
        """Renders the rotating loading icon on active buttons."""
        # Ensure the set exists
        if not hasattr(self, 'active_spinner_buttons'):
            self.active_spinner_buttons = set()

        self.spinner_angle = (self.spinner_angle + 15) % 360  # Rotate 15 degrees per tick
    
        size = self.spinner_base.width()
        rotated = QPixmap(size, size)
        rotated.fill(Qt.GlobalColor.transparent)

        painter = QPainter(rotated)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform)

        # Move origin to center, rotate, and move back
        painter.translate(size / 2, size / 2)
        painter.rotate(self.spinner_angle)
        painter.translate(-size / 2, -size / 2)

        painter.drawPixmap(0, 0, self.spinner_base)
        painter.end()

        # Apply the rotated image as the icon to any button currently loading
        icon = QIcon(rotated)
        for btn in self.active_spinner_buttons:
            btn.setIcon(icon)
            btn.setIconSize(QSize(20, 20))

    def _reset_button_states(self):
        """Restores the buttons to their default idle configurations."""
        if hasattr(self, 'active_spinner_buttons') and self.runButton in self.active_spinner_buttons:
            self.active_spinner_buttons.remove(self.runButton)
            
        # Only stop the timer if NO buttons are loading
        if not hasattr(self, 'active_spinner_buttons') or not self.active_spinner_buttons:
            self.spinner_timer.stop()
            
        self.runButton.setIcon(QIcon())
        self.runButton.setText("▶ RUN PIPELINE")
        self.runButton.setEnabled(True)
        self.stopButton.setEnabled(False)
        self.promptEdit.setReadOnly(False)

        self.promptEdit.setStyleSheet("")

    def _start_docker_monitor(self):
        self.docker_worker = DockerMonitorWorker()
        self.docker_worker.docker_update.connect(self._handle_docker_update)
        self.docker_worker.start()

    def _on_badge_pulse(self, color):
        """Animate badge text color and a static glow color without changing layout."""
        self.liveBadge.setStyleSheet(
            f"background-color: {self.badge_bg_color}; color: {color.name()}; border-radius:3px;"
            "font-size:9px; padding:1px 6px; letter-spacing:1px;"
        )

        glow_color = QColor(color)
        glow_color.setAlpha(140)
        self.badge_glow.setColor(glow_color)

    def _handle_docker_update(self, active_containers: list):
        self.dockerTable.setRowCount(len(active_containers))
        
        for row, container_info in enumerate(active_containers):
            name = container_info["name"]
            state = container_info["status"]
            ports = container_info["ports"]

            if not self.dockerTable.item(row, 0):
                dot = QTableWidgetItem("●")
                dot.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
                self.dockerTable.setItem(row, 0, dot)
                self.dockerTable.setItem(row, 1, QTableWidgetItem())
                self.dockerTable.setItem(row, 2, QTableWidgetItem())
                self.dockerTable.setItem(row, 3, QTableWidgetItem())

            colors = {
                "running":  ("#22c55e", "#22c55e"),
                "exited":   ("#5a6a82", "#5a6a82"),
                "removing": ("#f97316", "#f97316"),
                "error":    ("#ef4444", "#ef4444"),
                "dead":     ("#ef4444", "#ef4444")
            }
            dot_color, state_color = colors.get(state, ("#5a6a82", "#5a6a82"))

            self.dockerTable.item(row, 0).setForeground(QColor(dot_color))

            self.dockerTable.item(row, 1).setText(name)
            self.dockerTable.item(row, 1).setToolTip(name)

            port_item = QTableWidgetItem(ports)
            port_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            port_item.setToolTip(ports)
            self.dockerTable.setItem(row, 2, port_item)

            state_item = QTableWidgetItem(state.upper())
            state_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            state_item.setForeground(QColor(state_color))
            self.dockerTable.setItem(row, 3, state_item)

    def _setup_agent_list(self):
        self.agentList.clear()
        self.agent_widgets = [] 
        
        ui_agents = sorted(
            [a for a in AGENTS.values() if a.get("index") is not None], 
            key=lambda x: x["index"]
        )
        
        for agent in ui_agents:
            item = QListWidgetItem()
            item.setSizeHint(QSize(200, 55)) 
            self.agentList.addItem(item)
            
            widget = AgentItemWidget(agent)
            self.agentList.setItemWidget(item, widget)
            self.agent_widgets.append(widget)

    def _setup_file_tree(self):
        self.fileTree.clear()
        root = QTreeWidgetItem(self.fileTree, ["output/"])
        root.setIcon(0, QIcon(get_resource_path("assets/closed_folder.svg"))) 
        root.setExpanded(True)
        root.setChildIndicatorPolicy(QTreeWidgetItem.ChildIndicatorPolicy.ShowIndicator)
        self.fileTree.header().setVisible(False)

    def _setup_docker_table(self):
        hdr = self.dockerTable.horizontalHeader()
        hdr.setSectionResizeMode(0, QHeaderView.ResizeMode.Fixed)
        hdr.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        hdr.setSectionResizeMode(2, QHeaderView.ResizeMode.Fixed)
        hdr.setSectionResizeMode(3, QHeaderView.ResizeMode.Fixed)
        self.dockerTable.setColumnWidth(0, 65)
        self.dockerTable.setColumnWidth(2, 70)
        self.dockerTable.setColumnWidth(3, 80)

        self.dockerTable.setRowCount(0)

    def _connect_signals(self):
        self.runButton.clicked.connect(self._on_run)
        self.stopButton.clicked.connect(self._on_stop)
        self.launchButton.clicked.connect(self._on_launch_prototype)
        self.stopPrototypeButton.clicked.connect(self._on_stop_prototype)
        self.fileTree.itemClicked.connect(self._on_tree_item_clicked)
        self.actionPreferences.triggered.connect(self._open_settings)

    def _on_run(self):
        # Check for blank prompt
        prompt = self.promptEdit.toPlainText().strip()
        if not prompt:
            self._show_error_popup("Missing Input", "Please enter a prompt describing your application before running.")
            return

        # Check for API Key
        env_path = os.path.join(get_app_root(), '.env')
        load_dotenv(dotenv_path=env_path)
        if not os.getenv("ANTHROPIC_API_KEY"):
            self._show_error_popup("Missing API Key", "Your Anthropic API key is not configured.\n\nPlease open 'Settings > Preferences...' to add your key.")
            return

        # Check for Docker Engine
        try:
            client = docker.from_env()
            client.ping()
        except Exception:
            self._show_error_popup("Docker Error", "Could not connect to Docker.\n\nPlease ensure Docker is running.")
            return
        
        settings = QSettings("AutoPrototype", "AppSettings")
        base_dir = settings.value("output_directory", "").strip()

        if not base_dir or not os.path.isdir(base_dir):
            base_dir = os.path.expanduser("~")

        setup_dialog = ProjectSetupDialog(base_dir, self)
        if setup_dialog.exec() == QDialog.DialogCode.Accepted:
            project_name, final_dir = setup_dialog.get_values()
        else:
            return # User clicked Cancel

        # Update settings if they changed the directory
        settings.setValue("output_directory", final_dir)

        if not project_name:
            project_name = f"AutoPrototype_{uuid.uuid4().hex[:6]}"
        else:
            project_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', project_name)

        self.current_project_dir = os.path.join(final_dir, project_name)
        
        # Collision handling: if they named it "MyApp" but "MyApp" already exists, append a random string
        if os.path.exists(self.current_project_dir):
             self.current_project_dir += f"_{uuid.uuid4().hex[:4]}"

        os.makedirs(self.current_project_dir, exist_ok=True)

        # Update the File Tree UI to point to the new folder name
        self.fileTree.clear()

        # Extract just the folder name (e.g., "MyApp") rather than the full absolute path for the UI tree
        display_name = os.path.basename(self.current_project_dir) 
        root = QTreeWidgetItem(self.fileTree, [f"{display_name}/"])
        root.setIcon(0, QIcon(get_resource_path("assets/closed_folder.svg")))
        root.setExpanded(True)

        # --- START PIPELINE EXECUTION ---
        self.runButton.setEnabled(False)
        self.stopButton.setEnabled(True)
        self.promptEdit.setReadOnly(True)

        self.promptEdit.setStyleSheet("""
            QTextEdit#promptEdit {
                background-color: #12151a;
                color: #5a6a82;
                border: 1px solid #1e2330;
                border-radius: 6px;
            }
        """)

        if not hasattr(self, 'active_spinner_buttons'):
            self.active_spinner_buttons = set()
        self.active_spinner_buttons.add(self.runButton)

        self.spinner_angle = 0
        self.runButton.setText("  RUNNING PIPELINE") 
        self._update_spinner()       
        if not self.spinner_timer.isActive():
            self.spinner_timer.start(30)
            
        self.set_badge_state("RUNNING")

        self.logOutput.clear()
        self._append_log("[SYSTEM]", f"Saving prototype to: {self.current_project_dir}", "#5a6a82")
        self._append_log("[SYSTEM]", "Pipeline initializing...", "#5a6a82")
        self.set_progress(0)

        for i in range(len(self.agent_widgets)):
            self.set_agent_status(i, "idle")

        # Pass the dynamic path to the worker
        self.worker = PipelineWorker(prompt, self.current_project_dir)
        self.worker.log_line.connect(self._append_log)
        self.worker.progress.connect(self.set_progress)
        self.worker.agent_status.connect(self.set_agent_status)
        self.worker.finished_pipeline.connect(self._on_finished)
        self.worker.new_file.connect(self.add_file_to_tree)
        self.worker.start()

    def _on_stop(self):
        if hasattr(self, 'worker') and self.worker.isRunning():
            self.worker.stop() 
            
        self._reset_button_states()

        # Update to STOPPED state, which will now pulse red
        self.set_badge_state("STOPPED")

        self._append_log("[SYSTEM]", "Stop requested. Halting after current node...", "#eab308")

    def _on_finished(self, final_state):
        self._reset_button_states()
        
        iterations = final_state.get("iteration_count", 0)
        unresolved = len(final_state.get("error_messages", []))
        
        if unresolved == 0:
            # Set to SUCCESS state (pulsing green)
            self.set_badge_state("SUCCESS")
            self._append_log("[SYSTEM]", f"Pipeline complete in {iterations} iterations (Pass@1: {iterations == 0}).", "#22c55e")
        else:
            # Set to WARNING state (pulsing orange)
            self.set_badge_state("WARNING")
            self._append_log("[SYSTEM]", f"Pipeline finished with {unresolved} unresolved bugs.", "#eab308")

    def _on_stop_prototype(self):
        try:
            client = docker.from_env()
            all_containers = client.containers.list()
            
            # Dictionary to map clean project names to one container name
            unique_projects = {}
            
            for c in all_containers:
                labels = c.attrs.get('Config', {}).get('Labels', {})
                raw_project = labels.get('com.docker.compose.project', '')
                
                if 'autoprototype' in raw_project.lower():
                    # Clean up the project name for the UI
                    clean_project = raw_project.replace('autoprototype-', '').replace('autoprototype_', '').replace('autoprototype', '')
                    
                    # Store only the first container we find for each project
                    if clean_project and clean_project not in unique_projects:
                        unique_projects[clean_project] = c.name
                        
        except Exception:
            self._show_error_popup("Docker Error", "Could not connect to Docker.")
            return

        if not unique_projects:
            self._show_error_popup("No Prototypes", "There are currently no live prototypes running.")
            return

        # Use PyQt's built-in dropdown dialog with the clean project names
        project_display_names = list(unique_projects.keys())
        selected_project, ok = QInputDialog.getItem(
            self, 
            "Stop Prototype", 
            "Select a running prototype to destroy:", 
            project_display_names, 
            0, 
            False
        )

        # If the user clicked "OK" and selected a project
        if ok and selected_project:
            self.stopPrototypeButton.setEnabled(False)
            self.stopPrototypeButton.setText(" STOPPING...")
            
            # Add to the dynamic spinner system
            if not hasattr(self, 'active_spinner_buttons'):
                self.active_spinner_buttons = set()
            self.active_spinner_buttons.add(self.stopPrototypeButton)
            
            self._update_spinner()
            if not self.spinner_timer.isActive():
                self.spinner_timer.start(30)
            
            # Get the actual container name associated with this project to feed the worker
            target_container_name = unique_projects[selected_project]

            # Spin up the background worker
            self.stopper_worker = StopperWorker(target_container_name)
            self.stopper_worker.log_line.connect(self._append_log)
            self.stopper_worker.finished_stop.connect(self._on_stop_finished)
            self.stopper_worker.start()

    def _on_stop_finished(self, success):
        self.stopPrototypeButton.setEnabled(True)
        
        # Remove from spinner set and stop timer if empty
        if hasattr(self, 'active_spinner_buttons') and self.stopPrototypeButton in self.active_spinner_buttons:
            self.active_spinner_buttons.remove(self.stopPrototypeButton)
            
        if not hasattr(self, 'active_spinner_buttons') or not self.active_spinner_buttons:
            self.spinner_timer.stop()
            
        self.stopPrototypeButton.setIcon(QIcon())
        self.stopPrototypeButton.setText("■ DESTROY")
        
        if success:
            # Disable the destroy button so it returns to gray
            self.stopPrototypeButton.setEnabled(False) 
            self.launchButton.setEnabled(True)
            self._show_error_popup("Destroyed", "Prototype container has been successfully destroyed.")
        else:
            # If it failed to stop, keep it enabled (red) so they can try again
            self.stopPrototypeButton.setEnabled(True) 
            
    def _on_launch_prototype(self):

        try:
            client = docker.from_env()
            client.ping()
        except Exception:
            self._show_error_popup("Docker Error", "Could not connect to Docker.\n\nPlease ensure Docker is running before launching a prototype.")
            return
        
        # Start the file picker in the user's saved output directory
        settings = QSettings("AutoPrototype", "AppSettings")
        base_dir = settings.value("output_directory", "").strip()
        if not base_dir or not os.path.isdir(base_dir):
            base_dir = os.path.expanduser("~")

        # Open dialog to select the specific prototype folder
        target_dir = QFileDialog.getExistingDirectory(
            self, 
            "Select Prototype Directory to Launch", 
            base_dir
        )
        
        # If the user clicks "Cancel" on the popup, exit safely
        if not target_dir:
            return

        # Validation: Ensure the selected folder actually has a docker-compose file
        compose_yml = os.path.join(target_dir, "docker-compose.yml")
        compose_yaml = os.path.join(target_dir, "docker-compose.yaml")
        
        if not (os.path.exists(compose_yml) or os.path.exists(compose_yaml)):
            self._show_error_popup(
                "Invalid Prototype", 
                f"No docker-compose.yml found in:\n{target_dir}\n\nPlease select a valid generated prototype folder."
            )
            return

        #  Update UI state
        self.launchButton.setEnabled(False)
        self.launchButton.setText(" BUILDING...")

        # -> NEW: Clear the logs and print an initial status message <-
        self.logOutput.clear()
        self._append_log("[SYSTEM]", f"Preparing to launch prototype from:", "#5a6a82")
        self._append_log("[SYSTEM]", f"{target_dir}", "#5a6a82")

        # Add the launch button to the spinner set
        if not hasattr(self, 'active_spinner_buttons'):
            self.active_spinner_buttons = set()
        self.active_spinner_buttons.add(self.launchButton)
        
        self._update_spinner()
        if not self.spinner_timer.isActive():
            self.spinner_timer.start(30)
        
        # Extract the project name from the selected directory path (e.g. "AutoPrototype_xyz")
        project_name = os.path.basename(target_dir)

        # Populate the file tree view from disk
        self.fileTree.clear()
        
        # Create the root folder node
        root_item = QTreeWidgetItem(self.fileTree, [f"{project_name}/"])
        root_item.setIcon(0, QIcon(get_resource_path("assets/closed_folder.svg")))
        root_item.setExpanded(True)

        # Walk through the folder and add files to the tree
        for root_dir, dirs, files in os.walk(target_dir):
            # Skip heavy or hidden folders so the UI doesn't freeze
            if '.git' in root_dir or 'node_modules' in root_dir or '__pycache__' in root_dir:
                continue
                
            for file in files:
                full_path = os.path.join(root_dir, file)
                rel_path = os.path.relpath(full_path, target_dir).replace("\\", "/")
                self.add_file_to_tree(rel_path)

        # Update the file count label
        self.fileCountLabel.setText(
            f"{self._count_files(self.fileTree.invisibleRootItem())} files"
        )

        # Initialize and start the Launcher Worker with the selected directory
        self.launcher_worker = LauncherWorker(target_dir, project_name)
        self.launcher_worker.log_line.connect(self._append_log)
        self.launcher_worker.finished_launch.connect(self._on_launch_finished)
        self.launcher_worker.start()

    def _on_launch_finished(self, success):
        
        # Remove from spinner set and stop timer if empty
        if hasattr(self, 'active_spinner_buttons') and self.launchButton in self.active_spinner_buttons:
            self.active_spinner_buttons.remove(self.launchButton)
            
        if not hasattr(self, 'active_spinner_buttons') or not self.active_spinner_buttons:
            self.spinner_timer.stop()
            
        self.launchButton.setIcon(QIcon())
        self.launchButton.setText("▶ LAUNCH")
        
        if success:
            # enable the destroy button so it turns red
            self.launchButton.setEnabled(False)
            self.stopPrototypeButton.setEnabled(True) 
            self._show_error_popup("Success!", "Prototype launched successfully!\n\nCheck the live output logs for localhost URLs.")
        else:
            self.launchButton.setEnabled(True)

    def _append_log(self, agent: str, message: str, color: str = "#c8d4e8"):
        """
        Parses streamed console text to dynamically colorize tags and convert 
        raw http:// substrings into clickable UI anchor tags.
        """
        timestamp = datetime.now().strftime("%H:%M:%S")

        # Force [SYSTEM] to be blue unless it's a red error
        if agent == "[SYSTEM]" and color != "#ef4444":
            color = "#f739a8" 
        
        cursor = self.logOutput.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.End)

        doc_font = QFont("Courier New", 9)
        doc_font.setStyleHint(QFont.StyleHint.Monospace)
        doc_font.setFixedPitch(True)

        metrics = QFontMetrics(doc_font)
        indent_pixels = metrics.horizontalAdvance(" " * 28)

        # Format blocks for neat multiline alignment
        block_fmt = QTextBlockFormat()
        block_fmt.setLeftMargin(indent_pixels)
        block_fmt.setTextIndent(-indent_pixels)

        fmt_timestamp = QTextCharFormat()
        fmt_timestamp.setForeground(QColor("#5a6a82"))
        fmt_timestamp.setFont(doc_font)

        fmt_agent = QTextCharFormat()
        fmt_agent.setForeground(QColor(color))
        fmt_agent.setFont(doc_font)
        
        fmt_msg = QTextCharFormat()
        fmt_msg.setForeground(QColor("#c8d4e8"))
        fmt_msg.setFont(doc_font)

        # Regex to isolate URLs
        url_pattern = re.compile(r'(https?://\S+)')

        for line in message.splitlines():
            if not line.strip(): 
                continue
            
            if cursor.block().length() <= 1: 
                cursor.setBlockFormat(block_fmt)
            else:
                cursor.insertBlock(block_fmt)
            
            # Insert the timestamp
            cursor.setCharFormat(fmt_timestamp)
            cursor.insertText(f"[{timestamp}] ")

            # Insert the padded agent tag
            cursor.setCharFormat(fmt_agent)
            cursor.insertText(f"{agent:<10}")
            
            # Parse and inject clickable URLs
            parts = url_pattern.split(line)
            for part in parts:
                if url_pattern.match(part):
                    fmt_link = QTextCharFormat(fmt_msg)
                    fmt_link.setForeground(QColor("#93c5fd")) # Lighter blue for links
                    fmt_link.setFontUnderline(True)
                    fmt_link.setAnchor(True)
                    fmt_link.setAnchorHref(part) # Assign the URL destination
                    
                    cursor.setCharFormat(fmt_link)
                    cursor.insertText(part)
                else:
                    cursor.setCharFormat(fmt_msg)
                    cursor.insertText(part)

        self.logOutput.ensureCursorVisible()

    def _handle_link_click(self, url):
        """Safely opens URLs using Python's native browser module instead of Qt's."""
        webbrowser.open(url.toString())

    def _open_settings(self):
        """Opens the preferences dialog modal."""
        dialog = SettingsDialog(self)
        dialog.exec()

    def set_agent_status(self, index: int, status_string: str):
        if 0 <= index < len(self.agent_widgets):
            widget = self.agent_widgets[index]
            widget.set_status(status_string)

    def set_progress(self, value: int):
        self.pipelineProgress.setValue(value)
        self.progressPct.setText(f"{value}%")

    def set_badge_state(self, state: str):
        """Updates the live badge text and color animation."""
        self.badge_anim.stop()

        if state == "IDLE":
            self.liveBadge.setText("● IDLE")
            self.badge_bg_color = "#1e3a8a"
            self.badge_anim.setStartValue(QColor("#3b82f6"))
            self.badge_anim.setEndValue(QColor("#93c5fd"))

        elif state == "RUNNING":
            self.liveBadge.setText("● RUNNING")
            self.badge_bg_color = "#3f3f00"
            self.badge_anim.setStartValue(QColor("#facc15"))
            self.badge_anim.setEndValue(QColor("#fff08a"))

        elif state == "SUCCESS":
            self.liveBadge.setText("● SUCCESS")
            self.badge_bg_color = "#166534"
            self.badge_anim.setStartValue(QColor("#22c55e"))
            self.badge_anim.setEndValue(QColor("#86efac"))

        elif state == "WARNING":
            self.liveBadge.setText("● WARNING")
            self.badge_bg_color = "#713f12"
            self.badge_anim.setStartValue(QColor("#eab308"))
            self.badge_anim.setEndValue(QColor("#fde047"))

        elif state == "STOPPED":
            self.liveBadge.setText("● STOPPED")
            self.badge_bg_color = "#450a0a"
            self.badge_anim.setStartValue(QColor("#ef4444"))
            self.badge_anim.setEndValue(QColor("#fca5a5"))

        self.badge_anim.start()

    def add_file_to_tree(self, path: str):
        """Constructs and inserts a node into the filesystem UI tree dynamically."""
        parts = path.split("/")
        root = self.fileTree.invisibleRootItem().child(0)
        parent = root
        for i, part in enumerate(parts):
            found = None
            for j in range(parent.childCount()):
                node_text = parent.child(j).text(0)
                clean_name = node_text.strip().rstrip("/")
                if clean_name == part:
                    found = parent.child(j)
                    break
            if found is None:
                is_dir = i < len(parts) - 1
                label = f"{part}/" if is_dir else f"{part}" # <-- No unicode arrows here
                node = QTreeWidgetItem(parent, [label])
                if is_dir:
                    node.setIcon(0, QIcon(get_resource_path("assets/closed_folder.svg")))
                else:
                    node.setIcon(0, QIcon(get_resource_path("assets/file.svg")))

                    node.setForeground(0, QColor("#3b82f6"))
                parent = node
            else:
                parent = found
        self.fileCountLabel.setText(
            f"{self._count_files(self.fileTree.invisibleRootItem())} files"
        )

    def _on_item_expanded(self, item):
        text = item.text(0)
        if text.startswith("▶"):
            item.setText(0, text.replace("▶", "▼", 1))

    def _on_item_collapsed(self, item):
        text = item.text(0)
        if text.startswith("▼"):
            item.setText(0, text.replace("▼", "▶", 1))

    def _on_tree_item_clicked(self, item, column):
        """Toggles folder expansion when the user clicks the row."""
        if item.childCount() > 0:
            # Flip the expansion state
            item.setExpanded(not item.isExpanded())

    def _count_files(self, item) -> int:
        count = 0
        for i in range(item.childCount()):
            child = item.child(i)
            if child.childCount() == 0:
                count += 1
            count += self._count_files(child)
        return count
    
if __name__ == "__main__":
    import ctypes
    import sys
    import os
    from PyQt6.QtGui import QPalette, QColor, QIcon 
    # Make sure to import QIcon, QApplication etc. if they aren't already imported at the top

    # Force Wayland in WSL to allow dark Client-Side Decorations (CSD)
    if sys.platform.startswith("linux"):
        os.environ["QT_QPA_PLATFORM"] = "wayland;xcb"
        os.environ["GTK_THEME"] = "Adwaita:dark" # Extra hint for some Linux WMs

    # Force Windows/WSL taskbar to use a custom ID before QApplication is initialized
    try:
        myappid = 'architectai.agentic_ai_prototype_frontend.v1' 
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(myappid)
    except Exception:
        pass 

    app = QApplication(sys.argv)
    app.setStyle("Fusion") 

    # Set a global Dark Palette so the OS/Wayland knows to use dark window frames
    palette = QPalette()
    palette.setColor(QPalette.ColorRole.Window, QColor(13, 15, 18))
    palette.setColor(QPalette.ColorRole.WindowText, QColor(200, 212, 232))
    palette.setColor(QPalette.ColorRole.Base, QColor(18, 21, 26))
    palette.setColor(QPalette.ColorRole.AlternateBase, QColor(13, 15, 18))
    palette.setColor(QPalette.ColorRole.ToolTipBase, QColor(13, 15, 18))
    palette.setColor(QPalette.ColorRole.ToolTipText, QColor(200, 212, 232))
    palette.setColor(QPalette.ColorRole.Text, QColor(200, 212, 232))
    palette.setColor(QPalette.ColorRole.Button, QColor(30, 35, 48))
    palette.setColor(QPalette.ColorRole.ButtonText, QColor(200, 212, 232))
    palette.setColor(QPalette.ColorRole.BrightText, QColor(255, 0, 0))
    palette.setColor(QPalette.ColorRole.Link, QColor(59, 130, 246))
    palette.setColor(QPalette.ColorRole.Highlight, QColor(59, 130, 246))
    palette.setColor(QPalette.ColorRole.HighlightedText, QColor(255, 255, 255))
    app.setPalette(palette)

    # Set the global application icon dynamically based on OS
    if sys.platform == 'darwin':
        app_icon_path = get_resource_path("assets/logo.icns") # Mac
    elif sys.platform == 'win32':
        app_icon_path = get_resource_path("assets/logo.ico")  # Windows
    else:
        app_icon_path = get_resource_path("assets/logo.svg")  # Linux

    app_icon = QIcon(app_icon_path)
    app.setWindowIcon(app_icon)

    window = MainWindow()

    # Force Dark Title Bar on native Windows 10/11
    if sys.platform == "win32":
        try:
            # 20 is the DWMWA_USE_IMMERSIVE_DARK_MODE attribute
            ctypes.windll.dwmapi.DwmSetWindowAttribute(
                int(window.winId()), 20, ctypes.byref(ctypes.c_int(1)), 4
            )
        except Exception:
            pass # Fails gracefully on older versions of Windows

    window.show()
    sys.exit(app.exec())