#!/bin/bash
cd /home/absksync/Desktop
/home/absksync/Desktop/backend/venv/bin/python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
