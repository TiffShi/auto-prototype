import sys
import os
import traceback

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QListWidgetItem,
    QTreeWidgetItem, QTableWidgetItem, QHeaderView, QWidget, QHBoxLayout, QVBoxLayout, QLabel
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QSize, QVariantAnimation, QAbstractAnimation
from PyQt6.QtGui import QColor, QFont

# 1. Import the generated UI class
from ui_architectai import Ui_MainWindow

from core.graph import create_graph
from dotenv import load_dotenv



# ── Agent metadata ──────────────────────────────────────────────────
AGENTS = [
    {"name": "Program Manager", "role": "ORCHESTRATOR",       "color": "#3b82f6", "icon":"🧠"},
    {"name": "Backend",         "role": "API / SERVICES",      "color": "#a855f7", "icon":"🎨"},
    {"name": "Frontend",        "role": "UI / UX AGENT",       "color": "#22c55e", "icon":"⚙️"},
    {"name": "DevOps",          "role": "INFRA / DOCKER",      "color": "#d15897", "icon":"🐳"},
    {"name": "Exec Node",       "role": "EXECUTION NODE",      "color": "#f97316", "icon":"🦕"},
    {"name": "Debugger",        "role": "REVIEW / FIX",        "color": "#d15858", "icon":"🐛"},
]

# Status dot unicode + color
STATUS_IDLE    = ("●", "#2e3849")
STATUS_RUNNING = ("●", "#3b82f6")
STATUS_DONE    = ("●", "#22c55e")
STATUS_WAITING = ("●", "#eab308")
STATUS_ERROR   = ("●", "#ef4444")

# --- NODE METADATA MAPPING ---
# Maps LangGraph node names to the UI indices, log colors, and progress %
NODE_METADATA = {
    "pm":       {"index": 0, "name": "[PM]",       "color": "#3b82f6", "progress": 15},
    "frontend": {"index": 1, "name": "[FRONTEND]", "color": "#22c55e", "progress": 30},
    "backend":  {"index": 2, "name": "[BACKEND]",  "color": "#a855f7", "progress": 45},
    "devops":   {"index": 4, "name": "[DEVOPS]",   "color": "#0ea5e9", "progress": 60},
    "executor": {"index": 3, "name": "[EXEC]",     "color": "#06b6d4", "progress": 75},
    "debugger": {"index": 5, "name": "[DEBUG]",    "color": "#f97316", "progress": 90},
    "saver":    {"index": None, "name": "[SAVER]","color": "#64748b", "progress": 100},
}

