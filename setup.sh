#!/bin/bash

echo "🚀 Setting up VEON - Emotionally Adaptive AI Companion"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend
npm install
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and add your Hugging Face API key"
fi
cd ..
echo "✅ Backend setup complete"
echo ""

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
npm install
if [ ! -f .env ]; then
    cp .env.example .env
fi
cd ..
echo "✅ Frontend setup complete"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add your Hugging Face API key"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "Enjoy chatting with VEON! 💙"
