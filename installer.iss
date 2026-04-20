[Setup]
; --- Application Details ---
AppName=ArchitectAI
AppVersion=1.0.2
AppPublisher=Your Name
DefaultDirName={autopf}\ArchitectAI
DefaultGroupName=ArchitectAI

; --- Output Details ---
OutputDir=dist\installer
OutputBaseFilename=ArchitectAI_Windows_Setup
SetupIconFile=frontend\assets\logo.ico

; --- Compression & Privileges ---
Compression=lzma2
SolidCompression=yes
PrivilegesRequired=lowest

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"

[Files]
; Grab everything PyInstaller dumped into the dist/ArchitectAI folder
Source: "dist\ArchitectAI\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Create shortcuts in the Start Menu and Desktop that point to your .exe
Name: "{group}\ArchitectAI"; Filename: "{app}\ArchitectAI.exe"
Name: "{autodesktop}\ArchitectAI"; Filename: "{app}\ArchitectAI.exe"; Tasks: desktopicon

[Run]
; Give the user a checkbox to launch the app immediately after installing
Filename: "{app}\ArchitectAI.exe"; Description: "Launch ArchitectAI"; Flags: nowait postinstall skipifsilent