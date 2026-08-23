# =======================================================
# Pushing SAGARAGENT_AI Project to GitHub Repository
# =======================================================

$gitExe = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
if (!(Test-Path $gitExe)) {
    $gitExe = "git"
}

Write-Host "[1/4] Checking Git Version..." -ForegroundColor Cyan
& $gitExe --version

Write-Host "[2/4] Staging All Files..." -ForegroundColor Cyan
& $gitExe add .

Write-Host "[3/4] Creating Commit..." -ForegroundColor Cyan
& $gitExe commit -m "feat: complete SAGARAGENT_AI autonomous multi-agent automation platform"

Write-Host "[4/4] Setting Remote Origin and Pushing..." -ForegroundColor Cyan
& $gitExe branch -M main
& $gitExe remote remove origin 2>$null
& $gitExe remote add origin https://github.com/Hemasagarraju/sagaragent-ai.git

Write-Host "-------------------------------------------------------" -ForegroundColor Yellow
Write-Host "Attempting to push to https://github.com/Hemasagarraju/sagaragent-ai.git ..." -ForegroundColor Green
Write-Host "If prompted, enter your GitHub Username and Personal Access Token (or password)." -ForegroundColor Yellow
Write-Host "-------------------------------------------------------" -ForegroundColor Yellow

& $gitExe push -u origin main

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "🎉 Push Complete!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
