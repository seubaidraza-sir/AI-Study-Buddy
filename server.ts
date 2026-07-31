import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = 3000;
const MODEL = "gemini-2.5-flash-lite";
// Increase request body size limits for image uploads (OCR note scanner)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Gemini API Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");

if (apiKey) {
 ai = new GoogleGenAI({
  apiKey: apiKey,
});
  console.log('Gemini API initialized successfully.');
} else {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not set. App will use smart mock fallbacks.');
}

// Ensure AI Client is active, otherwise return a clear helper or throw
function getAIClient(): GoogleGenAI {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in the Secrets panel.');
  }
  return ai;
}

// API Route: Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    time: new Date().toISOString()
  });
});

// Helper for sending error responses safely
const handleError = (res: Response, error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  res.status(500).json({
    error: error?.message || 'An unknown error occurred on the server.',
    context,
    fallback: true
  });
};

// 1. AI CHAT TUTOR ENDPOINT
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, difficulty, subject } = req.body;
    const client = getAIClient();

    const systemInstruction = `You are "AI Study Buddy", an expert, friendly, and encouraging AI Academic Tutor.
Your target audience ranges from school students to competitive exam candidates.
The current subject being focused on is: ${subject || 'General Academics'}.
The academic difficulty level specified is: ${difficulty || 'Medium'} (adjust complexity, technical depth, and tone accordingly).

Provide step-by-step, highly clear, and digestible explanations. 
Where applicable, use clean markdown styling, bullet points, numbered steps, bold highlights, and code blocks for readability.
If the student asks a question unrelated to education, studies, exams, or career advice, gently steer them back to academic topics with an encouraging prompt.
Do not share any developer internals. Make your response helpful and highly motivating.`;

    // Map history to standard contents structure if provided
    const chatHistory = history ? history.map((item: any) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    })) : [];
console.log("🚀 Sending request to Gemini...");
    const response = await client.models.generateContent({
      
      model: "gemini-3.6-flash",
      contents: [...chatHistory, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    console.log("✅ Gemini responded!");
console.log(response.text);
    console.log(response.text);

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("FULL ERROR:");
console.dir(error, { depth: null });

handleError(res, error, "AI Chat Tutor");
  }
});

// 2. AI NOTE SUMMARIZER ENDPOINT
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  try {
    const { content, focus, documentType } = req.body;
    const client = getAIClient();

    const prompt = `Please summarize the following student study material. 
Focus area requested: ${focus || 'General Overview'}.
Document type description: ${documentType || 'Lecture Notes'}.

Study Material Content:
---
${content}
---

Extract structural components precisely according to the JSON schema. Ensure important terms, mathematical definitions, or scientific principles are defined separately. Providing actionable tips for examinations is a core requirement.`;

   const response = await client.models.generateContent({
  model: "gemini-3.6-flash",
  contents: prompt,
  config: {
    systemInstruction:
      "You are an elite educational editor. Summarize study documents into structured bullet points, definitions, and exam cheat-sheets.",
    responseMimeType: "application/json",
    responseSchema: {
      // keep your existing schema
    },
  },
});


    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    handleError(res, error, 'AI Note Summarizer');
  }
});

