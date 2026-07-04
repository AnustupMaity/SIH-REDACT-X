# Stage 1: Build Frontend
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Python & OCR Backend Runtime
FROM python:3.11-slim AS production-stage
WORKDIR /app

# Install system dependencies for OCR and PDF rendering (Tesseract and Poppler)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code and training/model assets
COPY backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=build-stage /app/dist-react ./dist-react

WORKDIR /app/backend
EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV ALLOWED_ORIGINS="*"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]