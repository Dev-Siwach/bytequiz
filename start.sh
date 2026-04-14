#!/bin/bash

echo "Starting the Online Quiz Platform..."

# Start Backend
echo "Starting Backend..."
cd backend
nohup node src/server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend..."
cd frontend
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Save PIDs
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid

echo "========================================="
echo "Services are running in the background!"
echo "Backend PID: $BACKEND_PID (logs in backend.log)"
echo "Frontend PID: $FRONTEND_PID (logs in frontend.log)"
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo "Use ./stop.sh to close/kill everything."
echo "========================================="
