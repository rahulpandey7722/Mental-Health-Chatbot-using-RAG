# MindHaven - RAG Mental Health & Depression Support Chatbot

**MindHaven** is an evidence-based, RAG-powered (Retrieval-Augmented Generation) Mental Health Chatbot that takes user depression symptoms as input, retrieves clinical psychological coping strategies (such as CBT, Behavioral Activation, and Sleep Hygiene), and provides actionable guidance. It is integrated with 24/7 emergency crisis hotlines and immediate safety grounding tools.
---
## LIVE DEMO
Visit: https://mindhaven-mental-health-chatbot.onrender.com

---

## ✨ Features

- **RAG Semantic Vector Search**:
  - Custom TF-IDF & Cosine Similarity vector retrieval engine (`backend/rag_engine.py`).
  - Clinical knowledge corpus (`backend/knowledge_base.json`) covering Cognitive Behavioral Therapy (CBT), Behavioral Activation, CBT-I Sleep Hygiene, Polyvagal Grounding, Interpersonal Reconnection, and Crisis Protocols.
  - Transparent RAG citations, confidence scores, and source inspection.
  - Fallback client-side vector engine so the app works seamlessly offline.

- **24/7 Emergency Crisis SOS**:
  - Prominent Emergency SOS button accessible anytime.
  - National & International Helpline Directory:
    - **India**: Tele-MANAS (`14416` / `1800 891 4416`) & Vandrevala Foundation (`+91 9999 666 555`)
    - **USA & Canada**: Suicide & Crisis Lifeline (`988`)
    - **UK**: Samaritans (`116 123`) & NHS (`111`)
    - **Australia**: Lifeline (`13 11 14`)
    - **International**: Befrienders Worldwide
  - Click-to-call direct links (`tel:`) and 1-click Emergency SMS composer for trusted contacts.

- **Automated Crisis Intent Detection**:
  - Real-time keyword and semantic risk detection (e.g. self-harm, suicidal ideation) that automatically triggers immediate safety protocols and helpline overlays.

- **Interactive Coping & Grounding Tools**:
  - **4-7-8 Deep Breathing Circle**: Animated visualizer for diaphragmatic breathing.
  - **5-4-3-2-1 Grounding Checklist**: Step-by-step sensory re-anchoring exercise.
  - **Symptom Selector**: Tap symptoms (Insomnia, Low Energy, Negative Thoughts, Isolation, Anxiety) to generate targeted coping plans.

---

## 🛠️ Project Structure

```text
├── backend/
│   ├── app.py                # FastAPI web server exposing REST endpoints
│   ├── rag_engine.py         # TF-IDF & Cosine Similarity RAG vector engine
│   ├── knowledge_base.json   # Indexed psychological evidence-based modules
│   └── requirements.txt      # Python dependencies (fastapi, uvicorn, scikit-learn)
│
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Minimalist navbar with Emergency SOS button
│   │   ├── ChatWindow.jsx       # Chat window with collapsible clinical sources
│   │   ├── SymptomPicker.jsx    # Quick symptom selection strip
│   │   ├── EmergencyModal.jsx   # 24/7 Crisis Helpline & Emergency SMS modal
│   │   ├── BreathingWidget.jsx  # Animated 4-7-8 Breathing circle visualizer
│   │   ├── GroundingWidget.jsx  # 5-4-3-2-1 Sensory Grounding checklist
│   │   └── RAGInspectorModal.jsx# Knowledge base inspection tool
│   ├── services/
│   │   └── ragService.js        # RAG API client & in-browser vector fallback
│   ├── App.jsx                  # Main application layout
│   └── index.css                # Tailwind CSS v4 styling & design tokens
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 or higher

### 1. Install Dependencies

**Frontend dependencies:**
```bash
npm install
```

**Backend dependencies:**
```bash
pip install -r backend/requirements.txt
```

### 2. Start the Servers

**Start Python FastAPI Backend:**
```bash
python backend/app.py
```
*(Runs on `http-[# 127.0.0.1:8000`](http://127.0.0.1:8000))*

**Start Frontend Development Server:**
```bash
npm run dev
```
*(Runs on `http://localhost:5173/`)*

---

## 📡 REST API Documentation

- `GET /health`: Health check endpoint for container orchestrators and cloud platforms.
- `POST /api/chat`: Send user query & symptoms; returns context-augmented response, crisis status, and retrieved sources.
- `POST /api/symptoms/assess`: Assess symptoms list and return tailored coping strategy.
- `GET /api/emergency`: Retrieve crisis hotlines by region.
- `GET /api/knowledge`: Query all indexed RAG knowledge base items.

---

## 🚀 Deployment

MindHaven is production-ready with turnkey configuration for all major platforms:

- **Docker / Cloud Run / AWS**: Preconfigured multi-stage [`Dockerfile`](Dockerfile) and [`docker-compose.yml`](docker-compose.yml) (`docker compose up --build`).
- **Render**: One-click blueprint with [`render.yaml`](render.yaml).
- **Vercel / Netlify**: SPA routing presets via [`vercel.json`](vercel.json) and [`netlify.toml`](netlify.toml).
- **Heroku / Railway**: Supported via [`Procfile`](Procfile) and automatic Docker detection.

For step-by-step guides for each platform, see [**DEPLOYMENT.md**](DEPLOYMENT.md).

---


## ⚠️ Medical Disclaimer

MindHaven is an educational and self-help support application powered by evidence-based psychological resources and RAG technology. It is **not** a replacement for professional diagnosis, therapy, or medical advice. If you or someone you know is in crisis or danger, please immediately contact emergency services or use the emergency hotlines provided in the app.
