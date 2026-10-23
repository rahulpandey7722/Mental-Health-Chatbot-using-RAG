import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Ensure the backend directory is in sys.path regardless of execution cwd
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from rag_engine import RAGEngine

app = FastAPI(
    title="RAG Mental Health & Depression Chatbot API",
    description="Retrieval-Augmented Generation API providing evidence-based coping strategies and crisis support.",
    version="1.0.0"
)

# Enable CORS for frontend integration (configurable via ALLOWED_ORIGINS env var)
raw_origins = os.environ.get("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()] if raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True if allowed_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Engine
kb_path = os.path.join(current_dir, "knowledge_base.json")
rag_engine = RAGEngine(kb_path)

# Data Models
class ChatRequest(BaseModel):
    message: str
    selected_symptoms: Optional[List[str]] = []

class SymptomAssessmentRequest(BaseModel):
    symptoms: List[str]

# Crisis Helpline Contact Directory
EMERGENCY_CONTACTS = [
    {
        "country": "United States & Canada",
        "name": "988 Suicide & Crisis Lifeline",
        "number": "988",
        "type": "Call or Text 24/7",
        "website": "https://988lifeline.org"
    },
    {
        "country": "India",
        "name": "Tele-MANAS (Govt of India)",
        "number": "14416",
        "type": "Toll-free 24/7 Helpline",
        "website": "https://telemanas.mohfw.gov.in"
    },
    {
        "country": "India",
        "name": "Vandrevala Foundation Helpline",
        "number": "+91 9999 666 555",
        "type": "Call 24/7",
        "website": "https://www.vandrevalafoundation.com"
    },
    {
        "country": "United Kingdom",
        "name": "Samaritans & NHS 111",
        "number": "116 123",
        "type": "Free 24/7 Call",
        "website": "https://www.samaritans.org"
    },
    {
        "country": "Australia",
        "name": "Lifeline Australia",
        "number": "13 11 14",
        "type": "Call or Text 24/7",
        "website": "https://www.lifeline.org.au"
    },
    {
        "country": "International",
        "name": "Befrienders Worldwide",
        "number": "Online Directory",
        "type": "Global Crisis Centers",
        "website": "https://www.befrienders.org"
    }
]

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MindHaven RAG API",
        "version": "1.0.0"
    }

# Path to built frontend static files (if present in production / unified deployment)
dist_dir = os.path.abspath(os.path.join(current_dir, "..", "dist"))

@app.get("/")
def read_root():
    if os.path.isdir(dist_dir):
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
    return {
        "message": "Mental Health RAG Chatbot API is operational.",
        "status": "online",
        "version": "1.0.0"
    }

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    if not request.message or request.message.strip() == "":
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    # If explicit symptoms passed from frontend picker, append to query context
    combined_query = request.message
    if request.selected_symptoms:
        combined_query += f" (I am experiencing: {', '.join(request.selected_symptoms)})"
        
    result = rag_engine.generate_response(combined_query)
    return result

@app.post("/api/symptoms/assess")
def assess_symptoms(request: SymptomAssessmentRequest):
    if not request.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms list cannot be empty.")
    
    query = f"I am dealing with symptoms of {', '.join(request.symptoms)}. What can I do?"
    result = rag_engine.generate_response(query)
    return result

@app.get("/api/emergency")
def get_emergency_contacts():
    return {
        "contacts": EMERGENCY_CONTACTS,
        "general_advice": "If you or someone you know is in immediate physical danger, please call your local emergency medical services immediately."
    }

@app.get("/api/knowledge")
def get_knowledge_items():
    return {
        "count": len(rag_engine.documents),
        "items": rag_engine.documents
    }

# Mount static assets and handle SPA routing if frontend dist exists
if os.path.isdir(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa_route(full_path: str):
        if full_path.startswith("api/") or full_path == "api" or full_path.startswith("health"):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Page not found")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    reload = os.environ.get("RELOAD", "false").lower() in ("true", "1")
    uvicorn.run("app:app", host=host, port=port, reload=reload)