// 3. AI QUIZ GENERATOR ENDPOINT
app.post('/api/gemini/quiz', async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty, questionCount, types } = req.body;
    const client = getAIClient();

    const prompt = `Generate a beautiful, customized academic test/quiz based on the parameters:
Subject: ${subject}
Topic/Content: ${topic}
Difficulty: ${difficulty || 'Medium'}
Question Count: ${questionCount || 5}
Allowed formats: ${types && types.length > 0 ? types.join(', ') : 'Multiple Choice (mcq), True/False (true_false), Fill in the blanks (fill_blank)'}

Follow the schema output strictly. Ensure each question has clear answers, reasonable distractor options for MCQs, and highly educational, student-friendly step-by-step explanations for why the answer is correct.`;

    const response = await client.models.generateContent({
     model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert curriculum and exam developer. Produce precise academic questions with accurate keys and thorough explanatory feedback.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['questions'],
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['id', 'type', 'question', 'options', 'correctAnswer', 'explanation'],
                properties: {
                  id: { type: Type.STRING, description: 'A unique short id e.g. "q1", "q2".' },
                  type: { 
                    type: Type.STRING, 
                    description: 'One of: "mcq", "true_false", "fill_blank", "short_answer".' 
                  },
                  question: { type: Type.STRING, description: 'The actual question text.' },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: 'An array of 4 options for MCQ, 2 options (["True", "False"]) for True/False, or empty for others.'
                  },
                  correctAnswer: { 
                    type: Type.STRING, 
                    description: 'The exact string representation of the correct answer (e.g. "A", "True", "3.14").' 
                  },
                  explanation: { type: Type.STRING, description: 'Educative detailed feedback explaining the concepts behind the solution.' }
                }
              }
            }
          }
        }
      }
    });

    res.json(JSON.parse(response.text || '{"questions":[]}'));
  } catch (error: any) {
    handleError(res, error, 'AI Quiz Generator');
  }
});

// 4. FLASHCARDS GENERATOR ENDPOINT
app.post('/api/gemini/flashcards', async (req: Request, res: Response) => {
  try {
    const { subject, topic, quantity } = req.body;
    const client = getAIClient();

    const prompt = `Generate a set of educational flashcards to memorize.
Subject: ${subject || 'General'}
Topic: ${topic || 'Key Facts'}
Quantity requested: ${quantity || 8}

Formulate bite-sized Questions (front of the card) and clear, concise Answers (back of the card) optimized for spaced repetition learning. Make them engaging and quick to review.`;

    const response = await client.models.generateContent({
     model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert at designing spaced repetition flashcards for rapid student retention.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['flashcards'],
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['front', 'back'],
                properties: {
                  front: { type: Type.STRING, description: 'The question, prompt, or term to remember.' },
                  back: { type: Type.STRING, description: 'The brief, high-impact answer, definition, or explanation.' }
                }
              }
            }
          }
        }
      }
    });

    res.json(JSON.parse(response.text || '{"flashcards":[]}'));
  } catch (error: any) {
    handleError(res, error, 'Flashcard Generator');
  }
});

// 5. AI STUDY PLANNER ENDPOINT
app.post('/api/gemini/planner', async (req: Request, res: Response) => {
  try {
    const { subjects, dailyHours, examCountdownDays, learningStyle, mainGoals } = req.body;
    const client = getAIClient();

    const prompt = `Create a hyper-personalized, realistic study schedule for a student based on:
- Focused Subjects: ${subjects ? subjects.join(', ') : 'Mathematics, Science'}
- Daily Study Budget: ${dailyHours || 2} hours/day
- Exam Countdown: ${examCountdownDays || 30} days remaining
- Preferred Learning Style: ${learningStyle || 'Visual & Practical'}
- Prime Goals: ${mainGoals || 'Pass final exams with high marks'}

Construct a detailed weekly rhythm with daily study tasks, recommended activities, and expert exam planning advice.`;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: 'You are a highly efficient academic mentor and study scheduler.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['schedule', 'weeklyTips'],
          properties: {
            schedule: {
              type: Type.ARRAY,
              description: 'A 7-day study program schedule.',
              items: {
                type: Type.OBJECT,
                required: ['day', 'topics'],
                properties: {
                  day: { type: Type.STRING, description: 'Day of the week, e.g. "Monday", "Tuesday".' },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ['time', 'subject', 'activity', 'duration'],
                      properties: {
                        time: { type: Type.STRING, description: 'Time block or phase (e.g. "Morning Session", "04:00 PM").' },
                        subject: { type: Type.STRING, description: 'The subject to review.' },
                        activity: { type: Type.STRING, description: 'The recommended task e.g. "Solve practice trigonometry sheet" or "Read cell biology summary".' },
                        duration: { type: Type.STRING, description: 'Duration of session e.g. "45 mins" or "1 hour".' }
                      }
                    }
                  }
                }
              }
            },
            weeklyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific recommendations regarding hydration, sleep rhythms, Pomodoro cycles, and mental health.'
            }
          }
        }
      }
    });

    res.json(JSON.parse(response.text || '{"schedule":[],"weeklyTips":[]}'));
  } catch (error: any) {
    handleError(res, error, 'AI Study Planner');
  }
});

