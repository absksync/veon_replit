# Quick Start Guide for VEON

Get VEON up and running in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- A Hugging Face account (free at https://huggingface.co)

## Step 1: Get Your Hugging Face API Key

1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access is sufficient)
3. Copy your token

## Step 2: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/absksync/veon_replit.git
cd veon_replit

# Run the automated setup script
./setup.sh
```

## Step 3: Configure API Key

Edit `backend/.env` and add your Hugging Face API key:

```
PORT=3001
HUGGINGFACE_API_KEY=hf_your_actual_key_here
```

## Step 4: Start VEON

### Option A: Two Terminal Windows

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option B: Using Process Managers (tmux, screen, or pm2)

If you have tmux installed:
```bash
# Start backend in background
tmux new-session -d -s veon-backend 'cd backend && npm run dev'

# Start frontend in background
tmux new-session -d -s veon-frontend 'cd frontend && npm run dev'
```

## Step 5: Open VEON

Open your browser to: http://localhost:5173

Wait for the connection indicator to turn green, then start chatting!

## Testing Without API Key

If you want to test the UI without a Hugging Face API key:
- Set `HUGGINGFACE_API_KEY=test_key` in backend/.env
- The app will work but responses will be fallback messages
- The emotion detection and memory system will still work

## Troubleshooting

### Port Already in Use
If port 3001 or 5173 is already in use, you can change them:

**Backend:** Edit `backend/.env`:
```
PORT=3002
```

**Frontend:** Edit `frontend/.env`:
```
VITE_SOCKET_URL=http://localhost:3002
```

Then change the port in Vite by running:
```bash
npm run dev -- --port 5174
```

### Connection Issues
- Make sure both backend and frontend are running
- Check that firewall isn't blocking ports 3001 and 5173
- Verify VITE_SOCKET_URL matches your backend PORT

### Slow Responses
- Hugging Face free tier can be slow
- First request may take 10-30 seconds (model warm-up)
- Subsequent requests are faster

## What's Next?

- Try different emotions: "I'm so happy!", "This makes me sad", "That's surprising!"
- Watch the 3D avatar change colors based on emotions
- Observe memories being created and decaying over time
- Check the Memory Core panel to see stored memories

Enjoy your emotionally intelligent AI companion! 💙
