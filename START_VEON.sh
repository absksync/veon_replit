#!/bin/bash

# VEON AI - Complete Startup Script
# This starts both backend and frontend servers

echo "🧠 Starting VEON AI System..."
echo ""

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Start Backend
echo "🚀 Starting Backend Server..."
cd /home/absksync/Desktop/backend
/home/absksync/Desktop/backend/venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > /tmp/veon_backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "   Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Backend is running on http://localhost:8000"
else
    echo "   ❌ Backend failed to start. Check /tmp/veon_backend.log"
    exit 1
fi

# Start Frontend
echo ""
echo "🎨 Starting Frontend Server..."
cd /home/absksync/Desktop/veon_replit
npm run dev > /tmp/veon_frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "   Waiting for frontend to initialize..."
sleep 5

echo ""
echo "✅ VEON AI is running!"
echo ""
echo "📍 Access points:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f /tmp/veon_backend.log"
echo "   Frontend: tail -f /tmp/veon_frontend.log"
echo ""
echo "🛑 To stop:"
echo "   pkill -f 'uvicorn main:app'"
echo "   pkill -f 'vite'"
echo ""
echo "Press Ctrl+C to stop monitoring..."
echo ""

# Monitor logs
tail -f /tmp/veon_backend.log /tmp/veon_frontend.log
