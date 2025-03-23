#!/bin/bash

# Start Flask backend
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!

# Start React frontend
cd ..
npm run dev &
FRONTEND_PID=$!

# Handle termination
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
wait