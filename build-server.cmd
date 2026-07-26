@echo off
setlocal
set GOTELEMETRY=off
set GOCACHE=%~dp0.go-cache
set GOPATH=%~dp0.go-path
set /p LATTICE_VERSION=<VERSION
go build -ldflags "-s -w -H windowsgui -X main.version=%LATTICE_VERSION%" -o lattice-server.exe server.go
if errorlevel 1 (
  echo Failed to build lattice-server.exe
  exit /b 1
)
for /f "tokens=1" %%H in ('powershell.exe -NoProfile -Command "(Get-FileHash lattice-server.exe -Algorithm SHA256).Hash"') do set HASH=%%H
echo %HASH%  lattice-server.exe> CHECKSUMS.txt
echo Built lattice-server.exe
