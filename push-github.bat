@echo off
title SAGAR AI GitHub Deployment Launcher
color 0B
echo =======================================================
echo  🚀 SAGAR AI — GitHub Repository & CI/CD Deployment
echo =======================================================
echo.

set "GIT_EXE=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if not exist "%GIT_EXE%" (
    set "GIT_EXE=git"
)

echo [1/4] Staging all files and GitHub CI/CD workflows...
"%GIT_EXE%" add -A

echo [2/4] Creating Commit for SAGAR AI...
"%GIT_EXE%" commit -m "feat: SAGAR AI generative super app, ChatGPT assistant, image creator, prompt studio, and GitHub CI/CD deploy pipeline"

echo [3/4] Ensuring main branch...
"%GIT_EXE%" branch -M main

echo [4/4] Pushing to GitHub (https://github.com/Hemasagarraju/sagaragent-ai.git)...
echo -------------------------------------------------------
echo Attempting to push to remote repository...
echo -------------------------------------------------------
"%GIT_EXE%" push -u origin main

echo.
echo =======================================================
echo  🎉 GitHub Deployment Complete!
echo  👉 Actions: https://github.com/Hemasagarraju/sagaragent-ai/actions
echo =======================================================
pause
