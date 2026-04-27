# run_gui.py
import sys
import os
import ctypes
from PyQt6.QtWidgets import QApplication
from PyQt6.QtGui import QPalette, QColor, QIcon

from src.gui.main_window import MainWindow, get_resource_path

if __name__ == "__main__":
    # Force Wayland in WSL to allow dark Client-Side Decorations (CSD)
    if sys.platform.startswith("linux"):
        os.environ["QT_QPA_PLATFORM"] = "wayland;xcb"
        os.environ["GTK_THEME"] = "Adwaita:dark"

    # Force Windows/WSL taskbar to use a custom ID before QApplication is initialized
    try:
        myappid = 'auto_prototype_frontend.v1' 
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