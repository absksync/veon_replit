#!/bin/bash

# 🚀 VEON Vercel Deployment Script
# This script helps deploy VEON to Vercel

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   🚀 VEON Vercel Deployment Script        ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "📝 Please log in to Vercel:"
    vercel login
else
    echo "✅ Already logged in to Vercel"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Deployment Options:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Deploy Backend Only"
echo "2. Deploy Frontend Only"
echo "3. Deploy Both (Backend first, then Frontend)"
echo "4. Exit"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔧 Deploying Backend..."
        cd backend
        vercel --prod
        echo ""
        echo "✅ Backend deployed!"
        echo "📝 Copy the deployment URL and update VITE_API_URL in frontend environment variables"
        ;;
    2)
        echo ""
        echo "🎨 Deploying Frontend..."
        vercel --prod
        echo ""
        echo "✅ Frontend deployed!"
        ;;
    3)
        echo ""
        echo "🔧 Step 1/2: Deploying Backend..."
        cd backend
        BACKEND_URL=$(vercel --prod 2>&1 | grep -oP 'https://[^\s]+')
        cd ..
        echo ""
        echo "✅ Backend deployed to: $BACKEND_URL"
        echo ""
        echo "🎨 Step 2/2: Deploying Frontend..."
        echo "⚠️  Make sure to add VITE_API_URL=$BACKEND_URL to frontend environment variables"
        echo ""
        read -p "Press Enter to continue with frontend deployment..."
        vercel --prod
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Both deployments complete!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📝 Next Steps:"
        echo "1. Go to Vercel Dashboard"
        echo "2. Add environment variables to frontend:"
        echo "   - VITE_API_URL=$BACKEND_URL"
        echo "   - VITE_CLERK_PUBLISHABLE_KEY=your_key"
        echo "3. Add environment variables to backend:"
        echo "   - GROQ_API_KEY=your_key"
        echo "   - ELEVENLABS_API_KEY=your_key"
        echo "4. Redeploy both projects"
        echo ""
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎊 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For detailed instructions, see: VERCEL_DEPLOYMENT.md"
echo "🌐 Vercel Dashboard: https://vercel.com/dashboard"
echo ""
