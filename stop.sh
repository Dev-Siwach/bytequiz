#!/bin/bash

echo "Stopping services..."

if [ -f backend.pid ]; then
  BACKEND_PID=$(cat backend.pid)
  echo "Stopping Backend (PID: $BACKEND_PID)..."
  kill $BACKEND_PID 2>/dev/null
  rm backend.pid
else
  echo "Backend PID file not found."
  # Fallback
  pkill -f "node src/server.js" 2>/dev/null
fi

if [ -f frontend.pid ]; then
  FRONTEND_PID=$(cat frontend.pid)
  echo "Stopping Frontend (PID: $FRONTEND_PID)..."
  kill $FRONTEND_PID 2>/dev/null
  rm frontend.pid
else
  echo "Frontend PID file not found."
  # Fallback
  pkill -f "vite" 2>/dev/null
fi

echo "Services successfully stopped."
