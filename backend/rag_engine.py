import json
import re
import math
import os
import urllib.request
import urllib.error
from typing import List, Dict, Any, Tuple, Optional

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
            r"\bcan't go on\b", r"\bcant go on\b", r"\bbetter off dead\b", r"\bdisappear forever\b",
            r"\bend it all\b", r"\bhang myself\b", r"\btake all my pills\b"
        ]
        
        # Conversational intent patterns
        self.greeting_keywords = [
            r"^(hi|hello|hey|greetings|good morning|good evening|good afternoon|namaste|sup|howdy)\b",
            r"^(hi there|hello there|hey there)\b"
        ]
        
        self.gratitude_keywords = [
            r"\b(thank you|thanks|thank u|thx|appreciate it|helpful|grateful|that helped)\b"
        ]
        
        self.identity_keywords = [
            r"\b(who are you|what are you|what can you do|what is this|how do you work|are you a bot|are you ai)\b"
        ]
        
        # Comprehensive symptom and scenario taxonomy
        self.symptom_map = {
            "exam_academic": [
                "exam", "exams", "test", "studying", "study", "academic", "grades", "college", 
                "school", "university", "syllabus", "passed", "failed", "assignment", "revision", "student"
            ],
            "breakup_relationship": [
                "breakup", "broke up", "heartbreak", "heartbroken", "ex", "divorce", "relationship",
                "partner", "cheated", "dating", "rejection", "dumped", "left me"
            ],
            "burnout_work": [
                "burnout", "work", "job", "career", "boss", "office", "overworked", "imposter", 
                "workplace", "working hours", "deadline", "corporate", "profession"
            ],
            "overthinking": [
                "overthinking", "overthink", "racing thoughts", "what if", "mind spinning", 
                "obsessing", "ruminating", "rumination", "can't stop thinking", "paralysis"
            ],
            "procrastination": [
                "procrastinate", "procrastinating", "procrastination", "avoiding", "delaying", "lazy", "task paralysis",
                "can't focus", "distracted", "putting off", "executive dysfunction", "no motivation", "unmotivated"
            ],
            "low_self_esteem": [
                "hate myself", "worthless", "not good enough", "failure", "insecure", "ugly", 
                "shame", "guilt", "loser", "unlovable", "self criticism", "inner critic"
            ],
            "anger_irritability": [
                "angry", "anger", "rage", "frustrated", "short temper", "irritated", "snapping", 
                "annoyed", "pissed", "agitated", "resentment"
            ],
            "panic_anxiety": [
                "panic attack", "panic", "chest tightness", "can't breathe", "hyperventilating", 
                "heart racing", "trembling", "suffocating", "shaking", "terror"
            ],
            "social_anxiety": [
                "social anxiety", "crowds", "shyness", "talking to people", "embarrassed", 
                "people judging", "public speaking", "spotlight effect", "awkward"
            ],
            "morning_depression": [
                "morning", "waking up", "wake up sad", "dread waking up", "morning depression", 
                "heavy mornings", "cortisol"
            ],
            "boundaries": [
                "say no", "people pleasing", "pleasing everyone", "boundaries", "toxic friend", 
                "taken advantage of", "fawning"
            ],
            "grief_loss": [
                "grief", "loss", "mourning", "death", "passed away", "lost my", "funeral", "bereavement"
            ],
            "numbness": [
                "numb", "empty", "no emotions", "feel nothing", "can't feel", "dead inside", "anhedonia"
            ],
            "insomnia": [
                "insomnia", "sleepless", "can't sleep", "cant sleep", "wake up early", "oversleeping", 
                "nightmares", "restless sleep", "waking up tired"
            ],
            "fatigue": [
                "fatigue", "tired", "exhausted", "low energy", "no energy", "sluggish", "heavy body", 
                "stay in bed", "can't get up"
            ],
            "isolation": [
                "lonely", "alone", "isolated", "withdrawing", "nobody cares", "burdensome", 
                "no friends", "friendless"
            ],
            "therapy_guidance": [
                "therapy", "therapist", "psychologist", "psychiatrist", "medication", "antidepressant", 
                "counselor", "doctor", "consultation"
            ],
            "general_depression": [
                "what is depression", "am i depressed", "clinical depression", "depression vs sadness", 
                "explain depression", "why am i feeling this way"
            ]
        }
        
        self.load_knowledge_base()
        self._build_vector_index()

    def load_knowledge_base(self):
        with open(self.knowledge_base_path, 'r', encoding='utf-8') as f:
            self.documents = json.load(f)

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        words = re.findall(r'\b[a-z0-9]+\b', text)
        stop_words = {
            "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", 
            "which", "this", "that", "these", "those", "then", "just", "so", "than", 
            "such", "both", "through", "about", "for", "is", "of", "to", "in", "it", 
            "with", "i", "me", "my", "myself", "we", "our", "you", "your", "am", "are", "was", "were"
        }
        return [w for w in words if w not in stop_words and len(w) > 1]

    def _build_vector_index(self):
        """Build TF-IDF matrix for semantic document retrieval."""
        doc_count = len(self.documents)
        df = {}
        tf_list = []
        
        for doc in self.documents:
            combined_text = f"{doc['title']} {doc['category']} {' '.join(doc.get('symptoms', []))} {doc['content']}"
            tokens = self._tokenize(combined_text)
            
            tf = {}
            for w in tokens:
                tf[w] = tf.get(w, 0) + 1
            
            for w in set(tokens):
                df[w] = df.get(w, 0) + 1
                
            tf_list.append(tf)

        self.vocab = sorted(list(df.keys()))
        
        for w, freq in df.items():
            self.idf[w] = math.log((1 + doc_count) / (1 + freq)) + 1.0

        self.tfidf_matrix = []
        for tf in tf_list:
            vec = {}
            norm_sq = 0.0
            for w, count in tf.items():
                tfidf_val = (count) * self.idf[w]
                vec[w] = tfidf_val
                norm_sq += tfidf_val ** 2
            norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
            norm_vec = {w: v / norm for w, v in vec.items()}
            self.tfidf_matrix.append(norm_vec)

    def check_crisis_risk(self, user_query: str) -> bool:
        query_lower = user_query.lower()
        for pattern in self.crisis_keywords:
            if re.search(pattern, query_lower):
                return True
        return False

    def check_greeting(self, user_query: str) -> bool:
        query_strip = user_query.strip().lower()
        for pattern in self.greeting_keywords:
            if re.search(pattern, query_strip):
                return True
        return query_strip in ["hi", "hello", "hey", "hola", "namaste", "help", "good day"]

    def check_gratitude(self, user_query: str) -> bool:
        query_lower = user_query.lower()
        for pattern in self.gratitude_keywords:
            if re.search(pattern, query_lower):
                return True
        return False

    def check_identity(self, user_query: str) -> bool:
        query_lower = user_query.lower()
        for pattern in self.identity_keywords:
            if re.search(pattern, query_lower):
                return True
        return False

    def extract_symptoms(self, user_query: str) -> List[str]:
        query_lower = user_query.lower()
        detected = []
        for symptom_name, keywords in self.symptom_map.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', query_lower):
                    formatted_name = symptom_name.replace("_", " ")
                    if formatted_name not in detected:
                        detected.append(formatted_name)
                    break
        return detected

    def retrieve(self, query: str, top_k: int = 2) -> List[Tuple[Dict[str, Any], float]]:
        tokens = self._tokenize(query)
        if not tokens:
            return [(self.documents[0], 0.5)] if self.documents else []

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

        category_targets = {
            "exam_academic": ["exam_academic_stress"],
            "breakup_relationship": ["breakup_relationship_grief"],
            "burnout_work": ["workplace_burnout_imposter"],
            "overthinking": ["overthinking_rumination_loops"],
            "procrastination": ["procrastination_executive_dysfunction"],
            "low_self_esteem": ["low_self_esteem_inner_critic"],
            "anger_irritability": ["anger_irritability_emotional_regulation"],
            "panic_anxiety": ["panic_attacks_acute_anxiety", "somatic_grounding"],
            "social_anxiety": ["social_anxiety_fear_of_judgment"],
            "morning_depression": ["morning_depression_diurnal_variation"],
            "boundaries": ["boundary_setting_people_pleasing"],
            "grief_loss": ["grief_bereavement_coping_loss"],
            "numbness": ["emotional_numbness_anhedonia"],
            "insomnia": ["sleep_hygiene_cbti"],
            "fatigue": ["behavioral_activation", "physical_movement_pacing"],
            "isolation": ["social_reconnection", "loneliness_existential_dread"],
            "therapy_guidance": ["therapy_and_professional_help"],
            "general_depression": ["general_depression_overview"]
        }

        # Identify which categories match query
        matched_target_ids = set()
        query_lower = query.lower()
        for cat_name, keywords in self.symptom_map.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', query_lower):
                    for tid in category_targets.get(cat_name, []):
                        matched_target_ids.add(tid)
                    break

        scores = []
        for idx, doc_vec in enumerate(self.tfidf_matrix):
            score = 0.0
            doc = self.documents[idx]
            doc_id = doc.get("id", "")

            # Strong boost if document directly corresponds to detected symptom intent
            if doc_id in matched_target_ids:
                score += 0.75

            for w, q_val in query_norm_vec.items():
                if w in doc_vec:
                    score += q_val * doc_vec[w]
            
            # Boost score based on symptom matches
            doc_symptoms = [s.lower() for s in doc.get('symptoms', [])]
            for s in doc_symptoms:
                if s in query_lower:
                    score += 0.35
                    
            # Boost score if words in title match query
            title_tokens = self._tokenize(doc.get('title', ''))
            for t in tokens:
                if t in title_tokens:
                    score += 0.25
                    
            scores.append((doc, round(float(score), 4)))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def _call_llm_if_available(self, user_query: str, retrieved_docs: List[Dict[str, Any]]) -> Optional[str]:
        """Optionally generate response using Gemini or Groq or OpenAI if API key is present."""
        gemini_key = os.environ.get("GEMINI_API_KEY")
        groq_key = os.environ.get("GROQ_API_KEY")
        openai_key = os.environ.get("OPENAI_API_KEY")

        context_str = "\n\n".join([
            f"Source [{d['title']} ({d['category']})]:\n{d['content']}\nAction Steps:\n" + "\n".join([f"- {s}" for s in d.get('actionable_steps', [])])
            for d in retrieved_docs
        ])

        system_instruction = (
            "You are MindHaven, a compassionate, evidence-based mental health coping assistant specializing in depression and emotional support. "
            "Address the user's question directly with empathy, clarity, and psychological depth. "
            "Use the provided evidence-based clinical context to provide concrete, compassionate coping solutions and practical micro-steps. "
            "Keep the tone warm, grounded, and non-judgmental. If severe distress is noted, remind them gently of crisis resources. "
            "Do NOT sound robotic or repeat canned templates."
        )

        # 1. Google Gemini
        if gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{
                        "parts": [
                            {"text": f"{system_instruction}\n\nEvidence Context:\n{context_str}\n\nUser Question:\n{user_query}"}
                        ]
                    }],
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 800}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                    if text and text.strip():
                        return text.strip()
            except Exception as e:
                print(f"Gemini generation fallback: {e}")

        # 2. Groq
        if groq_key:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                payload = {
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": f"{system_instruction}\n\nEvidence Context:\n{context_str}"},
                        {"role": "user", "content": user_query}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 800
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {groq_key}"}
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    text = res_data["choices"][0]["message"]["content"]
                    if text and text.strip():
                        return text.strip()
            except Exception as e:
                print(f"Groq generation fallback: {e}")

        # 3. OpenAI
        if openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": f"{system_instruction}\n\nEvidence Context:\n{context_str}"},
                        {"role": "user", "content": user_query}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 800
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {openai_key}"}
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    text = res_data["choices"][0]["message"]["content"]
                    if text and text.strip():
                        return text.strip()
            except Exception as e:
                print(f"OpenAI generation fallback: {e}")

        return None

    def generate_response(self, user_query: str) -> Dict[str, Any]:
        """Generates RAG-augmented response with adaptive intent detection, deep knowledge, and safety checks."""
        # 1. Immediate Safety Crisis Check
        if self.check_crisis_risk(user_query):
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

        # 2. Greeting Intent
        if self.check_greeting(user_query):
            return {
                "response": (
                    "👋 **Hello and welcome! I am MindHaven**, your compassionate mental health and depression coping companion.\n\n"
                    "Whether you're feeling overwhelmed, wrestling with negative thoughts, struggling to get out of bed, or facing specific challenges like exam stress, work burnout, or relationship pain—I am here to listen and help.\n\n"
                    "**How can I support you today?** You can try asking:\n"
                    "- *'I'm feeling anxious and overwhelmed with exam/study pressure'*\n"
                    "- *'How can I stop overthinking and racing thoughts at night?'*\n"
                    "- *'I have zero energy or motivation today, what should I do?'*\n"
                    "- *'How do I deal with heartbreak and a painful breakup?'*\n"
                    "- *'I constantly feel not good enough and criticize myself'*\n\n"
                    "Or simply share in your own words what you are experiencing right now."
                ),
                "is_crisis": False,
                "detected_symptoms": ["greeting"],
                "retrieved_sources": [{
                    "title": "Psychoeducation & MindHaven Assistant Guide",
                    "category": "Interactive Support",
                    "relevance_score": 1.0,
                    "citation": "MindHaven Clinical Coping System"
                }]
            }

        # 3. Gratitude Intent
        if self.check_gratitude(user_query):
            return {
                "response": (
                    "💙 **You are so very welcome!**\n\n"
                    "Taking intentional time to acknowledge your emotions and explore evidence-based coping tools is a courageous act of self-care.\n\n"
                    "Remember that mental well-being is not a race—progress comes through gentle, tiny micro-steps. If you ever feel heavy again, remember I am right here anytime you need to talk or reset."
                ),
                "is_crisis": False,
                "detected_symptoms": ["gratitude"],
                "retrieved_sources": [{
                    "title": "Positive Reinforcement & Mindful Growth",
                    "category": "Supportive Therapy",
                    "relevance_score": 1.0,
                    "citation": "MindHaven Self-Care Framework"
                }]
            }

        # 4. Identity / Capabilities Intent
        if self.check_identity(user_query):
            return {
                "response": (
                    "🧠 **I am MindHaven**, an evidence-based mental health support assistant powered by Retrieval-Augmented Generation (RAG).\n\n"
                    "### What I Do:\n"
                    "1. **Clinical Coping Strategies**: I draw from peer-reviewed psychological frameworks—including Cognitive Behavioral Therapy (CBT), Behavioral Activation, Acceptance & Commitment Therapy (ACT), and CBT for Insomnia (CBT-I).\n"
                    "2. **Specific Life Solutions**: I offer targeted guidance for academic stress, relationship grief, career burnout, chronic overthinking, procrastination, inner self-criticism, and loneliness.\n"
                    "3. **Somatic & Nervous System Reset**: I guide you through vagus nerve regulation, 5-4-3-2-1 sensory grounding, and 4-7-8 deep breathing.\n"
                    "4. **Emergency Safety**: Instant 24/7 hotline directory and safety protocols whenever you need urgent human care.\n\n"
                    "*What would you like guidance on today?*"
                ),
                "is_crisis": False,
                "detected_symptoms": ["identity"],
                "retrieved_sources": [{
                    "title": "System Architecture & Clinical RAG Taxonomy",
                    "category": "Psychoeducation",
                    "relevance_score": 1.0,
                    "citation": "Beck Institute & APA Evidence-Based Practice"
                }]
            }

        # 5. Extract Symptoms and Perform Retrieval
        detected_symptoms = self.extract_symptoms(user_query)
        retrieved_results = self.retrieve(user_query, top_k=2)
        top_doc, top_score = retrieved_results[0] if retrieved_results else (self.documents[0], 0.5)

        # 6. Check for LLM generation (Gemini, Groq, OpenAI) if configured
        docs_for_llm = [r[0] for r in retrieved_results]
        llm_response = self._call_llm_if_available(user_query, docs_for_llm)
        if llm_response:
            return {
                "response": llm_response,
                "is_crisis": False,
                "detected_symptoms": detected_symptoms,
                "retrieved_sources": [{
                    "title": doc["title"],
                    "category": doc["category"],
                    "relevance_score": score,
                    "citation": doc["citation"]
                } for doc, score in retrieved_results]
            }

        # 7. Adaptive Algorithmic Conversational Synthesis (Zero-cost, fully dynamic)
        clean_query = user_query.strip()
        
        # Personalized situational intro
        intro = ""
        if "exam" in clean_query.lower() or "study" in clean_query.lower() or "grades" in clean_query.lower():
            intro = "I hear how demanding and high-pressure academic challenges can feel. When exams or deadlines loom, your brain can perceive them as an existential threat, causing freeze or panic states. Let's look at how to unpack this and regain your calm clarity."
        elif "breakup" in clean_query.lower() or "ex" in clean_query.lower() or "heartbreak" in clean_query.lower():
            intro = "Going through a breakup or relationship loss is one of the most painful experiences a person can navigate. Neurologically, your system is processing both emotional grief and physical withdrawal. Please treat yourself with immense gentleness right now."
        elif "work" in clean_query.lower() or "burnout" in clean_query.lower() or "job" in clean_query.lower() or "boss" in clean_query.lower():
            intro = "Workplace exhaustion and burnout occur when relentless demands collide with insufficient emotional recovery. Feeling depleted or doubting yourself doesn't mean you are incapable—it means your nervous system is sounding an alarm for boundaries."
        elif "overthinking" in clean_query.lower() or "racing thoughts" in clean_query.lower() or "what if" in clean_query.lower():
            intro = "It is exhausting when your mind is spinning with endless 'what ifs' and loops of worry. Overthinking tricks you into feeling like you are preparing, but in reality it traps your energy in mental paralysis. Let's break the cycle."
        elif "procrastinat" in clean_query.lower() or "lazy" in clean_query.lower() or "can't focus" in clean_query.lower():
            intro = "First, take a deep breath and forgive yourself: procrastination is not laziness, it is an emotional coping mechanism to avoid anxiety or fear of failure. When we lower the threat level, focus returns naturally."
        elif "sleep" in clean_query.lower() or "insomnia" in clean_query.lower() or "night" in clean_query.lower():
            intro = "Tossing and turning at night with an active mind is deeply frustrating and physically draining. Sleep disruptions and low mood reinforce each other, so breaking this loop with structured circadian habits is our priority."
        elif "angry" in clean_query.lower() or "irritat" in clean_query.lower() or "temper" in clean_query.lower():
            intro = "Anger and sudden irritability are very common manifestations of depression and burnout. When your emotional bandwidth is depleted, small stressors feel like massive violations. Recognizing this is your first step toward relief."
        elif detected_symptoms:
            intro = f"I hear you, and I understand you are dealing with challenging feelings related to **{', '.join(detected_symptoms)}**. Thank you for opening up—let's break down practical, evidence-based ways to address this."
        else:
            intro = "Thank you for sharing your thoughts with me. Whatever you are navigating right now, you do not have to figure it all out at once. Here is a grounded psychological perspective to help guide you through this."

        # Core Solution Synthesis
        response_text = f"{intro}\n\n"
        response_text += f"### 💡 Evidence-Based Solution: {top_doc['title']}\n"
        response_text += f"**Clinical Approach:** *{top_doc['category']}*\n\n"
        response_text += f"{top_doc['content']}\n\n"

        # Actionable Steps
        if top_doc.get("actionable_steps"):
            response_text += "**🌱 Concrete Steps You Can Take Right Now:**\n"
            for idx, step in enumerate(top_doc["actionable_steps"], 1):
                response_text += f"{idx}. {step}\n"

        # Secondary Insight if relevant
        if len(retrieved_results) > 1 and retrieved_results[1][1] > 0.25:
            second_doc = retrieved_results[1][0]
            response_text += f"\n---\n### 🔍 Complementary Perspective: {second_doc['title']}\n"
            response_text += f"{second_doc['content']}\n"

        # Reflective Q&A Prompt
        response_text += (
            "\n\n**💬 A Reflective Question for You:**\n"
            "*Which single small step from above feels most manageable to attempt in the next 10 minutes?* "
            "Feel free to reply with how you're feeling, or ask for more specific guidance!"
        )

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
            "detected_symptoms": detected_symptoms if detected_symptoms else ["support"],
            "retrieved_sources": sources_info
        }
