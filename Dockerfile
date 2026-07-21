FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --ignore-scripts
COPY frontend/ .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    BACKEND_PORT=3001 \
    FRONTEND_PORT=3000

# Install the static reverse proxy; database checks use the existing Node PostgreSQL client.
RUN apk add --no-cache nginx

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev --ignore-scripts

# Copy backend code
COPY backend/ ./backend/

# Copy start script
COPY docker-start.sh /app/docker-start.sh
RUN chmod +x /app/docker-start.sh \
    && mkdir -p /run/nginx /var/lib/nginx /var/log/nginx \
    && chown -R node:node /app /etc/nginx/http.d /run/nginx /var/lib/nginx /var/log/nginx

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O - "http://127.0.0.1:${FRONTEND_PORT}/api/ready" >/dev/null || exit 1

CMD ["/app/docker-start.sh"]
