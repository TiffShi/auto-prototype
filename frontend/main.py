import sys
import os
import traceback
import docker
from docker.errors import NotFound, APIError

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QListWidgetItem,
    QTreeWidgetItem, QTableWidgetItem, QHeaderView, QWidget, QHBoxLayout, QVBoxLayout, QLabel,
    QPlainTextEdit, QMessageBox # <-- Added QMessageBox
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QSize, QVariantAnimation, QObject
from PyQt6.QtGui import QColor, QTextCharFormat, QTextCursor, QTextBlockFormat 

# 1. Import the generated UI class
from ui_architectai import Ui_MainWindow

from core.graph import create_graph
from core import graph as graph_module  
from dotenv import load_dotenv

# Status dot unicode + color
STATUS_IDLE    = ("●", "#2e3849")
STATUS_RUNNING = ("●", "#3b82f6")
STATUS_DONE    = ("●", "#22c55e")
STATUS_WAITING = ("●", "#eab308")
STATUS_ERROR   = ("●", "#ef4444")

# --- CONSOLIDATED AGENTS & METADATA ---
AGENTS = {
    "pm":       {"index": 0,    "log_name": "[PM]",       "name": "Program Manager", "role": "ORCHESTRATOR",   "color": "#3b82f6", "icon": "🧠", "progress": 15},
    "backend":  {"index": 1,    "log_name": "[BACKEND]",  "name": "Backend",         "role": "API / SERVICES", "color": "#a855f7", "icon": "🎨", "progress": 30},
    "frontend": {"index": 2,    "log_name": "[FRONTEND]", "name": "Frontend",        "role": "UI / UX AGENT",  "color": "#22c55e", "icon": "⚙️", "progress": 45},
    "devops":   {"index": 3,    "log_name": "[DEVOPS]",   "name": "DevOps",          "role": "INFRA / DOCKER", "color": "#0ea5e9", "icon": "🐳", "progress": 60},
    "executor": {"index": 4,    "log_name": "[EXEC]",     "name": "Exec Node",       "role": "EXECUTION NODE", "color": "#f97316", "icon": "🦕", "progress": 75},
    "debugger": {"index": 5,    "log_name": "[DEBUG]",    "name": "Debugger",        "role": "REVIEW / FIX",   "color": "#db5151", "icon": "🐛", "progress": 90},
    "saver":    {"index": None, "log_name": "[SAVER]",    "name": "Saver",           "role": "FILE SAVER",     "color": "#64748b", "icon": "💾", "progress": 100},
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
        layout = QHBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)

        self.icon_label = QLabel(agent_data.get("icon", "🤖")) 
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.icon_label.setFixedSize(28, 28) 
        self.icon_label.setStyleSheet("""
            background-color: #1e2330;
            border: 1px solid #2e3849;
            border-radius: 6px;
            font-size: 14px;
            padding-bottom: 1px; 
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
        
        layout.addWidget(self.icon_label)
        layout.addLayout(text_layout)
        layout.addStretch() 
        layout.addWidget(self.dot)
        
        self.anim = QVariantAnimation(self)
        self.anim.setDuration(800) 
        self.anim.setStartValue(QColor("#f97316")) 
        self.anim.setEndValue(QColor("#9a3412"))   
        self.anim.setLoopCount(-1) 
        self.anim.valueChanged.connect(self._on_pulse)

    def _on_pulse(self, color):
        self.dot.setStyleSheet(f"color: {color.name()}; font-size: 16px;")

    def set_status(self, status):
        if status == "idle":
            self.anim.stop()
            self.dot.setStyleSheet("color: #5a6a82; font-size: 16px;") 
        elif status == "running":
            self.anim.start() 
        elif status == "done":
            self.anim.stop()
            self.dot.setStyleSheet("color: #22c55e; font-size: 16px;") 
        elif status == "error":
            self.anim.stop()
            self.dot.setStyleSheet("color: #ef4444; font-size: 16px;") 

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

class MainWindow(QMainWindow, Ui_MainWindow):
    def __init__(self):
        super().__init__()
        self.setupUi(self)

        # OVERRIDE: Allow logs to wrap dynamically based on window width
        self.logOutput.setLineWrapMode(QPlainTextEdit.LineWrapMode.WidgetWidth)

        self._setup_agent_list()
        self._setup_file_tree()
        self._setup_docker_table()
        self._connect_signals()
        self._start_docker_monitor()

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

    def _start_docker_monitor(self):
        self.docker_worker = DockerMonitorWorker()
        self.docker_worker.docker_update.connect(self._handle_docker_update)
        self.docker_worker.start()

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
            self.dockerTable.item(row, 2).setText(ports)
            self.dockerTable.item(row, 3).setText(state.upper())
            self.dockerTable.item(row, 3).setForeground(QColor(state_color))

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
        root = QTreeWidgetItem(self.fileTree, ["📁  output/"])
        root.setExpanded(True)
        self.fileTree.header().setVisible(False)

    def _setup_docker_table(self):
        hdr = self.dockerTable.horizontalHeader()
        hdr.setSectionResizeMode(0, QHeaderView.ResizeMode.Fixed)
        hdr.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        hdr.setSectionResizeMode(2, QHeaderView.ResizeMode.Fixed)
        hdr.setSectionResizeMode(3, QHeaderView.ResizeMode.Fixed)
        self.dockerTable.setColumnWidth(0, 28)
        self.dockerTable.setColumnWidth(2, 55)
        self.dockerTable.setColumnWidth(3, 70)

        for row in range(self.dockerTable.rowCount()):
            dot = QTableWidgetItem("●")
            dot.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            dot.setForeground(QColor(STATUS_IDLE[1]))
            self.dockerTable.setItem(row, 0, dot)

    def _connect_signals(self):
        self.runButton.clicked.connect(self._on_run)
        self.stopButton.clicked.connect(self._on_stop)

    def _on_run(self):
        # 1. Check for blank prompt
        prompt = self.promptEdit.toPlainText().strip()
        if not prompt:
            self._show_error_popup("Missing Input", "Please enter a prompt describing your application before running.")
            return

        # 2. Check for API Key
        load_dotenv()
        if not os.getenv("ANTHROPIC_API_KEY"):
            self._show_error_popup(
                "Missing API Key", 
                "ANTHROPIC_API_KEY is not set.\n\nPlease add it to your .env file or system environment variables."
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
        self.liveBadge.setText("● RUNNING")
        self.liveBadge.setStyleSheet(
            "background-color:#166534; color:#22c55e; border-radius:3px;"
            "font-size:9px; padding:1px 6px; letter-spacing:1px;"
        )
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
            
        self.runButton.setEnabled(True)
        self.stopButton.setEnabled(False)
        self.liveBadge.setText("● STOPPED")
        self.liveBadge.setStyleSheet(
            "background-color:#450a0a; color:#ef4444; border-radius:3px;"
            "font-size:9px; padding:1px 6px; letter-spacing:1px;"
        )
        self._append_log("[SYSTEM]", "Stop requested. Halting after current node...", "#eab308")

    def _on_finished(self, final_state):
        self.runButton.setEnabled(True)
        self.stopButton.setEnabled(False)
        
        iterations = final_state.get("iteration_count", 0)
        unresolved = len(final_state.get("error_messages", []))
        
        if unresolved == 0:
            self.liveBadge.setText("● SUCCESS")
            self.liveBadge.setStyleSheet("background-color:#166534; color:#22c55e; border-radius:3px;")
            self._append_log("[SYSTEM]", f"Pipeline complete in {iterations} iterations (Pass@1: {iterations == 0}).", "#22c55e")
        else:
            self.liveBadge.setText("● WARNING")
            self.liveBadge.setStyleSheet("background-color:#713f12; color:#eab308; border-radius:3px;")
            self._append_log("[SYSTEM]", f"Pipeline finished with {unresolved} unresolved bugs.", "#eab308")

    def _append_log(self, agent: str, message: str, color: str = "#c8d4e8"):
        cursor = self.logOutput.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.End)

        # Calculate exact width of 16 characters in the current font
        metrics = self.logOutput.fontMetrics()
        indent_pixels = metrics.horizontalAdvance(" " * 16) 

        # Create a "Hanging Indent" block layout
        block_fmt = QTextBlockFormat()
        block_fmt.setLeftMargin(indent_pixels)       # Push everything to the right
        block_fmt.setTextIndent(-indent_pixels)      # Pull ONLY the first line back left

        fmt_agent = QTextCharFormat()
        fmt_agent.setForeground(QColor(color))
        
        fmt_msg = QTextCharFormat()
        fmt_msg.setForeground(QColor("#c8d4e8"))

        for line in message.splitlines():
            if not line.strip(): 
                continue
            
            # Start a new formatted block, unless we're on the very first empty line of the file
            if cursor.block().length() <= 1: 
                cursor.setBlockFormat(block_fmt)
            else:
                cursor.insertBlock(block_fmt)
            
            # Insert the agent tag (gets pulled left by the negative textIndent)
            cursor.setCharFormat(fmt_agent)
            cursor.insertText(f"{agent:<16}")
            
            # Insert the message (starts exactly at the leftMargin)
            cursor.setCharFormat(fmt_msg)
            cursor.insertText(line)

        self.logOutput.ensureCursorVisible()

    def set_agent_status(self, index: int, status_string: str):
        if 0 <= index < len(self.agent_widgets):
            widget = self.agent_widgets[index]
            widget.set_status(status_string)

    def set_progress(self, value: int):
        self.pipelineProgress.setValue(value)
        self.progressPct.setText(f"{value}%")

    def add_file_to_tree(self, path: str):
        parts = path.split("/")
        root = self.fileTree.invisibleRootItem().child(0)
        parent = root
        for i, part in enumerate(parts):
            found = None
            for j in range(parent.childCount()):
                node_text = parent.child(j).text(0)
                clean_name = node_text.replace("📁", "").replace("📄", "").strip().rstrip("/")
                if clean_name == part:
                    found = parent.child(j)
                    break
            if found is None:
                is_dir = i < len(parts) - 1
                label = f"📁  {part}/" if is_dir else f"📄  {part}"
                node = QTreeWidgetItem(parent, [label])
                if not is_dir:
                    node.setForeground(0, QColor("#3b82f6"))
                parent = node
            else:
                parent = found
        self.fileCountLabel.setText(
            f"{self._count_files(self.fileTree.invisibleRootItem())} files"
        )

    def _count_files(self, item) -> int:
        count = 0
        for i in range(item.childCount()):
            child = item.child(i)
            if "📄" in child.text(0):
                count += 1
            count += self._count_files(child)
        return count

    def set_docker_status(self, row: int, state: str):
        colors = {
            "queued":   ("#2e3849", "#5a6a82"),
            "building": ("#eab308", "#eab308"),
            "running":  ("#22c55e", "#22c55e"),
            "error":    ("#ef4444", "#ef4444"),
        }
        dot_color, state_color = colors.get(state, colors["queued"])
        dot_item = self.dockerTable.item(row, 0)
        if dot_item:
            dot_item.setForeground(QColor(dot_color))
        state_item = self.dockerTable.item(row, 3)
        if state_item:
            state_item.setText(state)
            state_item.setForeground(QColor(state_color))

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion") 
    window = MainWindow()
    window.show()
    sys.exit(app.exec())