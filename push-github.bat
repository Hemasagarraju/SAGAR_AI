@echo off
setlocal
echo =======================================================
echo  Pushing SAGARAGENT_AI Project to GitHub Repository
echo =======================================================

:: Set Git Path
set "GIT_EXE=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if not exist "%GIT_EXE%" (
    set "GIT_EXE=git"
)

echo [1/4] Checking Git Version...
"%GIT_EXE%" --version

echo [2/4] Staging All Files...
"%GIT_EXE%" add .

echo [3/4] Creating Commit...
"%GIT_EXE%" commit -m "feat: complete SAGARAGENT_AI autonomous multi-agent automation platform"

echo [4/4] Setting Remote Origin and Pushing...
"%GIT_EXE%" branch -M main
"%GIT_EXE%" remote remove origin 2>nul
"%GIT_EXE%" remote add origin https://github.com/Hemasagarraju/sagaragent-ai.git

echo -------------------------------------------------------
echo Attempting to push to https://github.com/Hemasagarraju/sagaragent-ai.git ...
echo If prompted, enter your GitHub Username and Personal Access Token (or password).
echo -------------------------------------------------------
"%GIT_EXE%" push -u origin main

echo =======================================================
echo  Push Complete!
echo =======================================================
pause
