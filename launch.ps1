$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-LatticePort {
    param([string]$Root, [string[]]$LaunchArgs)
    for ($i = 0; $i -lt $LaunchArgs.Count; $i++) {
        if ($LaunchArgs[$i] -eq "--port" -and $i + 1 -lt $LaunchArgs.Count) {
            $candidate = 0
            if ([int]::TryParse($LaunchArgs[$i + 1], [ref]$candidate) -and $candidate -gt 0 -and $candidate -lt 65536) {
                return $candidate
            }
        }
        if ($LaunchArgs[$i] -like "--port=*") {
            $candidate = 0
            if ([int]::TryParse($LaunchArgs[$i].Substring(7), [ref]$candidate) -and $candidate -gt 0 -and $candidate -lt 65536) {
                return $candidate
            }
        }
    }
    if ($env:LATTICE_PORT) {
        $candidate = 0
        if ([int]::TryParse($env:LATTICE_PORT, [ref]$candidate) -and $candidate -gt 0 -and $candidate -lt 65536) {
            return $candidate
        }
    }
    $portFile = Join-Path $Root "lattice-port.txt"
    if (Test-Path $portFile) {
        $candidate = 0
        $firstLine = (Get-Content -LiteralPath $portFile -TotalCount 1).Trim()
        if ([int]::TryParse($firstLine, [ref]$candidate) -and $candidate -gt 0 -and $candidate -lt 65536) {
            return $candidate
        }
    }
    return 4173
}

$port = Get-LatticePort -Root $root -LaunchArgs $args
$url = "http://localhost:$port"

$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listening) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
        if ($response.Content -notmatch "<title>Lattice") {
            Add-Type -AssemblyName PresentationFramework
            [System.Windows.MessageBox]::Show(
                "Port $port is already being used by another application.",
                "Lattice could not start"
            ) | Out-Null
            exit 1
        }
    } catch {
        exit 1
    }
}
if (-not $listening) {
    $python = Get-Command python.exe -ErrorAction SilentlyContinue
    if (-not $python) {
        $python = Get-Command py.exe -ErrorAction SilentlyContinue
    }
    if (-not $python) {
        Add-Type -AssemblyName PresentationFramework
        [System.Windows.MessageBox]::Show(
            "Python was not found. Install Python or serve this folder on port $port.",
            "Lattice could not start"
        ) | Out-Null
        exit 1
    }

    if ($python.Name -eq "py.exe") {
        Start-Process -FilePath $python.Source -ArgumentList @("-3", "-m", "http.server", "$port", "--bind", "127.0.0.1") -WorkingDirectory $root -WindowStyle Hidden
    } else {
        Start-Process -FilePath $python.Source -ArgumentList @("-m", "http.server", "$port", "--bind", "127.0.0.1") -WorkingDirectory $root -WindowStyle Hidden
    }

    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 100
        if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
            break
        }
    }
}

Start-Process $url
