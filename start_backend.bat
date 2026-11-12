@echo off
echo ==============================================================
echo Starting RYTHUM AI - Backend API Server (FastAPI on Port 8000)
echo ==============================================================
cd /d "%~dp0"
"C:\Users\gouth\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause

