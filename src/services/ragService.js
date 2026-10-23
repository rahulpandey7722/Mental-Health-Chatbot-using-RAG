// RAG Client Service with automatic fallback to client-side vector engine

// Dynamic API URL: uses VITE_API_BASE_URL if configured, otherwise falls back to localhost in dev, or relative origin in production
const rawApiUrl = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');
const API_BASE_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : '';


// Embedded vector knowledge base for instant offline/browser fallback
const LOCAL_KNOWLEDGE_BASE = [
  {
    id: "cbt_thought_reframing",
    category: "Cognitive Behavioral Therapy (CBT)",
    symptoms: ["negative thoughts", "rumination", "hopelessness", "self-criticism", "guilt", "worthlessness"],
    title: "CBT Thought Reframing (The 3 Cs Technique)",
    content: "When depression makes you feel hopeless or worthless, your mind often engages in cognitive distortions like All-or-Nothing thinking or Catastrophizing. Use the 3 Cs: 1. Catch it: Identify the negative automatic thought (e.g., 'I am a failure'). 2. Check it: Ask for objective evidence. 'Is this thought 100% true? What would I tell a close friend who said this?' 3. Change it: Replace it with a balanced, compassionate thought (e.g., 'I am struggling right now, but I have overcome tough times before, and I am taking small steps').",
    actionable_steps: [
      "Write down the negative thought verbatim.",
      "List 3 pieces of evidence for and against this thought.",
      "Formulate a neutral or balanced reframe."
    ],
    citation: "Beck, A. T. (1979). Cognitive Therapy of Depression. Guilford Press."
  },
  {
    id: "behavioral_activation",
    category: "Behavioral Activation",
    symptoms: ["low energy", "fatigue", "loss of interest", "anhedonia", "procrastination", "apathy", "feeling stuck"],
    title: "Behavioral Activation & Micro-Stepping",
    content: "Depression creates a vicious cycle: low mood causes withdrawal and inactivity, which further lowers mood and energy. Behavioral Activation reverses this cycle by acting BEFORE feeling motivated. Start with 'Micro-Stepping': break any overwhelming task into a tiny 2-minute action (e.g., opening a window, sitting up, drinking a glass of water). Action generates momentum, which gradually restores dopamine and energy.",
    actionable_steps: [
      "Select ONE small task that takes under 3 minutes.",
      "Commit to doing just 30 seconds of it without requiring perfection.",
      "Track your mood before and after completing it on a 1-10 scale."
    ],
    citation: "Martell, C. R. et al. (2010). Behavioral Activation for Depression. Guilford Press."
  },
  {
    id: "sleep_hygiene_cbti",
    category: "Sleep & Circadian Alignment",
    symptoms: ["insomnia", "oversleeping", "disrupted sleep", "nighttime anxiety", "waking up tired", "restlessness"],
    title: "Circadian Rest & Sleep Hygiene (CBT-I)",
    content: "Sleep disturbances directly worsen depressive symptoms and mood regulation. To reset your biological clock: 1. Get 10-15 minutes of natural daylight within 30 minutes of waking. 2. Keep a consistent wake-up time even on weekends. 3. If lying awake in bed for over 20 minutes with racing thoughts, get out of bed and do a low-light calming activity (reading, light stretching) until sleepy.",
    actionable_steps: [
      "Expose your eyes to sunlight shortly after waking up.",
      "Avoid screens and bright blue light 60 minutes before bed.",
      "Use your bed ONLY for sleep and rest, not for work or worrying."
    ],
    citation: "Morin, C. M. (2006). Insomnia: Psychological Assessment and Management. Springer."
  },
  {
    id: "somatic_grounding",
    category: "Somatic & Vagus Nerve Regulation",
    symptoms: ["anxiety", "panic", "overwhelmed", "chest tightness", "racing heartbeat", "brain fog"],
    title: "Vagus Nerve Activation & 5-4-3-2-1 Sensory Grounding",
    content: "When depression combines with high anxiety or sensory overwhelm, your nervous system is trapped in fight-or-flight or freeze states. To activate the vagus nerve and parasympathetic system: Use the 5-4-3-2-1 grounding exercise. Acknowledge 5 things you see around you, 4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste. Pair this with 4-7-8 deep diaphragmatic breathing.",
    actionable_steps: [
      "Inhale through nose for 4 seconds.",
      "Hold breath gently for 7 seconds.",
      "Exhale slowly through mouth making a whoosh sound for 8 seconds.",
      "Repeat for 4 cycles."
    ],
    citation: "Porges, S. W. (2011). The Polyvagal Theory. W. W. Norton & Company."
  },
  {
    id: "social_reconnection",
    category: "Interpersonal Therapy",
    symptoms: ["isolation", "loneliness", "feeling burdensome", "withdrawing from friends", "feeling misunderstood"],
    title: "Low-Pressure Social Re-engagement",
    content: "Depression tricks us into isolating because we feel like a burden or lack the energy for deep conversations. However, social connection is a primary buffer against depression. Use 'Low-Pressure Connection': text a simple emoji or 1-line check-in to a trusted person ('Thinking of you, low energy today but wanted to say hi'). You do not need to attend social events or explain your mental state.",
    actionable_steps: [
      "Send a low-effort message to ONE close friend or family member.",
      "Join an online supportive community or mental health listening group.",
      "Remind yourself that depression distorts your self-worth—people care about you."
    ],
    citation: "Klerman, G. L. et al. (1984). Interpersonal Psychotherapy of Depression. Basic Books."
  },
  {
    id: "physical_movement_pacing",
    category: "Somatic Health & Nutrition",
    symptoms: ["physical heaviness", "sluggishness", "body aches", "poor appetite", "emotional eating"],
    title: "Somatic Pacing & Gentle Physical Movement",
    content: "Depression manifests physically in the body as chronic muscular tension, systemic inflammation, and sluggishness. Studies show that 10 minutes of gentle walking or light stretching boosts brain-derived neurotrophic factor (BDNF) and endorphins as effectively as mild exercise. Hydrate with water and eat small, protein-rich snacks to keep blood sugar stable.",
    actionable_steps: [
      "Perform 3 gentle shoulder rolls and slow neck tilts right now.",
      "Take a 5-minute slow walk around your room or outside.",
      "Drink a glass of fresh room-temperature water."
    ],
    citation: "Craft, L. L., & Perna, F. M. (2004). The Benefits of Exercise for the Clinically Depressed. Primary Care Companion J Clin Psychiatry."
  },
  {
    id: "crisis_safety_protocol",
    category: "Crisis Intervention & Emergency Safety",
    symptoms: ["suicidal thoughts", "self harm", "wanting to give up", "severe crisis", "cannot stay safe"],
    title: "Emergency Safety Protocol & Immediate Crisis Support",
    content: "If you are having thoughts of suicide, self-harm, or feel you cannot keep yourself safe, please reach out for immediate professional crisis support right now. You are NOT alone, and there is help available 24/7. National hotlines are free, confidential, and compassionate. If in immediate physical danger, call your local emergency services (911 / 112 / 14416) or go to the nearest emergency room.",
    actionable_steps: [
      "Call or Text 988 (USA/Canada Suicide & Crisis Lifeline).",
      "Call Tele-MANAS at 14416 or 1800 891 4416 (India Crisis Helpline).",
      "Call 111 or Samaritans at 116 123 (UK Helpline).",
      "Reach out to Befrienders Worldwide (befrienders.org) for international support.",
      "Contact a trusted friend, family member, or healthcare provider immediately."
    ],
    citation: "World Health Organization (WHO). National Suicide Prevention Guidelines & Safety Planning."
  }
];

