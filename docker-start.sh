#!/bin/sh

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

echo "=== Muhittin — Starting ==="

# Parse DATABASE_URL into individual components if set
if [ -n "$DATABASE_URL" ]; then
  # postgresql://user:pass@host:port/dbname
  DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
  DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\)/.*|\1|p')
  DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
  export DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME
fi

# Update nginx config with actual ports
sed -i "s/listen 3000/listen ${FRONTEND_PORT}/" /etc/nginx/http.d/default.conf
sed -i "s/proxy_pass http:\/\/127.0.0.1:3001/proxy_pass http:\/\/127.0.0.1:${BACKEND_PORT}/" /etc/nginx/http.d/default.conf
echo "Nginx configured: frontend on ${FRONTEND_PORT}, proxying API to ${BACKEND_PORT}"

# Database setup
echo "Setting up database schema..."
cd /app/backend
node seed.js 2>&1 || echo "Schema setup failed (non-fatal)"

echo "Running consulting migration..."
node migrate-consulting.js 2>&1 || echo "Migration failed (non-fatal)"

# Load full demo data if seed-data.sql exists and consulting tables are sparse
CONTACT_COUNT=$(PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT count(*) FROM contacts;" 2>/dev/null | tr -d ' ')
BUSINESS_COUNT=$(PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT count(*) FROM businesses;" 2>/dev/null | tr -d ' ')
if [ -f /app/backend/seed-data.sql ] && ( [ "${BUSINESS_COUNT:-0}" -lt "20" ] || [ "${CONTACT_COUNT:-0}" -lt "20" ] ); then
  echo "Loading demo data (${BUSINESS_COUNT} businesses, ${CONTACT_COUNT} contacts — need more)..."
  PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER} -d ${DB_NAME} -f /app/backend/seed-data.sql 2>&1 | tail -20
  echo "Demo data loaded!"
else
  echo "Database has full data (${BUSINESS_COUNT} businesses, ${CONTACT_COUNT} contacts), skipping."
fi

# Start backend in background
echo "Starting backend on port ${BACKEND_PORT}..."
cd /app/backend
node server.js 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend..."
for i in $(seq 1 30); do
  if wget -qO- http://127.0.0.1:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
    echo "Backend is ready! (PID: ${BACKEND_PID})"
    break
  fi
  if [ "$i" = "30" ]; then
    echo "WARNING: Backend did not respond after 30 seconds"
  fi
  sleep 1
done

# Start nginx
echo ""
echo "=== Muhittin is running ==="
echo "  Frontend: port ${FRONTEND_PORT}"
echo "  Backend:  port ${BACKEND_PORT}"
echo "==========================="
echo ""

nginx -g "daemon off;" 2>&1 &
NGINX_PID=$!

# Wait for either process to exit
wait -n $BACKEND_PID $NGINX_PID 2>/dev/null || wait $BACKEND_PID $NGINX_PID
