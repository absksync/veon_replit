# 🚀 VEON Vercel Deployment Guide

This guide will help you deploy VEON to Vercel with both frontend and backend.

## 📋 Prerequisites

- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`
- GitHub repository with your code
- API keys ready (Clerk, Groq, ElevenLabs)

## 🎯 Deployment Strategy

VEON uses a **two-deployment architecture**:
1. **Frontend** - React + Vite (Main Vercel project)
2. **Backend** - FastAPI (Separate Vercel project)

## 📦 Step 1: Deploy Backend First

### Option A: Using Vercel CLI (Recommended)

```bash
# Navigate to project root
cd /home/absksync/Desktop/veon_replit

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel --prod

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [Select your account]
# - Link to existing project? N
# - Project name? veon-backend
# - Directory? ./
# - Override settings? N
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
4. Add Environment Variables:
   ```
   GROQ_API_KEY=your_groq_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```
5. Click "Deploy"

### Important: Note Your Backend URL

After deployment, you'll get a URL like:
```
https://veon-backend.vercel.app
```
**Save this URL!** You'll need it for the frontend.

## 🎨 Step 2: Deploy Frontend

### Option A: Using Vercel CLI

```bash
# Navigate back to project root
cd /home/absksync/Desktop/veon_replit

# Deploy frontend
vercel --prod

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [Select your account]
# - Link to existing project? N
# - Project name? veon
# - Directory? ./
# - Override settings? N
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import the same GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_API_URL=https://veon-backend.vercel.app
   ```
5. Click "Deploy"

## 🔧 Step 3: Update API Configuration

After both deployments, update your frontend API configuration:

1. **Update src/services/api.js**:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://veon-backend.vercel.app'
   ```

2. **Commit and push changes**:
   ```bash
   git add .
   git commit -m "🚀 Updated API URL for production"
   git push origin master
   ```

3. Vercel will auto-deploy the update

## 🔐 Step 4: Configure Environment Variables

### Backend Environment Variables (Vercel Dashboard)

Go to: `https://vercel.com/[your-account]/veon-backend/settings/environment-variables`

Add these variables:
```
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Frontend Environment Variables

Go to: `https://vercel.com/[your-account]/veon/settings/environment-variables`

Add these variables:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
VITE_API_URL=https://veon-backend.vercel.app
```

## ✅ Step 5: Verify Deployment

1. **Test Backend**:
   ```bash
   curl https://veon-backend.vercel.app/api/profiles/
   ```
   Should return JSON with profiles.

2. **Test Frontend**:
   - Visit your Vercel frontend URL
   - Check if face loads
   - Try sending a message
   - Test voice recording

## 🔄 Auto-Deployment Setup

### Enable Automatic Deployments

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Git
4. Enable:
   - ✅ **Production Branch**: master
   - ✅ **Automatic Deployments**: On
   - ✅ **Preview Deployments**: On for pull requests

Now every push to `master` will auto-deploy! 🎉

## 🐛 Troubleshooting

### Issue: Backend API not responding

**Solution**: Check backend logs
```bash
vercel logs veon-backend --prod
```

### Issue: CORS errors

**Solution**: Update `backend/main.py` CORS settings:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://veon.vercel.app", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Environment variables not working

**Solution**: 
1. Verify variables in Vercel dashboard
2. Redeploy: `vercel --prod --force`

### Issue: Build fails

**Solution**: Check build logs
```bash
vercel logs veon --prod
```

## 📱 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain (e.g., `veon.yourdomain.com`)
3. Update DNS settings as instructed
4. Update CORS in backend to include your domain

## 🎊 Your VEON is Live!

After successful deployment:

- **Frontend**: https://veon.vercel.app
- **Backend**: https://veon-backend.vercel.app

Share your AI companion with the world! 🌟

## 📚 Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs [project-name] --prod

# Rollback deployment
vercel rollback

# Remove deployment
vercel remove [project-name]
```

## 💡 Production Tips

1. **Database**: Consider upgrading to PostgreSQL (Vercel Postgres or external)
2. **File Storage**: Use Vercel Blob for audio files instead of static folder
3. **Monitoring**: Enable Vercel Analytics
4. **Performance**: Use Vercel Speed Insights
5. **Security**: Add rate limiting to backend endpoints

---

Need help? Check:
- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
