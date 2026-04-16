import sys
import os
import traceback
import docker
from docker.errors import NotFound, APIError
from datetime import datetime

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QListWidgetItem,
    QTreeWidgetItem, QTableWidgetItem, QHeaderView, QWidget, QHBoxLayout, QVBoxLayout, QLabel, QMessageBox, QGraphicsDropShadowEffect, QDialog, QFormLayout, QLineEdit, QDialogButtonBox
)

from PyQt6.QtCore import Qt, QThread, pyqtSignal, QSize, QVariantAnimation, QObject, QTimer, QSettings
from PyQt6.QtGui import QColor, QTextCharFormat, QTextCursor, QTextBlockFormat, QIcon, QFont, QFontMetrics, QPixmap, QPainter

# 1. Import the generated UI class
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

# Status dot unicode + color
STATUS_IDLE    = ("●", "#2e3849")
STATUS_RUNNING = ("●", "#3b82f6")
STATUS_DONE    = ("●", "#22c55e")
STATUS_WAITING = ("●", "#eab308")
STATUS_ERROR   = ("●", "#ef4444")

# --- CONSOLIDATED AGENTS & METADATA ---
AGENTS = {
    "pm":       {"index": 0,    "log_name": "[PM]","name": "Program Manager", "role": "ORCHESTRATOR",   "color": "#3b82f6", "icon_file": "pm_icon.svg", "progress": 15},
    "backend":  {"index": 1,    "log_name": "[BACKEND]","name": "Backend", "role": "API / SERVICES", "color": "#a855f7", "icon_file": "backend_icon.svg", "progress": 30},
    "frontend": {"index": 2,    "log_name": "[FRONTEND]","name": "Frontend", "role": "UI / UX AGENT",  "color": "#22c55e", "icon_file": "frontend_icon.svg", "progress": 45},
    "devops":   {"index": 3,    "log_name": "[DEVOPS]","name": "DevOps", "role": "INFRA / DOCKER", "color": "#0ea5e9", "icon_file": "devops_icon.svg", "progress": 60},
    "executor": {"index": 4,    "log_name": "[EXEC]","name": "Exec Node", "role": "EXECUTION NODE", "color": "#f97316", "icon_file": "execution_icon.svg", "progress": 75},
    "debugger": {"index": 5,    "log_name": "[DEBUG]","name": "Debugger", "role": "REVIEW / FIX",   "color": "#db5151", "icon_file": "debugger_icon.svg", "progress": 90},
    "saver":    {"index": None, "log_name": "[SAVER]","name": "Saver", "role": "FILE SAVER", "color": "#64748b", "icon_file": "💾", "progress": 100},
}

# --- STDOUT REDIRECTOR ---
class EmittingStream(QObject):
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