const CRISIS_KEYWORDS = [
  "suicide", "kill my", "kill myself", "end my life", "want to die",
  "self harm", "cutting", "dont want to live", "can't go on", "cant go on",
  "better off dead", "disappear forever", "end it all"
];

// Helper: Tokenize text
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

// In-Browser RAG Engine
function localRAGQuery(queryText, selectedSymptoms = []) {
  const queryLower = queryText.toLowerCase();
  
  // 1. Crisis Check
  const isCrisis = CRISIS_KEYWORDS.some(kw => queryLower.includes(kw));
  if (isCrisis) {
    const emergencyDoc = LOCAL_KNOWLEDGE_BASE.find(d => d.id === "crisis_safety_protocol");
    return {
      response: `⚠️ **IMMEDIATE SAFETY SUPPORT NOTICE**\n\nI hear how deeply painful things feel right now, but please know you do NOT have to carry this alone. Your life matters and support is available immediately.\n\n${emergencyDoc.content}\n\n**Immediate Action Steps:**\n` + emergencyDoc.actionable_steps.map(s => `- ${s}`).join('\n'),
      is_crisis: true,
      detected_symptoms: ["crisis"],
      retrieved_sources: [{
        title: emergencyDoc.title,
        category: emergencyDoc.category,
        relevance_score: 1.0,
        citation: emergencyDoc.citation
      }]
    };
  }

  // 2. Extract Symptoms
  const queryTokens = tokenize(queryText);
  const detectedSymptoms = [...selectedSymptoms];
  
  LOCAL_KNOWLEDGE_BASE.forEach(doc => {
    doc.symptoms.forEach(sym => {
      if (queryLower.includes(sym.toLowerCase()) && !detectedSymptoms.includes(sym)) {
        detectedSymptoms.push(sym);
      }
    });
  });

  // 3. TF-IDF & Keyword Vector Scoring
  const scoredDocs = LOCAL_KNOWLEDGE_BASE.map(doc => {
    let score = 0.0;
    const docText = `${doc.title} ${doc.category} ${doc.symptoms.join(' ')} ${doc.content}`.toLowerCase();
    const docTokens = tokenize(docText);

    queryTokens.forEach(token => {
      if (docTokens.includes(token)) score += 0.25;
    });

    doc.symptoms.forEach(sym => {
      if (queryLower.includes(sym.toLowerCase()) || selectedSymptoms.includes(sym)) {
        score += 0.4;
      }
    });

    return { doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  const topResults = scoredDocs.slice(0, 2);
  const topDoc = topResults[0]?.doc || LOCAL_KNOWLEDGE_BASE[0];

  // 4. Construct RAG Response
  let greeting = "I understand you are experiencing difficulty right now.";
  if (detectedSymptoms.length > 0) {
    greeting = `I hear that you are dealing with symptoms related to **${detectedSymptoms.slice(0, 3).join(', ')}**. Thank you for sharing how you feel.`;
  }

  let responseText = `${greeting}\n\n`;
  responseText += `### 💡 Evidence-Based Guidance: ${topDoc.title}\n`;
  responseText += `${topDoc.content}\n\n`;

  if (topDoc.actionable_steps) {
    responseText += `**🌱 Small Action Steps You Can Try Today:**\n`;
    topDoc.actionable_steps.forEach(step => {
      responseText += `• ${step}\n`;
    });
  }

  if (topResults.length > 1 && topResults[1].score > 0.3) {
    const secondDoc = topResults[1].doc;
    responseText += `\n---\n### 🔍 Additional Coping Insight: ${secondDoc.title}\n`;
    responseText += `${secondDoc.content}\n`;
  }

  responseText += `\n\n*Remember: Progress in overcoming depression comes from gentle, small steps. If you feel overwhelmed, take a minute to use the Breathing Circle or Emergency SOS tools.*`;

  return {
    response: responseText,
    is_crisis: false,
    detected_symptoms: detectedSymptoms,
    retrieved_sources: topResults.map(r => ({
      title: r.doc.title,
      category: r.doc.category,
      relevance_score: Math.min(1.0, Math.max(0.45, Number(r.score.toFixed(2)))),
      citation: r.doc.citation
    }))
  };
}

// API Service Call with local fallback
export async function sendChatMessage(message, selectedSymptoms = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        selected_symptoms: selectedSymptoms
      })
    });
    if (response.ok) {
      const data = await response.json();
      return { ...data, source: 'python-api' };
    }
  } catch (err) {
    console.log("FastAPI backend not reachable, utilizing client-side RAG engine.", err);
  }
  
  // Fallback to local RAG engine
  const localRes = localRAGQuery(message, selectedSymptoms);
  return { ...localRes, source: 'browser-rag' };
}

