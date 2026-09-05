import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from rag_engine import RAGEngine

app = FastAPI(
    title="RAG Mental Health & Depression Chatbot API",
    description="Retrieval-Augmented Generation API providing evidence-based coping strategies and crisis support.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Engine
kb_path = os.path.join(os.path.dirname(__file__), "knowledge_base.json")
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

@app.get("/")
def read_root():
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

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