class PipelineWorker(QThread):
    # Define signals to communicate with the UI thread
    log_line = pyqtSignal(str, str, str)  # agent_name, message, hex_color
    progress = pyqtSignal(int)            # percentage
    agent_status = pyqtSignal(int, str) # agent_index, STATUS_TUPLE
    finished_pipeline = pyqtSignal(dict)  # final_state

    new_file = pyqtSignal(str)

    def __init__(self, prompt):
        super().__init__()
        self.prompt = prompt
        self._is_running = True

        self._seen_files = set()

    def run(self):
        load_dotenv()
        app = create_graph()
        
        # Initialize the state exactly as you did in main.py
        state = {
            "user_idea": self.prompt,
            "error_messages": [],
            "iteration_count": 0
        }

        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(current_dir, "output_prototype")
        
        try:
            # Set PM to running before the stream even starts
            self.agent_status.emit(NODE_METADATA["pm"]["index"], "running")

            # Stream the LangGraph workflow step-by-step
            for event in app.stream(state):
                if not self._is_running:
                    self.log_line.emit("[SYSTEM]", "Pipeline execution aborted by user.", "#ef4444")
                    break

                for node_name, state_update in event.items():
                    meta = NODE_METADATA.get(node_name, {"name": f"[{node_name.upper()}]", "color": "#c8d4e8", "progress": 0})
                    
                    # Update our local state tracker FIRST so we can check it for routing logic
                    state.update(state_update)
                    
                    # 1. The current node just finished, set it to DONE (Green)
                    if meta.get("index") is not None:
                        self.agent_status.emit(meta["index"], "done")
                        
                    # 2. Log that the node completed
                    self.log_line.emit(meta["name"], f"Node '{node_name}' generated updates.", meta["color"])
                    
                    # 3. Update Progress Bar
                    if meta.get("progress"):
                        self.progress.emit(meta["progress"])

                    # 4. Predict the NEXT node based on the graph and set it to RUNNING (Orange Pulse)
                    if node_name == "pm":
                        self.agent_status.emit(NODE_METADATA["backend"]["index"], "running")
                    elif node_name == "backend":
                        self.agent_status.emit(NODE_METADATA["frontend"]["index"], "running")
                    elif node_name == "frontend":
                        self.agent_status.emit(NODE_METADATA["devops"]["index"], "running")
                    elif node_name == "devops":
                        self.agent_status.emit(NODE_METADATA["executor"]["index"], "running")
                    elif node_name == "executor":
                        self.agent_status.emit(NODE_METADATA["debugger"]["index"], "running")
                    elif node_name == "debugger":
                        # Check the router logic: Did QA fail?
                        errors = state.get("error_messages", [])
                        iterations = state.get("iteration_count", 0)
                        
                        if errors and iterations < 3:
                            # WE ARE LOOPING BACK! 
                            # Reset downstream agents to Gray (idle)
                            self.agent_status.emit(NODE_METADATA["frontend"]["index"], "idle")
                            self.agent_status.emit(NODE_METADATA["devops"]["index"], "idle")
                            self.agent_status.emit(NODE_METADATA["executor"]["index"], "idle")
                            self.agent_status.emit(NODE_METADATA["debugger"]["index"], "idle")
                            
                            # Set Backend back to Orange (running)
                            self.agent_status.emit(NODE_METADATA["backend"]["index"], "running")
                            
                            self.log_line.emit("[SYSTEM]", f"Bugs found. Looping back to Backend (Iteration {iterations}).", "#eab308")

                    # 5. Check for newly written files on disk
                    if os.path.exists(output_dir):
                        for root, dirs, files in os.walk(output_dir):
                            for file in files:
                                full_path = os.path.join(root, file)
                                
                                # If we haven't added this file to the UI tree yet
                                if full_path not in self._seen_files:
                                    self._seen_files.add(full_path)
                                    
                                    # Convert to a relative path like 'frontend/src/App.jsx'
                                    rel_path = os.path.relpath(full_path, output_dir)
                                    rel_path = rel_path.replace("\\", "/") 
                                    
                                    self.new_file.emit(rel_path)
                    
        except Exception as e:
            self.log_line.emit("[SYSTEM]", f"Pipeline crashed: {str(e)}", "#ef4444")
        
        self.finished_pipeline.emit(state)

    def stop(self):
        """Signals the thread to break out of the stream loop."""
        self._is_running = False

