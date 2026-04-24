FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx postgresql-client

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend code
COPY backend/ ./backend/

# Copy start script
COPY docker-start.sh /app/docker-start.sh
RUN chmod +x /app/docker-start.sh

EXPOSE 3000

CMD ["/app/docker-start.sh"]