class PipelineWorker(QThread):
    log_line = pyqtSignal(str, str, str)  
    progress = pyqtSignal(int)            
    agent_status = pyqtSignal(int, str)   
    finished_pipeline = pyqtSignal(dict)  
    new_file = pyqtSignal(str)

    def __init__(self, prompt):
        super().__init__()
        self.prompt = prompt
        self._is_running = True
        self._seen_files = set()

    def run(self):
        load_dotenv()
        
        stdout_redirector = EmittingStream()
        stdout_redirector.textWritten.connect(self.log_line.emit)
        sys.stdout = stdout_redirector

        try:
            app = create_graph()
            
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
                "error_messages": [],
                "iteration_count": 0
            }

            current_dir = os.path.dirname(os.path.abspath(__file__))
            output_dir = os.path.join(current_dir, "output_prototype")
            
            first_node = next((edge.target for edge in app.get_graph().edges if edge.source == "__start__"), "pm")
            if first_node in AGENTS:
                stdout_redirector.current_tag = AGENTS[first_node]["log_name"]
                stdout_redirector.current_color = AGENTS[first_node]["color"]
                if AGENTS[first_node].get("index") is not None:
                    self.agent_status.emit(AGENTS[first_node]["index"], "running")

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

                    possible_next_nodes = linear_edges.get(node_name, [])
                    next_node = None
                    
                    if len(possible_next_nodes) == 1:
                        next_node = possible_next_nodes[0]
                    elif len(possible_next_nodes) > 1:
                        router_func_name = f"route_after_{node_name}"
                        if hasattr(graph_module, router_func_name):
                            router = getattr(graph_module, router_func_name)
                            next_node = router(state)

                    if next_node and next_node in AGENTS:
                        next_idx = AGENTS[next_node].get("index")
                        
                        stdout_redirector.current_tag = AGENTS[next_node]["log_name"]
                        stdout_redirector.current_color = AGENTS[next_node]["color"]
                        
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
    def __init__(self, agent_data):
        super().__init__()

        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)

        self.icon_label = QLabel() # Removed the emoji fallback
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.icon_label.setFixedSize(40, 40) 

        # Get the absolute path to the SVG for this specific agent
        icon_filename = agent_data.get("icon_file", "default.svg")
        icon_path = get_resource_path(f"assets/{icon_filename}")

        # Use the 'image' property to render the SVG inside the box
        # Added 'padding' so the SVG doesn't touch the borders of the 28x28 box
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

        # --- NEW: Setup Drop Shadow for the glow effect ---
        self.glow_effect = QGraphicsDropShadowEffect(self)
        self.glow_effect.setOffset(0, 0) # Centering it makes it a "glow" instead of a shadow
        self.glow_effect.setColor(QColor(0, 0, 0, 0)) # Start fully transparent
        self.glow_effect.setBlurRadius(0)
        self.dot.setGraphicsEffect(self.glow_effect)
        
        layout.addWidget(self.icon_label)
        layout.addLayout(text_layout)
        layout.addStretch() 
        layout.addWidget(self.dot)
        
        self.anim = QVariantAnimation(self)
        self.anim.setDuration(800) 
        self.anim.setStartValue(QColor("#F4FF5E")) 
        self.anim.setEndValue(QColor("#F0F5A6"))   
        self.anim.setLoopCount(-1) 
        self.anim.valueChanged.connect(self._on_color_pulse) # Renamed method

        # --- NEW: Spread (blur radius) animation ---
        self.blur_anim = QVariantAnimation(self)
        self.blur_anim.setDuration(800)
        self.blur_anim.setStartValue(6.0)  # Tight glow
        self.blur_anim.setEndValue(20.0)   # Spread out glow
        self.blur_anim.setLoopCount(-1)
        self.blur_anim.valueChanged.connect(self._on_blur_pulse)

    def _on_color_pulse(self, color):
        """Updates the dot color and the glow color."""
        self.dot.setStyleSheet(f"color: {color.name()}; font-size: 16px;")
        
        # Match the glow color to the dot, but make it slightly transparent
        glow_color = QColor(color)
        glow_color.setAlpha(180) # 0-255 scale (180 provides a nice soft light)
        self.glow_effect.setColor(glow_color)

    def _on_blur_pulse(self, radius):
        """Updates how far the glow spreads out."""
        self.glow_effect.setBlurRadius(radius)

    def set_status(self, status):
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

        # --- UPDATED: Animation and dot logic ---
        if status == "idle":
            self.anim.stop()
            self.blur_anim.stop()
            self.dot.setStyleSheet("color: #5a6a82; font-size: 16px;") 
            self.glow_effect.setColor(QColor(0, 0, 0, 0)) # Turn off glow
            
        elif status == "running":
            self.anim.start() 
            self.blur_anim.start()
            
        elif status == "done":
            self.anim.stop()
            self.blur_anim.stop()
            self.dot.setStyleSheet("color: #22c55e; font-size: 16px;") 
            self.glow_effect.setColor(QColor(0, 0, 0, 0)) # Turn off glow
            
        elif status == "error":
            self.anim.stop()
            self.blur_anim.stop()
            self.dot.setStyleSheet("color: #ef4444; font-size: 16px;") 
            self.glow_effect.setColor(QColor(0, 0, 0, 0)) # Turn off glow