// 6. OCR SCANNER / IMAGE RECOGNITION ENDPOINT (MULTIMODAL)
app.post('/api/gemini/ocr', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const client = getAIClient();

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image base64 data provided.' });
    }

    const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanedBase64
      }
    };

    const textPart = {
      text: `Identify and transcribe all readable printed or handwritten educational notes, textbook text, diagrams, math equations, or study material in this image.
Do not lose any formatting of headers, paragraphs, or lists.
Output both the full extracted raw transcription text and structural insights in the schema.`
    };

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: 'You are an advanced handwriting and book text OCR scanner built to extract neat, editable markdown study notes from camera captures.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['text', 'title', 'confidence', 'extractedTopics'],
          properties: {
            text: { 
              type: Type.STRING, 
              description: 'The complete, raw transcription of everything visible in the book or handwriting, styled nicely with markdown if appropriate.' 
            },
            title: { 
              type: Type.STRING, 
              description: 'A suitable short title representing the subject matter of the note.' 
            },
            confidence: { 
              type: Type.STRING, 
              description: 'Estimate of the scan result completeness: e.g. "High", "Medium", "Partially blurry".' 
            },
            extractedTopics: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Key academic topics identified in this text (e.g. ["Thermodynamics", "Derivative Rules"]).' 
            }
          }
        }
      }
    });

    res.json(JSON.parse(response.text || '{"text":"","title":"","confidence":"Low","extractedTopics":[]}'));
  } catch (error: any) {
    handleError(res, error, 'OCR Note Scanner');
  }
});

// Integrating Vite for Development or Static Files for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA catch-all routing
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production build static assets from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Study Buddy server running on http://localhost:${PORT}`);
  });
}
// 7. OCR AI STUDY ANALYZER

console.log("✅ STUDY ROUTE REGISTERED");

app.post('/api/gemini/study', async (req: Request, res: Response) => {
  console.log("📚 STUDY ENDPOINT HIT");

  try {
    const { text } = req.body;

    const client = getAIClient();
    try {
  const models = await client.models.list();
  console.log("AVAILABLE MODELS:");
  console.log(models);
} catch (e) {
  console.error("Cannot list models:", e);
}

    const response = await client.models.generateContent({
     model: "gemini-3.6-flash",
      contents: `
You are an expert teacher.

Analyze the following study notes and return ONLY valid JSON.

Study Notes:
${text}

Rules:
- explanation must be a clear paragraph.
- summary must contain 5 concise bullet points.
- flashcards must contain exactly 5 objects.
- Each flashcard must have:
    question
    answer
- quiz must contain exactly 5 questions.
- Every quiz question must have:
    question
    options (4 options)
    answer

Return ONLY this JSON:

{
  "explanation":"...",
  "summary":[
    "...",
    "...",
    "...",
    "...",
    "..."
  ],
  "flashcards":[
    {
      "question":"...",
      "answer":"..."
    }
  ],
  "quiz":[
    {
      "question":"...",
      "options":["A","B","C","D"],
      "answer":"..."
    }
  ]
}
`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const raw = response.text || "{}";

console.log("========== GEMINI RAW ==========");
console.log(raw);
console.log("================================");

const jsonText =
  raw.match(/\{[\s\S]*\}/)?.[0] || "{}";

res.json(JSON.parse(jsonText));
  } catch (error: any) {
    handleError(res, error, "Study AI");
  }
});


startServer();
