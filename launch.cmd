@echo off
if exist "%~dp0lattice-server.exe" (
  start "" "%~dp0lattice-server.exe" %*
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1" %*
)