export async function fetchEmergencyContacts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emergency`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.log("Using fallback emergency contact list.");
  }
  
  return {
    contacts: [
      { country: "United States & Canada", name: "988 Suicide & Crisis Lifeline", number: "988", type: "Call or Text 24/7", website: "https://988lifeline.org" },
      { country: "India", name: "Tele-MANAS (Govt of India)", number: "14416", type: "Toll-free 24/7 Helpline", website: "https://telemanas.mohfw.gov.in" },
      { country: "India", name: "Vandrevala Foundation", number: "+91 9999 666 555", type: "Call 24/7", website: "https://www.vandrevalafoundation.com" },
      { country: "United Kingdom", name: "Samaritans & NHS 111", number: "116 123", type: "Free 24/7 Call", website: "https://www.samaritans.org" },
      { country: "Australia", name: "Lifeline Australia", number: "13 11 14", type: "Call or Text 24/7", website: "https://www.lifeline.org.au" },
      { country: "International", name: "Befrienders Worldwide", number: "Online Directory", type: "Global Crisis Centers", website: "https://www.befrienders.org" }
    ],
    general_advice: "If you or someone you know is in immediate danger, please call your local emergency services immediately."
  };
}

export function getKnowledgeBase() {
  return LOCAL_KNOWLEDGE_BASE;
}
