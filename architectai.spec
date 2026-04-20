# -*- mode: python ; coding: utf-8 -*-
import sys

# PyInstaller needs different file types for the physical executable icon
if sys.platform == 'darwin':
    icon_file = 'frontend/assets/logo.icns' # Mac requires .icns
elif sys.platform == 'win32':
    icon_file = 'frontend/assets/logo.ico'  # Windows requires .ico
else:
    icon_file = 'frontend/assets/logo.svg'  # Linux ignores this, but needs a valid path to not crash

block_cipher = None

a = Analysis(
    ['frontend/main.py'],  # The main entry point for your PyQt6 UI
    pathex=['.'],
    binaries=[],
    datas=[
        ('agents', 'agents'),        # Include the agents folder
        ('core', 'core'),            # Include the core folder
        ('sandbox', 'sandbox'),      # Include the sandbox folder
        ('frontend/assets', 'assets'),
    ],
    hiddenimports=[
        'langgraph',
        'langchain_anthropic',
        'langchain_core',
        'anthropic',
        'tenacity',
        'pydantic',
        'dotenv'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# This creates a ONE-FOLDER build (better for loading times and making installers)
exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ArchitectAI',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False, # TIP: Keep this True while testing so you can see print() errors! Change to False later.
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=icon_file
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ArchitectAI',
)