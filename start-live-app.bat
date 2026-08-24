@echo off
title SAGAR AI Generative Super App Launcher
color 0B
echo =======================================================================
echo     🚀 SAGAR AI — Generative AI Super App Suite
echo =======================================================================
echo.
echo [1/3] Starting Backend Engine (Port 5000)...
start "SAGAR AI Backend (Port 5000)" cmd /k "cd server && npm run dev"

echo [2/3] Starting Frontend Console (Port 3000 on 0.0.0.0)...
start "SAGAR AI Frontend (0.0.0.0:3000)" cmd /k "cd client && npm run dev"

echo [3/3] Initializing Services...
timeout /t 6 /nobreak >nul

echo.
echo =======================================================================
echo   🌐 PLATFORM READY — ACCESS VIA ANY OF THE FOLLOWING URLS:
echo =======================================================================
echo.
echo 📱 OFFLINE / SAME WI-FI NETWORK:
echo    - Wi-Fi / Hotspot URL: http://10.166.139.128:3000
echo    - Localhost URL:      http://localhost:3000
echo.
echo 🌍 LIVE GLOBAL ACCESS (Anywhere / Mobile 4G/5G / Remote):
if exist "%LOCALAPPDATA%\cloudflared.exe" (
    start "Cloudflare IPv4 HTTP2 Live Tunnel" cmd /k ""%LOCALAPPDATA%\cloudflared.exe" tunnel --edge-ip-version 4 --protocol http2 --url http://127.0.0.1:3000"
    echo    - Cloudflare Live Tunnel started in separate window!
) else (
    echo    - Opening local browser...
    start http://localhost:3000
)

echo.
echo =======================================================================
echo   ⚡ 1-Click Demo Login: Click '1-Click Demo Operator Sign In' on /login
echo =======================================================================
pause
