# Launch backend and frontend in separate PowerShell windows and create a test user
# Usage: run from project root: .\run_all.ps1


$root = (Get-Location).ProviderPath

# Activate venv path
$venvActivate = Join-Path $root 'backend\.venv\Scripts\Activate.ps1'

# Backend command as array; use -WorkingDirectory to avoid issues with spaces
$backendArgs = @(
    '-NoExit',
    '-Command',
    'pip install -r backend\requirements.txt -q; python backend/manage.py migrate; python backend/manage.py runserver'
)

# Frontend command; run in frontend working directory
$frontendArgs = @(
    '-NoExit',
    '-Command',
    'npm install --no-audit --no-fund; npm run dev'
)

Write-Host "Starting backend in new window..."
Start-Process -FilePath powershell -ArgumentList $backendArgs -WorkingDirectory $root

Start-Sleep -Seconds 2

Write-Host "Starting frontend in new window..."
Start-Process -FilePath powershell -ArgumentList $frontendArgs -WorkingDirectory (Join-Path $root 'frontend')

Start-Sleep -Seconds 2

Write-Host "Creating test user (test2/testpass2)..."
python backend/manage.py create_test_user

Write-Host "All started. Open http://localhost:3000 (frontend) and http://127.0.0.1:8000/admin/ (backend admin)."