class AgentItemWidget(QWidget):
    def __init__(self, agent_data):
        super().__init__()
        
        # 1. Layout setup
        layout = QHBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)

        # 3. Icon (Using an emoji as a placeholder, but you can use QIcon/QPixmap)
        self.icon_label = QLabel(agent_data.get("icon", "🤖")) 
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.icon_label.setFixedSize(28, 28) 
        
        # Add padding-bottom to physically nudge the emoji upward
        self.icon_label.setStyleSheet("""
            background-color: #1e2330;
            border: 1px solid #2e3849;
            border-radius: 6px;
            font-size: 14px;
            padding-bottom: 1px; 
        """)

         # 4. Text Labels (Name and Role)
        text_layout = QVBoxLayout()
        text_layout.setSpacing(1) # Tightened spacing slightly to make room
        
        self.name_label = QLabel(agent_data["name"])
        # Added padding-bottom: 2px; to prevent descenders (g, p, y) from cutting off
        self.name_label.setStyleSheet(f"color: {agent_data['color']}; font-weight: bold; font-size: 11px; padding-bottom: 2px;")
        
        self.role_label = QLabel(agent_data["role"])
        # Added padding-bottom to the role as well just in case!
        self.role_label.setStyleSheet("color: #5a6a82; font-size: 9px; padding-bottom: 2px;")
        
        text_layout.addWidget(self.name_label)
        text_layout.addWidget(self.role_label)
        
        # 2. Status Dot
        self.dot = QLabel("●")
        self.dot.setStyleSheet("color: #5a6a82; font-size: 16px;") # Default Gray
        
        # 5. Add to main layout
        layout.addWidget(self.icon_label)
        layout.addLayout(text_layout)
        layout.addStretch() # Pushes everything to the left
        layout.addWidget(self.dot)
        
        # 6. Setup Pulsing Animation (UPDATED TO ORANGE)
        self.anim = QVariantAnimation(self)
        self.anim.setDuration(800) # 800ms pulse
        self.anim.setStartValue(QColor("#f97316")) # Bright Orange
        self.anim.setEndValue(QColor("#9a3412"))   # Darker Orange
        self.anim.setLoopCount(-1) # Loop infinitely
        self.anim.valueChanged.connect(self._on_pulse)

    def _on_pulse(self, color):
        self.dot.setStyleSheet(f"color: {color.name()}; font-size: 16px;")

    def set_status(self, status):
        """status can be 'idle', 'running', or 'done'"""
        if status == "idle":
            self.anim.stop()
            self.dot.setStyleSheet("color: #5a6a82; font-size: 16px;") # Gray
        elif status == "running":
            self.anim.start() # Start yellow pulse
        elif status == "done":
            self.anim.stop()
            self.dot.setStyleSheet("color: #22c55e; font-size: 16px;") # Green
        elif status == "error":
            self.anim.stop()
            self.dot.setStyleSheet("color: #ef4444; font-size: 16px;") # Red

class MainWindow(QMainWindow, Ui_MainWindow):
    def __init__(self):
        super().__init__()
        
        # 3. Now Python knows what setupUi is because it inherited it!
        self.setupUi(self)

        self._setup_agent_list()
        self._setup_file_tree()
        self._setup_docker_table()
        self._setup_status_bar()
        self._connect_signals()
        
    # ── Setup ────────────────────────────────────────────────────────

    def _setup_agent_list(self):
        # """Populate the agent sidebar with name + role text."""
        # self.agentList.clear()
        # for agent in AGENTS:
        #     item = QListWidgetItem(f"  {agent['name']}\n  {agent['role']}")
        #     item.setForeground(QColor(agent["color"]))
        #     self.agentList.addItem(item)  

        self.agentList.clear()
        self.agent_widgets = [] # Keep references to update them later
        
        for agent in AGENTS:
            # Create standard QListWidgetItem
            item = QListWidgetItem()
            # Crucial: Set a size hint so the custom widget fits properly
            item.setSizeHint(QSize(200, 55)) 
            self.agentList.addItem(item)
            
            # Create our custom layout widget and inject it
            widget = AgentItemWidget(agent)
            self.agentList.setItemWidget(item, widget)
            self.agent_widgets.append(widget)

    def _setup_file_tree(self):
        """Seed an empty output/ root node."""
        self.fileTree.clear()
        root = QTreeWidgetItem(self.fileTree, ["📁  output/"])
        root.setExpanded(True)
        self.fileTree.header().setVisible(False)

    def _setup_docker_table(self):
        """Style the docker table columns."""
        hdr = self.dockerTable.horizontalHeader()
        hdr.setSectionResizeMode(0, QHeaderView.ResizeMode.Fixed)
        hdr.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        hdr.setSectionResizeMode(2, QHeaderView.ResizeMode.Fixed)
        hdr.setSectionResizeMode(3, QHeaderView.ResizeMode.Fixed)
        self.dockerTable.setColumnWidth(0, 28)
        self.dockerTable.setColumnWidth(2, 55)
        self.dockerTable.setColumnWidth(3, 70)

        # Seed status dots in column 0
        for row in range(self.dockerTable.rowCount()):
            dot = QTableWidgetItem("●")
            dot.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            dot.setForeground(QColor(STATUS_IDLE[1]))
            self.dockerTable.setItem(row, 0, dot)

    def _setup_status_bar(self):
        self.statusBar.showMessage(
            "  ● Idle   |   Step 0 / 6   |   Output: ~/output   |   Python 3.12   |   Docker"
        )

    def _connect_signals(self):
        self.runButton.clicked.connect(self._on_run)
        self.stopButton.clicked.connect(self._on_stop)

