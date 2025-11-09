#!/bin/bash

# Kill any existing processes
echo "🛑 Stopping any existing servers..."
pkill -f "uvicorn backend.main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

# Start backend in background
echo "🚀 Starting backend server on port 8000..."
(cd /home/absksync/Desktop/veon_replit && ./backend/venv/bin/python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000) > /tmp/veon-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/api/profiles/ > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend failed to start. Check /tmp/veon-backend.log"
    exit 1
fi

# Start frontend in background
echo "🚀 Starting frontend server on port 5173..."
(cd /home/absksync/Desktop/veon_replit && npm run dev) > /tmp/veon-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 3

# Check if frontend is running
if lsof -ti:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "❌ Frontend failed to start. Check /tmp/veon-frontend.log"
    exit 1
fi

echo ""
echo "🎉 Both servers are running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Backend PID:  $BACKEND_PID"
echo "📋 Frontend PID: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/veon-backend.log"
echo "   Frontend: tail -f /tmp/veon-frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or run: pkill -f 'uvicorn backend.main:app' && pkill -f vite"
echo ""
echo "Press Ctrl+C to stop monitoring (servers will keep running)"
echo ""

# Keep script running and show logs
tail -f /tmp/veon-backend.log /tmp/veon-frontend.log
