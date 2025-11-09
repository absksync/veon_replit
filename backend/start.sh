#!/bin/bash

# VEON Backend Startup Script

echo "🚀 Starting VEON Backend Server..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your API keys."
    echo "See .env.example for reference."
    exit 1
fi

# Install/update dependencies
echo "📚 Installing dependencies..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
elif [ -f "requirements-no-voice.txt" ]; then
    echo "⚠️  Installing without voice features..."
    pip install -r requirements-no-voice.txt
else
    echo "❌ No requirements file found!"
    exit 1
fi

# Create database and seed data
echo "🗄️  Initializing database..."
python -c "from database import init_db; init_db()"

echo "🌱 Seeding default profiles..."
python seed_profiles.py

# Start the server
echo ""
echo "✨ VEON Backend is ready!"
echo "📡 Starting server on http://localhost:8000"
echo "📖 API docs available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
