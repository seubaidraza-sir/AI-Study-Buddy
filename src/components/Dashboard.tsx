import React, { useState } from 'react';
import { Sparkles, Award, Flame, Brain, Clock, ChevronRight, Calculator, Atom, FlaskConical, Dna, Cpu, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { UserProfile, Note, PrebuiltSubject } from '../types';
import { prebuiltSubjects } from './PrebuiltSubjects';

interface DashboardProps {
  profile: UserProfile;
  notes: Note[];

  stats?: {
    notes: number;
    chats: number;
    flashcards: number;
    planner: number;
  };

  onAddXp: (amount: number) => void | Promise<void>;

  onSetView: (
    view:
      | "profile"
      | "chat"
      | "summarize"
      | "quiz"
      | "flashcard"
      | "ocr"
      | "planner"
      | "voice"
      | "notes"
      | "history"
      | "subject_browser"
  ) => void;

  onSelectSubject: (subject: PrebuiltSubject) => void;
}

export default function Dashboard({
  profile,
  notes,
  stats,
  onAddXp,
  onSetView,
  onSelectSubject
}: DashboardProps)
 {console.log("Dashboard props:", {
  profile,
  notes,
  stats,
});
  const [goals, setGoals] = useState([
    { id: 'g1', text: 'Ask AI Tutor 1 physics question', done: false, points: 20 },
    { id: 'g2', text: 'Generate an AI Note Summary', done: false, points: 30 },
    { id: 'g3', text: 'Take a Mathematics quiz', done: false, points: 40 }
  ]);

  const toggleGoal = (id: string, currentlyDone: boolean, points: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, done: !g.done };
      }
      return g;
    }));
    
    if (!currentlyDone) {
      onAddXp(points);
    } else {
      onAddXp(-points);
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning ☀️';
    if (hr < 18) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  // Helper mapping string to Lucide React Icon
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="h-5 w-5" />;
      case 'Atom': return <Atom className="h-5 w-5" />;
      case 'FlaskConical': return <FlaskConical className="h-5 w-5" />;
      case 'Dna': return <Dna className="h-5 w-5" />;
      case 'Cpu': return <Cpu className="h-5 w-5" />;
      case 'BookOpen': return <BookOpen className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans overflow-y-auto pb-6">
      {/* Dynamic Profile Welcome Greeting */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => onSetView('profile')}
            className="text-2xl p-2 bg-purple-50 dark:bg-purple-950/20 rounded-full hover:scale-105 active:scale-95 transition"
          >
            {profile.avatar}
          </button>
          <div>
            <h2 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{getGreeting()}</h2>
            <h1 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-display">
              Hey, {profile.name}!
            </h1>
            <p className="text-xs text-slate-500 font-semibold mb-2">
  POWERED BY
</p>
            <div className="flex flex-wrap gap-2 mt-2">

  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
    📱 AI Study Buddy v5
  </span>

  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
    🔥 Firebase
  </span>

  <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
    🤖 Gemini AI
  </span>

</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active streak tag */}
          <div className="flex items-center space-x-1 py-1 px-2 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-[10px] animate-pulse">
            <Flame className="h-3.5 w-3.5 fill-current" />
            <span>{profile.streak} Day</span>
          </div>

          <button 
            onClick={() => onSetView('profile')}
            className="flex items-center space-x-1 py-1 px-2.5 rounded-full bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border border-purple-200 text-[10px] font-bold"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Lv {profile.level}</span>
          </button>
        </div>
      </div>

      {/* Main bento scroll workspace */}
      <div className="p-4 space-y-4">
        {/* Today's Goals checklist card */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Today's Study Checklist</span>
          </h3>

          <div className="space-y-2">
            {goals.map(g => (
              <div 
                key={g.id}
                onClick={() => toggleGoal(g.id, g.done, g.points)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                  g.done
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/5 border-emerald-200 dark:border-emerald-900/10 text-slate-400 line-through'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 text-[11px] leading-tight font-medium">
                  {g.done ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 flex-shrink-0" />
                  )}
                  <span>{g.text}</span>
                </div>
                {!g.done && <span className="text-[8px] font-bold bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">+{g.points} XP</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Live Analytics */}
<div className="space-y-2">
  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
   📊 LIVE ANALYTICS
  </h3>

  <div className="grid grid-cols-2 gap-2">

    <div className="bg-white dark:bg-slate-900 rounded-xl border p-3 shadow-sm">
      <div className="text-xs text-slate-500">📝 Notes</div>
      <div className="text-2xl font-bold text-purple-600">
        {stats?.notes ?? 0}
      </div>
    </div>

    <div className="bg-white dark:bg-slate-900 rounded-xl border p-3 shadow-sm">
      <div className="text-xs text-slate-500">💬 AI Chats</div>
      <div className="text-2xl font-bold text-blue-600">
        {stats?.chats ?? 0}
      </div>
    </div>

    <div className="bg-white dark:bg-slate-900 rounded-xl border p-3 shadow-sm">
      <div className="text-xs text-slate-500">🧠 Flashcards</div>
      <div className="text-2xl font-bold text-green-600">
{stats?.flashcards ?? 0}
      </div>
    </div>

    <div className="bg-white dark:bg-slate-900 rounded-xl border p-3 shadow-sm">
      <div className="text-xs text-slate-500">📅 Study Plans</div>
      <div className="text-2xl font-bold text-orange-600">
        {stats?.planner ?? 0}
      </div>
    </div>

  </div>
</div>

        {/* Quick Launchers Bento Grid */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🚀 AI STUDY TOOLS</h3>
          <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
            
            {/* AI Tutor */}
            <button
              onClick={() => onSetView('chat')}
              className="p-3 bg-purple-600 text-white rounded-xl text-left space-y-2.5 shadow-md shadow-purple-500/10 hover:scale-[1.01] active:scale-[0.99] transition"
            >
              <div className="p-1.5 bg-white/20 rounded-lg inline-block text-white">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-xs">AI Chat Tutor</strong>
                <span className="text-[9px] text-purple-200 font-normal leading-tight block">Interactive explanations</span>
              </div>
            </button>

            {/* Note summarizer */}
            <button
              onClick={() => onSetView('summarize')}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-100 rounded-xl text-left space-y-2.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition"
            >
              <div className="p-1.5 bg-violet-50 dark:bg-violet-950/20 rounded-lg inline-block text-violet-600 dark:text-violet-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-xs">AI Summarizer</strong>
                <span className="text-[9px] text-slate-400 font-normal leading-tight block">Notes into flash sheets</span>
              </div>
            </button>

            {/* Quiz Generator */}
            <button
              onClick={() => onSetView('quiz')}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-100 rounded-xl text-left space-y-2.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition"
            >
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg inline-block text-emerald-600 dark:text-emerald-400">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-xs">Quiz Generator</strong>
                <span className="text-[9px] text-slate-400 font-normal leading-tight block">Generate instant exams</span>
              </div>
            </button>

            {/* Flashcards */}
            <button
              onClick={() => onSetView('flashcard')}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-100 rounded-xl text-left space-y-2.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition"
            >
              <div className="p-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg inline-block text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-xs">Flashcards Deck</strong>
                <span className="text-[9px] text-slate-400 font-normal leading-tight block">Spaced repetition memory</span>
              </div>
            </button>

            {/* OCR Note scanner */}
            <button
              onClick={() => onSetView('ocr')}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-100 rounded-xl text-left space-y-2.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition"
            >
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg inline-block text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-xs">OCR Note Scanner</strong>
                <span className="text-[9px] text-slate-400 font-normal leading-tight block">Scan books with camera</span>
              </div>
            </button>

            {/* Study Planner */}
            <button
              onClick={() => onSetView('planner')}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-100 rounded-xl text-left space-y-2.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition"
            >
              <div className="p-1.5 bg-rose-50 dark:bg-rose-950/20 rounded-lg inline-block text-rose-600 dark:text-rose-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-xs">AI Study Planner</strong>
                <span className="text-[9px] text-slate-400 font-normal leading-tight block">Weekly schedule creator</span>
              </div>
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="space-y-2 pt-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Syllabus Subjects</span>
            <button onClick={() => onSetView('notes')} className="text-purple-600 dark:text-purple-400 hover:underline">View Notes</button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {prebuiltSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelectSubject(subject)}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl text-center space-y-2 shadow-sm hover:border-purple-300 transition"
              >
                <div className={`p-2 rounded-lg inline-block text-white bg-gradient-to-tr ${subject.color}`}>
                  {getSubjectIcon(subject.icon)}
                </div>
                <span className="block truncate text-[10px] leading-tight font-bold">{subject.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent notes shortcuts */}
        {notes.length > 0 && (
          <div className="space-y-2 pt-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Saved Notes ({notes.length})</span>
              <button onClick={() => onSetView('notes')} className="text-purple-600 hover:underline">See All</button>
            </div>

            <div className="flex space-x-2.5 overflow-x-auto pb-1 text-xs">
              {notes.slice(0, 3).map((note) => (
                <div 
                  key={note.id} 
                  onClick={() => onSetView('notes')}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm min-w-[140px] max-w-[140px] flex-shrink-0 cursor-pointer space-y-2 hover:border-purple-400 transition"
                >
                  <span className="text-[7px] uppercase font-bold text-purple-600 dark:text-purple-400 px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-950/20">
                    {note.category}
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">{note.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Recent AI Chats */}
<div className="space-y-2 pt-3">
  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
    <span>Recent AI Chats</span>
    <button
      onClick={() => onSetView('chat')}
      className="text-purple-600 hover:underline"
    >
      Open Tutor
    </button>
  </div>

  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
    <p className="text-[11px] text-slate-500">
      Your previous AI conversations are saved automatically in Firebase.
    </p>

    <div className="mt-2">
      <button
        onClick={() => {
  console.log("Opening History");
  onSetView("history");
}}
      >
        Continue Learning →
      </button>
    </div>
  </div>
</div>
      </div>
      <div className="mt-6 text-center text-xs text-slate-400">
  AI Study Buddy • Version 5.0 • Made by Ubaid
</div>

    </div>
  );
}