class DockerMonitorWorker(QThread):
    docker_update = pyqtSignal(list)
    
    def __init__(self):
        super().__init__()
        self._is_running = True
        try:
            self.client = docker.from_env()
        except Exception:
            self.client = None

    def run(self):
        while self._is_running:
            if not self.client:
                self.sleep(2)
                continue

            try:
                containers = self.client.containers.list(
                    all=True, 
                    filters={"name": "autoprototype-"}
                )
                
                update_data = []
                for c in containers:
                    ports = []
                    port_data = c.attrs.get('NetworkSettings', {}).get('Ports', {})
                    if port_data:
                        for container_port, host_bindings in port_data.items():
                            if host_bindings:
                                ports.append(f":{host_bindings[0]['HostPort']}")
                    
                    port_str = ", ".join(ports) if ports else "--"
                    
                    update_data.append({
                        "name": c.name,
                        "status": c.status,
                        "ports": port_str
                    })
                
                self.docker_update.emit(update_data)
            except Exception as e:
                pass 
            
            self.sleep(1) 

    def stop(self):
        self._is_running = False

class SettingsDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Preferences")
        self.setFixedSize(450, 150)
        
        # Match your dark theme
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
        
        self.api_key_input = QLineEdit()
        self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password) 
        self.api_key_input.setPlaceholderText("sk-ant-...")
        
        # Load existing key
        self.settings = QSettings("AutoPrototype", "AppSettings")
        saved_key = self.settings.value("anthropic_api_key", "")
        if saved_key:
            self.api_key_input.setText(saved_key)
            
        form_layout.addRow("Anthropic API Key:", self.api_key_input)
        layout.addLayout(form_layout)
        
        self.button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Save | QDialogButtonBox.StandardButton.Cancel
        )
        self.button_box.accepted.connect(self.save_settings)
        self.button_box.rejected.connect(self.reject)
        layout.addWidget(self.button_box)
        
    def save_settings(self):
        key = self.api_key_input.text().strip()
        self.settings.setValue("anthropic_api_key", key)
        if key:
            os.environ["ANTHROPIC_API_KEY"] = key
        self.accept()

