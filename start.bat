@echo off
title VERIFAI Fullstack Server
echo ===================================================
echo Starting VERIFAI Fullstack System...
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo ===================================================
call npx -y concurrently -k -n "BACKEND,FRONTEND" -c "cyan.bold,magenta.bold" "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" "cd frontend && npm run dev"
pause
