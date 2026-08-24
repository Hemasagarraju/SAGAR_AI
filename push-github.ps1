# =======================================================
# 🚀 Pushing SAGAR AI Project to GitHub Repository & Triggering CI/CD Deploy
# =======================================================

$gitExe = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
if (!(Test-Path $gitExe)) {
    $gitExe = "git"
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "🚀 SAGAR AI — GitHub Deployment Pipeline" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Staging all files, AI studios, and GitHub CI/CD workflows..." -ForegroundColor Cyan
& $gitExe add -A

Write-Host "[2/4] Creating Commit for SAGAR AI Generative Suite..." -ForegroundColor Cyan
& $gitExe commit -m "feat: SAGAR AI generative super app, ChatGPT assistant, image creator, prompt studio, and GitHub CI/CD deploy pipeline"

Write-Host "[3/4] Ensuring main branch..." -ForegroundColor Cyan
& $gitExe branch -M main

Write-Host "[4/4] Pushing to GitHub (https://github.com/Hemasagarraju/sagaragent-ai.git)..." -ForegroundColor Cyan
Write-Host "-------------------------------------------------------" -ForegroundColor Yellow
Write-Host "If prompted, please authenticate via your GitHub credentials or Personal Access Token (PAT)." -ForegroundColor Yellow
Write-Host "-------------------------------------------------------" -ForegroundColor Yellow

& $gitExe push -u origin main

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "🎉 GitHub Push & Automated Deployment Triggered Successfully!" -ForegroundColor Green
Write-Host "👉 View CI/CD Actions: https://github.com/Hemasagarraju/sagaragent-ai/actions" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
