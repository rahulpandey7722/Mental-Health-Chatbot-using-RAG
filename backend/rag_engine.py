import json
import re
import math
from typing import List, Dict, Any, Tuple

class RAGEngine:
    def __init__(self, knowledge_base_path: str):
        self.knowledge_base_path = knowledge_base_path
        self.documents = []
        self.vocab = []
        self.tfidf_matrix = []
        self.idf = {}
        
        # High-risk crisis phrases for safety detection
        self.crisis_keywords = [
            r"\bsuicide\b", r"\bkill my\b", r"\bkill myself\b", r"\bend my life\b",
            r"\bwant to die\b", r"\bself harm\b", r"\bcutting\b", r"\bdont want to live\b",
            r"\bcan't go on\b", r"\bcant go on\b", r"\bbetter off dead\b", r"\bdisappear forever\b"
        ]
        
        # Symptom keyword taxonomy for precision matching
        self.symptom_map = {
            "insomnia": ["insomnia", "sleepless", "can't sleep", "cant sleep", "wake up early", "oversleeping", "nightmares"],
            "fatigue": ["fatigue", "tired", "exhausted", "low energy", "no energy", "sluggish", "heavy body"],
            "negative thoughts": ["worthless", "hopeless", "failure", "guilt", "useless", "hate myself", "negative thoughts", "rumination"],
            "anhedonia": ["loss of interest", "no pleasure", "bored", "numb", "apathy", "don't care", "cant enjoy"],
            "anxiety": ["anxious", "panic", "overwhelmed", "chest tightness", "racing thoughts", "fear", "nervous"],
            "isolation": ["lonely", "alone", "isolated", "withdrawing", "nobody cares", "burdensome"]
        }
        
        self.load_knowledge_base()
        self._build_vector_index()

    def load_knowledge_base(self):
        with open(self.knowledge_base_path, 'r', encoding='utf-8') as f:
            self.documents = json.load(f)

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        words = re.findall(r'\b[a-z0-9]+\b', text)
        stop_words = {"a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which", "this", "that", "these", "those", "then", "just", "so", "than", "such", "both", "through", "about", "for", "is", "of", "to", "in", "it", "with", "i", "me", "my", "myself", "we", "our", "you", "your"}
        return [w for w in words if w not in stop_words and len(w) > 1]

    def _build_vector_index(self):
        """Build TF-IDF matrix for semantic document retrieval."""
        doc_count = len(self.documents)
        df = {}
        tf_list = []
        
        for doc in self.documents:
            # Combine title, content, symptoms, category for rich embedding representation
            combined_text = f"{doc['title']} {doc['category']} {' '.join(doc['symptoms'])} {doc['content']}"
            tokens = self._tokenize(combined_text)
            
            tf = {}
            for w in tokens:
                tf[w] = tf.get(w, 0) + 1
            
            for w in set(tokens):
                df[w] = df.get(w, 0) + 1
                
            tf_list.append(tf)

        # Build vocabulary
        self.vocab = sorted(list(df.keys()))
        
        # Calculate IDF
        for w, freq in df.items():
            self.idf[w] = math.log((1 + doc_count) / (1 + freq)) + 1.0

        # Calculate normalized TF-IDF for each document
        self.tfidf_matrix = []
        for tf in tf_list:
            vec = {}
            norm_sq = 0.0
            for w, count in tf.items():
                tfidf_val = (count) * self.idf[w]
                vec[w] = tfidf_val
                norm_sq += tfidf_val ** 2
            norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
            # Normalize vector
            norm_vec = {w: v / norm for w, v in vec.items()}
            self.tfidf_matrix.append(norm_vec)

    def check_crisis_risk(self, user_query: str) -> bool:
        """Detect crisis or suicidal intent in user input."""
        query_lower = user_query.lower()
        for pattern in self.crisis_keywords:
            if re.search(pattern, query_lower):
                return True
        return False

    def extract_symptoms(self, user_query: str) -> List[str]:
        """Extract detected symptoms from query."""
        query_lower = user_query.lower()
        detected = []
        for symptom_name, keywords in self.symptom_map.items():
            for kw in keywords:
                if kw in query_lower:
                    if symptom_name not in detected:
                        detected.append(symptom_name)
                    break
        return detected

    def retrieve(self, query: str, top_k: int = 2) -> List[Tuple[Dict[str, Any], float]]:
        """Retrieve top k relevant knowledge items matching query."""
        tokens = self._tokenize(query)
        if not tokens:
            return [(self.documents[0], 0.5)] if self.documents else []

        # Build query TF-IDF vector
        query_tf = {}
        for w in tokens:
            query_tf[w] = query_tf.get(w, 0) + 1

        query_vec = {}
        norm_sq = 0.0
        for w, count in query_tf.items():
            if w in self.idf:
                val = count * self.idf[w]
                query_vec[w] = val
                norm_sq += val ** 2
        
        query_norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
        query_norm_vec = {w: v / query_norm for w, v in query_vec.items()}

        # Cosine similarity scoring
        scores = []
        for idx, doc_vec in enumerate(self.tfidf_matrix):
            score = 0.0
            for w, q_val in query_norm_vec.items():
                if w in doc_vec:
                    score += q_val * doc_vec[w]
            
            # Boost score if query mentions exact symptom tags in doc
            doc_symptoms = [s.lower() for s in self.documents[idx].get('symptoms', [])]
            for t in tokens:
                if t in doc_symptoms:
                    score += 0.2
                    
            scores.append((self.documents[idx], round(float(score), 4)))

        # Sort descending by score
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def generate_response(self, user_query: str) -> Dict[str, Any]:
        """Generates RAG-augmented response with safety checks & citations."""
        is_crisis = self.check_crisis_risk(user_query)
        detected_symptoms = self.extract_symptoms(user_query)
        
        # If crisis detected, prepend emergency safety response
        if is_crisis:
            emergency_doc = next((d for d in self.documents if d["id"] == "crisis_safety_protocol"), self.documents[-1])
            return {
                "response": "⚠️ **IMMEDIATE SAFETY SUPPORT NOTICE**\n\nI hear how deeply painful things feel right now, but please know you do NOT have to carry this alone. Your life matters and support is available immediately.\n\n" + emergency_doc["content"] + "\n\n**Immediate Action Steps:**\n" + "\n".join([f"- {step}" for step in emergency_doc["actionable_steps"]]),
                "is_crisis": True,
                "detected_symptoms": ["crisis"],
                "retrieved_sources": [{
                    "title": emergency_doc["title"],
                    "category": emergency_doc["category"],
                    "relevance_score": 1.0,
                    "citation": emergency_doc["citation"]
                }]
            }

        # Perform RAG retrieval
        retrieved_results = self.retrieve(user_query, top_k=2)
        top_doc, top_score = retrieved_results[0] if retrieved_results else (self.documents[0], 0.5)

        # Build compassionate RAG generated message
        greeting = "I understand you are experiencing difficulty right now."
        if detected_symptoms:
            symptoms_str = ", ".join(detected_symptoms)
            greeting = f"I hear that you are dealing with symptoms related to **{symptoms_str}**. Thank you for sharing how you feel."
        
        response_text = f"{greeting}\n\n"
        response_text += f"### 💡 Evidence-Based Guidance: {top_doc['title']}\n"
        response_text += f"{top_doc['content']}\n\n"
        
        if top_doc.get("actionable_steps"):
            response_text += "**🌱 Small Action Steps You Can Try Today:**\n"
            for step in top_doc["actionable_steps"]:
                response_text += f"• {step}\n"

        if len(retrieved_results) > 1 and retrieved_results[1][1] > 0.15:
            second_doc = retrieved_results[1][0]
            response_text += f"\n---\n### 🔍 Additional Coping Insight: {second_doc['title']}\n"
            response_text += f"{second_doc['content']}\n"

        response_text += "\n\n*Remember: Progress in overcoming depression comes from gentle, small steps. If you feel overwhelmed, take a minute to use the Breathing Circle or Emergency SOS tools.*"

        sources_info = []
        for doc, score in retrieved_results:
            sources_info.append({
                "title": doc["title"],
                "category": doc["category"],
                "relevance_score": score,
                "citation": doc["citation"]
            })

        return {
            "response": response_text,
            "is_crisis": False,
            "detected_symptoms": detected_symptoms,
            "retrieved_sources": sources_info
        }
