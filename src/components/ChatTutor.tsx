import React, { useState, useEffect, useRef } from 'react';
import { Send, Copy, Check, Share2, Bookmark, Sparkles, AlertCircle, Trash2, ArrowLeft, Mic, MicOff } from 'lucide-react';
import { UserProfile } from '../types';
import { auth, db } from '../lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
 role:'user'|'model';
 text:string;
 bookmarked?:boolean;
 id?:string;
}

interface ChatTutorProps {
  profile: UserProfile;
  initialSubject?: string;
  initialTopic?: string;
  savedChat?: {
    question: string;
    answer: string;
    subject: string;
    difficulty: string;
  } | null;
  onAddXp: (xp: number) => void;
  onGoBack: () => void;
}
export default function ChatTutor({
  profile,
  initialSubject,
  initialTopic,
  savedChat,
  onAddXp,
  onGoBack
}: ChatTutorProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
  if (savedChat) {
    return [
      {
        role: 'user',
        text: savedChat.question
      },
      {
        role: 'model',
        text: savedChat.answer
      }
    ];
  }

  return [
    {
      role: 'model',
      text: `Hello ${profile.name}! 👋 I am your AI Chat Tutor. How can I assist you with your studies today?\n\nChoose a subject and difficulty below, or ask me any question directly. I specialize in breaking down complex concepts step-by-step!`
    }
  ];
});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(initialSubject || 'Mathematics');
  const [difficulty, setDifficulty] = useState('Medium');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  if (savedChat) {
    setMessages([
      {
        role: "user",
        text: savedChat.question,
      },
      {
        role: "model",
        text: savedChat.answer,
      },
    ]);

    setSubject(savedChat.subject);
    setDifficulty(savedChat.difficulty);
  }
}, [savedChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

 useEffect(() => {
  if (initialTopic && !savedChat && messages.length === 1) {
    handleSend(initialTopic);
  }
}, [initialTopic, savedChat]);
useEffect(() => {
  if (savedChat) {
    setMessages([
      {
        role: "user",
        text: savedChat.question,
      },
      {
        role: "model",
        text: savedChat.answer,
      },
    ]);

    setSubject(savedChat.subject);
    setDifficulty(savedChat.difficulty);
  }
}, [savedChat]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError('');
    const newMessages: Message[] = [
  ...messages,
  {
    role: "user",
    text: textToSend,
  },
];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: newMessages.slice(1, -1), // skip first model message and current message
          difficulty,
          subject
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {

  onAddXp(15);

  // Save chat to Firestore
  // Save chat to Firestore (don't stop the chat if saving fails)
if (auth.currentUser) {
  try {

    const chatRef = await addDoc(
      collection(
        db,
        "users",
        auth.currentUser.uid,
        "chatHistory"
      ),
      {
        question: textToSend,
        answer: data.text,
        subject,
        difficulty,
        bookmarked: false,
        createdAt: serverTimestamp()
      }
    );
 const aiMessage: Message = {
      role: "model",
      text: data.text,
      id: chatRef.id,
      bookmarked: false
    };


    setMessages(prev => [
      ...prev,
      aiMessage
    ]);


    
  } catch (firestoreError) {
    console.error("Failed to save chat:", firestoreError);
  }
}
} else {
        throw new Error(data.error || 'Failed to generate response.');
      }
    } catch (err: any) {
      console.error("Firestore Error:", err);
alert(JSON.stringify(err));
      setError(err?.message || 'Server connection error. Please make sure the server is fully running and the Gemini API is configured.');
      // Fallback response for instant preview
      setMessages(prev => [...prev, {
        role: 'model',
        text: `*Offline Mode Helper:*\n\nI encountered a connection issue, but here is a quick study guide for your query:\n\n**${subject} [${difficulty}] Guide:**\n1. Check your study notes for key definitions related to "${textToSend}".\n2. Make sure you understand the underlying axioms or core theorems.\n3. Try generating a study quiz or flashcards in the menu to test yourself!\n\n*(Check your GEMINI_API_KEY setting in the Secrets tab to unlock fully detailed live AI tutoring!)*`
      }]);
    } finally {
      setLoading(false);
    }
  };

const toggleBookmark = async (index: number) => {

  const message = messages[index];

  setMessages(prev =>
    prev.map((msg, i) =>
      i === index
        ? { ...msg, bookmarked: !msg.bookmarked }
        : msg
    )
  );

  if (auth.currentUser && message.id) {

    await updateDoc(
      doc(
        db,
        "users",
        auth.currentUser.uid,
        "chatHistory",
        message.id
      ),
      {
        bookmarked: !message.bookmarked
      }
    );

  }

};
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Study Buddy Explanation',
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Explanation copied to clipboard for sharing!');
    }
  };

 const startSpeechRecognition = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition is not supported.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  console.log("🎤 Starting recognition...");

  setIsRecording(true);

  recognition.start();

  recognition.onstart = () => {
    console.log("✅ Recognition started");
  };

  recognition.onresult = (event: any) => {
    console.log("✅ Result:", event);

    const transcript = event.results[0][0].transcript;

    console.log("📝 Transcript:", transcript);

    setInput(transcript);

    setIsRecording(false);
  };

  recognition.onerror = (event: any) => {
    console.error("❌ Speech Error:", event.error);
    setIsRecording(false);
  };

  recognition.onend = () => {
    console.log("🛑 Recognition ended");
    setIsRecording(false);
  };
};

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <button onClick={onGoBack} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-600 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-xs font-bold font-display text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            AI Chat Tutor
          </h2>
          <p className="text-[9px] text-slate-400">Ask homework questions instantly</p>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-rose-500 transition" title="Clear chat history">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Tutor Params */}
      <div className="p-2.5 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-[10px]">
        <div className="space-y-1">
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[8px]">Subject Focus</span>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option>General Academics</option>
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Biology</option>
            <option>Computer Science</option>
            <option>English Literature</option>
          </select>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[8px]">Academic Difficulty</span>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option>School Tier</option>
            <option>College Tier</option>
            <option>University Tier</option>
            <option>Competitive Exams</option>
          </select>
        </div>
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-start space-x-1.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed transition ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-none'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800 rounded-bl-none'
            }`}>
              {/* Message text content */}
              <div className="whitespace-pre-line select-text font-sans">
                {msg.text}
              </div>

              {/* Message Toolbar */}
              {msg.role === 'model' && (
                <div className="flex items-center justify-end space-x-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <button onClick={() => toggleBookmark(index)} className={`hover:text-amber-500 transition ${msg.bookmarked ? 'text-amber-500' : ''}`}>
                    <Bookmark className="h-3 w-3 fill-current" />
                  </button>
                  <button onClick={() => handleShare(msg.text)} className="hover:text-blue-500 transition">
                    <Share2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleCopy(msg.text, index)} className="hover:text-emerald-500 transition">
                    {copiedIndex === index ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 rounded-bl-none max-w-[80%] flex items-center space-x-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-500 animate-spin" />
              <span className="text-[10px] text-slate-400 font-medium">Tutor thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input panel */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1">
          <button 
            type="button"
onClick={startSpeechRecognition}
            className={`p-1.5 rounded-full transition ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}
            title="Simulate Voice Input"
          >
            {isRecording ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={isRecording ? 'Listening...' : "Ask your academic question..."}
            disabled={isRecording}
            className="flex-1 bg-transparent text-xs py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400"
          />

          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
