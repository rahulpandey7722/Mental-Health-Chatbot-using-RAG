# ====================================================================
# Multi-stage Dockerfile for MindHaven Mental Health Chatbot
# Produces a self-contained, lightweight production image (< 200MB)
# ====================================================================

# Stage 1: Build the React / Vite frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Minimal Python runtime with backend and static assets
FROM python:3.11-slim AS runner
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code, knowledge base, and pre-built frontend distribution
COPY backend/ ./backend/
COPY --from=frontend-builder /app/dist ./dist

# Standard production port
EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:' + str(os.environ.get('PORT', 8000)) + '/health')" || exit 1

# Start FastAPI server
CMD ["python", "backend/app.py"]
