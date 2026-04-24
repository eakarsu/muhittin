#!/bin/bash
set -e

echo "========================================="
echo "  Muhittin - Business Growth Platform"
echo "========================================="

# Kill existing processes on ports 3001 and 3000
echo "Cleaning up ports..."
for port in 3001 3000; do
  lsof -ti:$port | xargs kill -9 2>/dev/null || true
done
sleep 2
# Verify ports are free, retry if needed
for port in 3001 3000; do
  for attempt in 1 2 3 4 5; do
    if lsof -ti:$port > /dev/null 2>&1; then
      echo "Port $port still in use, killing again (attempt $attempt)..."
      lsof -ti:$port | xargs kill -9 2>/dev/null || true
      sleep 1
    else
      break
    fi
  done
done
echo "Ports cleared."

# Create database if it doesn't exist
echo "Setting up database..."
createdb muhittin_platform 2>/dev/null || echo "Database already exists"

# Install backend dependencies
echo "Installing backend dependencies..."
cd /Users/erolakarsu/projects/muhittin/backend
npm install --silent 2>&1 | tail -1

# Run seed
echo "Seeding database..."
node seed.js

# Run consulting migration (adds new tables without dropping existing ones)
echo "Running consulting migration..."
node migrate-consulting.js

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd /Users/erolakarsu/projects/muhittin/frontend
npm install --silent 2>&1 | tail -1

# Final port check before starting backend
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend
echo "Starting backend on port 3001..."
cd /Users/erolakarsu/projects/muhittin/backend
node server.js &

# Wait for backend to be ready before starting frontend
echo "Waiting for backend..."
for i in $(seq 1 30); do
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "Backend is ready!"
    break
  fi
  sleep 1
done

# Start frontend
echo "Starting frontend on port 3000..."
cd /Users/erolakarsu/projects/muhittin/frontend
npm run dev &

echo ""
echo "========================================="
echo "  Muhittin is starting up!"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:3000"
echo "  Login:    demo@muhittin.com / demo123"
echo "========================================="

wait