class MainWindow(QMainWindow, Ui_MainWindow):
    def __init__(self):
        super().__init__()
        self.setupUi(self)

        self.setStyleSheet(self.styleSheet() + """
            QTextEdit#promptEdit:disabled {
                background-color: #12151a;   /* Darker, muted background */
                color: #5a6a82;              /* Dimmed gray text */
                border: 1px solid #1e2330;   /* Dimmed border */
            }
        """)

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

        self.badge_glow = QGraphicsDropShadowEffect(self)
        self.badge_glow.setOffset(0, 0)
        self.badge_glow.setColor(QColor(0, 0, 0, 0)) # Start transparent
        self.badge_glow.setBlurRadius(0)
        self.liveBadge.setGraphicsEffect(self.badge_glow)

        self.badge_anim = QVariantAnimation(self)
        self.badge_anim.setDuration(800)
        self.badge_anim.setStartValue(QColor("#F4FF5E"))
        self.badge_anim.setEndValue(QColor("#F0F5A6"))
        self.badge_anim.setLoopCount(-1)
        self.badge_anim.valueChanged.connect(self._on_badge_pulse)

        self.badge_blur_anim = QVariantAnimation(self)
        self.badge_blur_anim.setDuration(800)
        self.badge_blur_anim.setStartValue(6.0)
        self.badge_blur_anim.setEndValue(20.0)
        self.badge_blur_anim.setLoopCount(-1)
        self.badge_blur_anim.valueChanged.connect(self._on_badge_blur)

        self.set_badge_state("IDLE")

        self.spinner_angle = 0
        self.spinner_base = QPixmap(get_resource_path("assets/spinner.svg")).scaled(
            20, 20, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation
        )
        self.spinner_timer = QTimer(self)
        self.spinner_timer.timeout.connect(self._update_spinner)

    # --- NEW: Popup Error Handler ---
    def _show_error_popup(self, title: str, message: str):
        """Displays a dark-themed error dialog box to the user."""
        msg = QMessageBox(self)
        msg.setWindowTitle(title)
        msg.setText(message)
        msg.setIcon(QMessageBox.Icon.Warning)
        
        # Style it to match the application's dark theme
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
        """Advances the SVG spinner animation by rotating it."""
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
        
        # Apply the rotated image as the button's icon
        self.runButton.setIcon(QIcon(rotated))
        self.runButton.setIconSize(QSize(20, 20))

    def _reset_button_states(self):
        """Restores the buttons to their default idle configurations."""
        self.spinner_timer.stop()
        self.runButton.setIcon(QIcon())
        self.runButton.setText("▶   RUN PIPELINE")
        self.runButton.setEnabled(True)
        self.stopButton.setEnabled(False)
        self.promptEdit.setDisabled(False)

    def _start_docker_monitor(self):
        self.docker_worker = DockerMonitorWorker()
        self.docker_worker.docker_update.connect(self._handle_docker_update)
        self.docker_worker.start()

    def _on_badge_pulse(self, color):
        """Pulses the text color and the shadow color of the live badge."""
        self.liveBadge.setStyleSheet(
            f"background-color: {self.badge_bg_color}; color: {color.name()}; border-radius:3px;"
            "font-size:9px; padding:1px 6px; letter-spacing:1px;"
        )
        glow_color = QColor(color)
        glow_color.setAlpha(180) 
        self.badge_glow.setColor(glow_color)

    def _on_badge_blur(self, radius):
        """Pulses the radius of the live badge glow."""
        self.badge_glow.setBlurRadius(radius)

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
# --- NEW: Override the list stylesheet to kill hover/selection effects ---
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
        
        # 3. Add the root item
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

        for row in range(self.dockerTable.rowCount()):
            dot = QTableWidgetItem("●")
            dot.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            dot.setForeground(QColor(STATUS_IDLE[1]))
            self.dockerTable.setItem(row, 0, dot)

    def _connect_signals(self):
        self.runButton.clicked.connect(self._on_run)
        self.stopButton.clicked.connect(self._on_stop)

        self.fileTree.itemClicked.connect(self._on_tree_item_clicked)

        self.actionPreferences.triggered.connect(self._open_settings)

    def _on_run(self):
        # 1. Check for blank prompt
        prompt = self.promptEdit.toPlainText().strip()
        if not prompt:
            self._show_error_popup("Missing Input", "Please enter a prompt describing your application before running.")
            return

        # 2. Check for API Key
        load_dotenv() # Fallback for local .env testing
        if not os.getenv("ANTHROPIC_API_KEY"):
            self._show_error_popup(
                "Missing API Key", 
                "Your Anthropic API key is not configured.\n\nPlease open 'Settings > Preferences...' to add your key before running the pipeline."
            )
            return

        # 3. Check for Docker Engine Connection
        try:
            client = docker.from_env()
            client.ping()
        except Exception:
            self._show_error_popup(
                "Docker Error", 
                "Could not connect to Docker.\n\nPlease ensure Docker Desktop or the Docker daemon is running before starting the pipeline."
            )
            return

        # Passed checks, start pipeline execution
        self.runButton.setEnabled(False)
        self.stopButton.setEnabled(True)
        self.promptEdit.setDisabled(True)

        self.spinner_angle = 0
        self.runButton.setText("  RUNNING PIPELINE") 
        self._update_spinner()       
        self.spinner_timer.start(30)
    
        self.set_badge_state("RUNNING")

        self.logOutput.clear()
        self._append_log("[SYSTEM]", "Pipeline initializing...", "#5a6a82")
        self.set_progress(0)

        for i in range(len(self.agent_widgets)):
            self.set_agent_status(i, "idle")

        self.worker = PipelineWorker(prompt)
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

    def _append_log(self, agent: str, message: str, color: str = "#c8d4e8"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        cursor = self.logOutput.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.End)

        # 1. Force a strict monospaced font for the Python text cursor
        doc_font = QFont("Courier New", 9)
        doc_font.setStyleHint(QFont.StyleHint.Monospace)
        doc_font.setFixedPitch(True)

        # 2. Use the exact same font to calculate the 26-character indent (11 timestamp + 15 agent)
        metrics = QFontMetrics(doc_font)
        indent_pixels = metrics.horizontalAdvance(" " * 26) 

        # Create a "Hanging Indent" block layout
        block_fmt = QTextBlockFormat()
        block_fmt.setLeftMargin(indent_pixels)       # Push everything to the right
        block_fmt.setTextIndent(-indent_pixels)      # Pull ONLY the first line back left

        fmt_timestamp = QTextCharFormat()
        fmt_timestamp.setForeground(QColor("#5a6a82"))
        fmt_timestamp.setFont(doc_font)

        fmt_agent = QTextCharFormat()
        fmt_agent.setForeground(QColor(color))
        fmt_agent.setFont(doc_font)
        
        fmt_msg = QTextCharFormat()
        fmt_msg.setForeground(QColor("#c8d4e8"))
        fmt_msg.setFont(doc_font)

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
            
            # Insert the message
            cursor.setCharFormat(fmt_msg)
            cursor.insertText(line)

        self.logOutput.ensureCursorVisible()

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
        """Updates the live badge text, colors, and animations based on the state."""
        # Stop animations while we change the colors
        self.badge_anim.stop()
        self.badge_blur_anim.stop()

        if state == "IDLE":
            self.liveBadge.setText("● IDLE")
            self.badge_bg_color = "#1e3a8a"               # Dark blue background
            self.badge_anim.setStartValue(QColor("#3b82f6")) # Blue text
            self.badge_anim.setEndValue(QColor("#93c5fd"))   # Lighter blue glow

        elif state == "RUNNING":
            self.liveBadge.setText("● RUNNING")
            self.badge_bg_color = "#3f3f00"               # Dark yellow background
            self.badge_anim.setStartValue(QColor("#facc15")) # Yellow text
            self.badge_anim.setEndValue(QColor("#fef08a"))   # Lighter yellow glow

        elif state == "SUCCESS":
            self.liveBadge.setText("● SUCCESS")
            self.badge_bg_color = "#166534"               # Dark green background
            self.badge_anim.setStartValue(QColor("#22c55e")) # Green text
            self.badge_anim.setEndValue(QColor("#86efac"))   # Lighter green glow

        elif state == "WARNING":
            self.liveBadge.setText("● WARNING")
            self.badge_bg_color = "#713f12"               # Dark orange background
            self.badge_anim.setStartValue(QColor("#eab308")) # Orange text
            self.badge_anim.setEndValue(QColor("#fde047"))   # Lighter orange glow

        elif state == "STOPPED":
            self.liveBadge.setText("● STOPPED")
            self.badge_bg_color = "#450a0a"               # Dark red background
            self.badge_anim.setStartValue(QColor("#ef4444")) # Red text
            self.badge_anim.setEndValue(QColor("#fca5a5"))   # Lighter red glow

        # Restart animations with the newly configured colors
        self.badge_anim.start()
        self.badge_blur_anim.start()

    def add_file_to_tree(self, path: str):
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
                # Make sure your add_file_to_tree looks like this:
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
            if "📄" in child.text(0):
                count += 1
            count += self._count_files(child)
        return count
    
if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion") 
    window = MainWindow()
    window.show()
    sys.exit(app.exec())