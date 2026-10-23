# 🚀 MindHaven Deployment Guide

MindHaven is built to be deployed anywhere with zero friction. It supports:
1. **Unified Single-Service Deployment** (Docker, Render, Railway, AWS, GCP, Fly.io) — FastAPI serves both the RAG API and the compiled React SPA from a single port.
2. **Decoupled Deployment** (Vercel/Netlify for Frontend + Render/Railway for Backend).
3. **Static Client-Side Deployment** (GitHub Pages / Vercel / Netlify) — Works 100% offline using MindHaven's built-in in-browser RAG vector engine.

---

## 📋 Prerequisites & Quick Test

Before deploying, you can test the production build locally with a single command:

```bash
# 1. Install dependencies
npm install
pip install -r backend/requirements.txt

# 2. Build frontend & start fullstack server
npm run prod
```

Open `http://localhost:8000` to verify the production app.

---

## 🐳 Option 1: Docker (Recommended for Any Cloud Platform)

A multi-stage `Dockerfile` is included that packages both the React build and Python FastAPI backend into a secure, minimal container image.

### Local Docker Run
```bash
# Build and run with docker compose
docker compose up --build -d

# Or build manually
docker build -t mindhaven .
docker run -d -p 8000:8000 --name mindhaven mindhaven
```
Visit `http://localhost:8000` — health check is available at `http://localhost:8000/health`.

### Cloud Platforms Supporting Docker
Deploy the container with 1-click on:
- **Render** (Web Service -> Docker)
- **Railway** (`railway up`)
- **Fly.io** (`fly launch`)
- **Google Cloud Run**
- **AWS App Runner / ECS**
- **DigitalOcean App Platform**

---

## ☁️ Option 2: Render (Free Tier Blueprint)

Render can host the entire app (Frontend + RAG Backend) on a single free web service.

### 1-Click Blueprint:
1. Push your repository to GitHub.
2. Log in to [Render.com](https://render.com).
3. Click **New +** -> **Blueprint**.
4. Select your `Mental_health_chatbot` repository.
5. Render detects [`render.yaml`](render.yaml) automatically. Click **Apply**.
6. Your app will be live with an automatic SSL `https://...onrender.com` domain.

### Manual Render Setup (Native Python):
If you prefer not using Docker:
- **Environment**: Python 3
- **Build Command**: `npm install && npm run build && pip install -r backend/requirements.txt`
- **Start Command**: `python backend/app.py`
- **Health Check Path**: `/health`

---

## 🚂 Option 3: Railway

1. Install Railway CLI or connect via [Railway.app](https://railway.app).
2. Create **New Project** -> **Deploy from GitHub repo**.
3. Railway will automatically detect the [`Dockerfile`](Dockerfile) or [`Procfile`](Procfile).
4. Under Variables, set `PORT=8000` (or let Railway assign one).
5. Generate a public domain under service settings.

---

## ⚡ Option 4: Decoupled Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on Vercel and the Python API on Render/Railway:

### 1. Deploy the Backend (Render or Railway)
- Deploy `backend/` using Docker or Python.
- Note your live API URL (e.g. `https://mindhaven-api.onrender.com`).
- In Render backend settings, set:
  ```env
  ALLOWED_ORIGINS=https://your-frontend.vercel.app
  ```

### 2. Deploy Frontend to Vercel
1. Import repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. In **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://mindhaven-api.onrender.com
   ```
6. The included [`vercel.json`](vercel.json) handles single-page routing rewrites automatically.

---

## 🌐 Option 5: Netlify Frontend

1. Connect repo to [Netlify](https://www.netlify.com).
2. The included [`netlify.toml`](netlify.toml) configures the build (`npm run build`), publish directory (`dist`), and SPA redirects automatically.
3. Add `VITE_API_BASE_URL` in **Site Settings** > **Environment variables**.

---

## 🔒 Environment Variables Reference

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8000` | Port for the backend server |
| `HOST` | `0.0.0.0` | Host IP binding (use `0.0.0.0` for containers/cloud) |
| `ALLOWED_ORIGINS` | `*` | Comma-separated list of allowed CORS origins |
| `RELOAD` | `false` | Enable live reload (set to `true` only for dev) |
| `VITE_API_BASE_URL` | `""` | Backend URL for frontend when hosted on a different domain |

---

## 🩺 Health Check & Monitoring

- `GET /health` or `GET /api/health`: Returns HTTP 200 with service status.
- Container orchestrators (Docker, Kubernetes, AWS ECS) can query this endpoint for automated liveness and readiness checks.
