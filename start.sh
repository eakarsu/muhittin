#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-3001}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

for command in node curl; do
  command -v "$command" >/dev/null 2>&1 || { echo "$command is required." >&2; exit 1; }
done
for directory in "$ROOT/backend/node_modules" "$ROOT/frontend/node_modules"; do
  [[ -d "$directory" ]] || { echo "Dependencies are missing at $directory. Install them explicitly before startup." >&2; exit 1; }
done

BACKEND_PORT="$BACKEND_PORT" FRONTEND_PORT="$FRONTEND_PORT" node "$ROOT/backend/scripts/validate-config.js"
node "$ROOT/backend/scripts/check-db.js"

if command -v lsof >/dev/null 2>&1; then
  for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
    if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "Port $port is already in use; no process was changed." >&2
      exit 1
    fi
  done
fi

BACKEND_PID=''
FRONTEND_PID=''
cleanup() {
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
  [[ -n "$BACKEND_PID" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "$FRONTEND_PID" ]] && wait "$FRONTEND_PID" 2>/dev/null || true
  [[ -n "$BACKEND_PID" ]] && wait "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting backend on 127.0.0.1:$BACKEND_PORT"
BACKEND_PORT="$BACKEND_PORT" node "$ROOT/backend/server.js" &
BACKEND_PID=$!

for _ in $(seq 1 30); do
  if curl --fail --silent "http://127.0.0.1:$BACKEND_PORT/api/ready" >/dev/null 2>&1; then break; fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Backend exited during startup." >&2
    exit 1
  fi
  sleep 1
done
curl --fail --silent "http://127.0.0.1:$BACKEND_PORT/api/ready" >/dev/null || { echo "Backend readiness timed out." >&2; exit 1; }

echo "Starting frontend on 127.0.0.1:$FRONTEND_PORT"
(
  cd "$ROOT/frontend"
  exec env BACKEND_PORT="$BACKEND_PORT" FRONTEND_PORT="$FRONTEND_PORT" \
    "$ROOT/frontend/node_modules/.bin/vite" --host 127.0.0.1 --port "$FRONTEND_PORT"
) &
FRONTEND_PID=$!

echo "Multiverse Consulting Group is available at http://127.0.0.1:$FRONTEND_PORT"
while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done
echo "A service exited; stopping the remaining child process." >&2
exit 1
