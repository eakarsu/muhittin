#!/bin/sh
set -eu

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
export BACKEND_PORT FRONTEND_PORT

node /app/backend/scripts/validate-config.js
node /app/backend/scripts/check-db.js

sed -i "s/listen 3000/listen ${FRONTEND_PORT}/" /etc/nginx/http.d/default.conf
sed -i "s#proxy_pass http://127.0.0.1:3001#proxy_pass http://127.0.0.1:${BACKEND_PORT}#" /etc/nginx/http.d/default.conf

node /app/backend/server.js &
BACKEND_PID=$!
nginx -g "daemon off;" &
NGINX_PID=$!

cleanup() {
  kill "$BACKEND_PID" "$NGINX_PID" 2>/dev/null || true
  wait "$BACKEND_PID" 2>/dev/null || true
  wait "$NGINX_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
  sleep 1
done
echo "A container service exited; stopping the remaining child process." >&2
exit 1
