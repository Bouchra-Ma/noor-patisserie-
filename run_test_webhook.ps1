# Run webhook test: apply migrations, create+simulate order, show results
# Usage: Open PowerShell in project root and run: .\run_test_webhook.ps1

# If a virtualenv exists at .venv, activate it
if (Test-Path -Path .\.venv\Scripts\Activate.ps1) {
    Write-Host "Activating virtualenv .venv"
    . .\.venv\Scripts\Activate.ps1
} else {
    Write-Host "No .venv activation script found; continuing with system Python"
}

# Ensure working directory is project root
Set-Location -Path $PSScriptRoot

Write-Host "Installing requirements (skip if already installed)..."
if (Test-Path -Path .\backend\requirements.txt) {
    pip install -r .\backend\requirements.txt
} else {
    Write-Host "No requirements.txt found at backend/requirements.txt; skipping install"
}

Write-Host "Making migrations and migrating..."
python .\backend\manage.py makemigrations --noinput
python .\backend\manage.py migrate --noinput

Write-Host "Creating and simulating test order..."
python .\backend\manage.py create_and_simulate_order

Write-Host "Listing orders and products (post-simulation):"
python .\backend\manage.py shell -c "from orders.models import Order; print([(o.id,o.status,o.total_amount,str(o.user.email)) for o in Order.objects.all()])"
python .\backend\manage.py shell -c "from catalog.models import Product; print([(p.id,p.name,p.stock) for p in Product.objects.all()])"

Write-Host "Done. Check the console output above for logs and email (console backend)."