# ── Slots ────────────────────────────────────────────────────────

    def _on_run(self):
        prompt = self.promptEdit.toPlainText().strip()
        if not prompt:
            self.statusBar.showMessage("  ⚠  Please enter a prompt first.")
            return

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

        # Reset all agent dots to IDLE
        for i in range(len(AGENTS)):
            self.set_agent_status(i, "idle")

        # Initialize and connect the real LangGraph thread
        self.worker = PipelineWorker(prompt)
        self.worker.log_line.connect(self._append_log)
        self.worker.progress.connect(self.set_progress)
        self.worker.agent_status.connect(self.set_agent_status)
        self.worker.finished_pipeline.connect(self._on_finished)

        self.worker.new_file.connect(self.add_file_to_tree)
        
        self.worker.start()

    def _on_stop(self):
        if hasattr(self, 'worker') and self.worker.isRunning():
            self.worker.stop() # Gracefully tell the generator loop to break
            
        self.runButton.setEnabled(True)
        self.stopButton.setEnabled(False)
        self.liveBadge.setText("● STOPPED")
        self.liveBadge.setStyleSheet(
            "background-color:#450a0a; color:#ef4444; border-radius:3px;"
            "font-size:9px; padding:1px 6px; letter-spacing:1px;"
        )
        self._append_log("[SYSTEM]", "Stop requested. Halting after current node...", "#eab308")

    def _on_finished(self, final_state):
        """Called automatically when the QThread finishes."""
        self.runButton.setEnabled(True)
        self.stopButton.setEnabled(False)
        
        # Analyze metrics exactly like main.py
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

    # ── Public API (call from your worker thread via signals) ────────

    def _append_log(self, agent: str, message: str, color: str = "#c8d4e8"):
        """Append a formatted line to the main log panel."""
        cursor = self.logOutput.textCursor()
        from PyQt6.QtGui import QTextCharFormat, QTextCursor
        cursor.movePosition(QTextCursor.MoveOperation.End)

        # Agent tag
        fmt_agent = QTextCharFormat()
        fmt_agent.setForeground(QColor(color))
        cursor.setCharFormat(fmt_agent)
        cursor.insertText(f"{agent:<16}")

        # Message
        fmt_msg = QTextCharFormat()
        fmt_msg.setForeground(QColor("#c8d4e8"))
        cursor.setCharFormat(fmt_msg)
        cursor.insertText(f"{message}\n")

        self.logOutput.ensureCursorVisible()

    def set_agent_status(self, index: int, status_string: str):
        # """Update a row's status dot. Pass one of STATUS_* constants."""
        # dot_char, dot_color = status
        # item = self.agentList.item(index)
        # if item:
        #     item.setForeground(QColor(dot_color))

        """Update a row's status dot. Pass 'idle', 'running', 'done', or 'error'."""
        if 0 <= index < len(self.agent_widgets):
            widget = self.agent_widgets[index]
            widget.set_status(status_string)

    def set_progress(self, value: int):
        """Update the pipeline progress bar (0–100)."""
        self.pipelineProgress.setValue(value)
        self.progressPct.setText(f"{value}%")

    def add_file_to_tree(self, path: str):
        """
        Add a generated file path to the output tree.
        path example: 'frontend/src/App.tsx'
        """
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
        """Update a docker container row. state: 'queued'|'building'|'running'|'error'"""
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


# ── Entry point ──────────────────────────────────────────────────────

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")          # Consistent cross-platform base
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
