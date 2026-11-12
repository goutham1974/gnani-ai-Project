@echo off
echo ==============================================================
echo Launching RYTHUM AI Full Stack Suite
echo ==============================================================
start "RYTHUM AI - Backend" cmd /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "RYTHUM AI - Frontend" cmd /k "%~dp0start_frontend.bat"
echo.
echo Backend running at:  http://127.0.0.1:8000
echo API Docs at:        http://127.0.0.1:8000/docs
echo Frontend running at: http://localhost:5173
echo.
pause
