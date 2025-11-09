# 🚀 VEON AI - Quick Reference Card

## ✅ STATUS: FULLY OPERATIONAL

---

## 🎯 Quick Start (Copy & Paste)

```bash
# Start everything
/home/absksync/Desktop/START_VEON.sh

# Stop everything
pkill -f "uvicorn main:app" && pkill -f "vite"
```

---

## 🌐 URLs

| What | URL |
|------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |

---

## 🧪 Quick Tests

```bash
# Health check
curl http://localhost:8000/health

# List profiles
curl http://localhost:8000/api/profiles/

# Chat with Priya
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 1, "message": "Hi!", "user_id": "test"}'
```

---

## 🎭 AI Personalities

| ID | Name | Type |
|----|------|------|
| 1 | Priya | College student (Hinglish, chai lover) |
| 2 | Arjun | Fitness enthusiast (gym bro, cricket fan) |
| 3 | Maya | Artist (creative, poetic, introvert) |
| 4 | Rohan | Tech geek (gamer, gadget lover) |

---

## 💾 Logs

```bash
# Backend logs
tail -f /tmp/veon_backend.log

# Frontend logs
tail -f /tmp/veon_frontend.log
```

---

## 🔐 API Keys (Configured)

- ✅ Groq: `gsk_cnNI...lTdF`
- ✅ ElevenLabs: `4918f...89c5`

---

## 📁 Important Files

```
/home/absksync/Desktop/
├── START_VEON.sh          # Startup script
├── VEON_README.md         # Full documentation
├── SUCCESS_REPORT.md      # Test results
└── backend/.env           # API keys
```

---

## 🎯 Features Working

- ✅ AI Chat (Groq)
- ✅ 15 Emotions
- ✅ Memory System (LTM/STM/FM)
- ✅ Pratfall Behavior
- ✅ 4 AI Personalities
- ✅ Voice API (ready for samples)

---

## 🆘 Emergency Commands

```bash
# Restart backend
cd /home/absksync/Desktop/backend
pkill -f uvicorn
/home/absksync/Desktop/backend/venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

# Restart frontend
cd /home/absksync/Desktop/veon_replit
pkill -f vite
npm run dev &

# Check if services running
curl http://localhost:8000/health
curl http://localhost:5173
```

---

## 🎉 Success Metrics

- Backend: ✅ Running on port 8000
- Groq AI: ✅ Responding in 1-3 seconds
- Database: ✅ 4 profiles loaded
- Memories: ✅ Tracking conversations
- Pratfall: ✅ Forgetfulness working

---

**Everything is ready! Just run:**
```bash
/home/absksync/Desktop/START_VEON.sh
```

Then open: **http://localhost:5173** 🚀
