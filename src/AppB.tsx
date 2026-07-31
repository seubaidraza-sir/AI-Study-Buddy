import React, { useState, useEffect } from 'react';
import { Home, FileText, MessageSquare, User, Code2, Sparkles, Wifi, Battery } from 'lucide-react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { logout } from "./lib/auth";
import { getUserProfile, updateUserProfile } from "./lib/firestore";
import { UserProfile, Note, PrebuiltSubject } from './types';

// Importing Custom Views

import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ChatTutor from './components/ChatTutor';
import Summarizer from './components/Summarizer';
import QuizGenerator from './components/QuizGenerator';
import FlashcardSet from './components/FlashcardSet';
import OCRScanner from './components/OCRScanner';
import Planner from './components/Planner';
import VoiceMode from './components/VoiceMode';
import NotesManager from './components/NotesManager';
import Profile from './components/Profile';
import SubjectBrowser from './components/SubjectBrowser';
import FlutterExporter from './components/FlutterExporter';

export default function App() {
  const [view, setView] = useState<'onboarding' | 'auth' | 'dashboard' | 'chat' | 'summarize' | 'quiz' | 'flashcard' | 'ocr' | 'planner' | 'voice' | 'notes' | 'profile' | 'subject_browser'>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  // Navigation Carry-Over States
  const [activeSubject, setActiveSubject] = useState<PrebuiltSubject | null>(null);
  const [carryTopic, setCarryTopic] = useState<string>('');
  const [carryText, setCarryText] = useState<string>('');

  // Mobile Code Overlay Toggle
  const [showCodeOverlay, setShowCodeOverlay] = useState(false);

  // UTC Live Clock State for status bar
  const [timeStr, setTimeStr] = useState('12:00');

  useEffect(() => {
    // 1. Setup Status Bar clock
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    // 2. Load / Seed Profile
   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  if (user) {
    const data = await getUserProfile(user.uid);

    if (data) {
      setProfile({
        ...(data as UserProfile),
        language: "en",
      });
    }

    setView("dashboard");
  } else {
    setProfile(null);
    setView("onboarding");
  }

  setLoading(false);
});

    // 3. Load / Seed Notes
    const savedNotes = localStorage.getItem('studybuddy_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed robust academic notes for voice mode, searches, summaries
      const defaultNotes: Note[] = [
        {
          id: 'n1',
          title: 'Newton\'s Second Law',
          content: 'Newton\'s Second Law of Motion states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.\n\nMathematical expression:\nF = m * a\n\nWhere:\n- F is the net force acting on the object (measured in Newtons, N)\n- m is the mass of the object (measured in kilograms, kg)\n- a is the resulting acceleration (measured in meters per second squared, m/s²)\n\nPractical application: Designing seatbelts and airbags in vehicles to prolong impact time and lower structural deceleration forces.',
          category: 'Physics',
          date: new Date().toLocaleDateString(),
          isFavorite: true
        },
        {
          id: 'n2',
          title: 'Photosynthesis Cycle Outline',
          content: 'Photosynthesis is the chemical process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water.\n\nEquation:\n6CO2 + 6H2O + light energy -> C6H12O6 + 6O2\n\nKey phases:\n1. Light-dependent reactions (takes place in thylakoids; generates ATP and NADPH).\n2. Light-independent reactions / Calvin Cycle (takes place in stroma; fixes CO2 into sugar molecules).',
          category: 'Biology',
          date: new Date().toLocaleDateString(),
          isFavorite: false
        },
        {
          id: 'n3',
          title: 'Quadratic Formula Derivation',
          content: 'The quadratic formula is a formula that provides the solution to a quadratic equation of the form ax² + bx + c = 0.\n\nFormula:\nx = (-b ± √(b² - 4ac)) / (2a)\n\nTo derive it, we start by dividing the entire equation by "a" and then completing the square for the x terms. The term b² - 4ac is called the discriminant (D).',
          category: 'Mathematics',
          date: new Date().toLocaleDateString(),
          isFavorite: true
        }
      ];
      setNotes(defaultNotes);
      localStorage.setItem('studybuddy_notes', JSON.stringify(defaultNotes));
    }

    return () => {
  clearInterval(interval);
  unsubscribe();
};
  }, []);

  // Update localStorage helper
  const handleUpdateProfile = (newProfile: UserProfile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      localStorage.setItem('studybuddy_profile', JSON.stringify(newProfile));
    } else {
      localStorage.removeItem('studybuddy_profile');
    }
  };

  const handleAddXp = async (amount: number) => {
  if (!profile || !auth.currentUser) return;

  const currentXp = Math.max(0, profile.xp + amount);

  const calculatedLevel = Math.max(1, Math.floor(currentXp / 500) + 1);

  const updated = {
    ...profile,
    xp: currentXp,
    level: calculatedLevel,
    studyMinutes:
      profile.studyMinutes + (amount > 0 ? Math.ceil(amount / 5) : 0),
  };

  handleUpdateProfile(updated);

  await updateUserProfile(auth.currentUser.uid, {
    xp: updated.xp,
    level: updated.level,
    studyMinutes: updated.studyMinutes,
  });
};

  const handleSaveNote = (draft: Omit<Note, 'id' | 'date'>) => {
    const newNote: Note = {
      ...draft,
      id: Math.random().toString(),
      date: new Date().toLocaleDateString()
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('studybuddy_notes', JSON.stringify(updatedNotes));
    handleAddXp(25); // Award note taking XP
  };

  const handleEditNote = (updatedNote: Note) => {
    const updated = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    setNotes(updated);
    localStorage.setItem('studybuddy_notes', JSON.stringify(updated));
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('studybuddy_notes', JSON.stringify(updated));
  };

  // Nav actions
  const handleSelectSubject = (subj: PrebuiltSubject) => {
    setActiveSubject(subj);
    setView('subject_browser');
  };

  const handleQuickAction = (actionType: 'chat' | 'quiz' | 'flashcard', topicName: string) => {
    setCarryTopic(topicName);
    setView(actionType);
  };

  const handleTriggerSummarize = (text: string) => {
    setCarryText(text);
    setView('summarize');
  };

  const handleLogout = async () => {
  try {
    await logout();
    handleUpdateProfile(null);
    setView("auth");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans antialiased overflow-hidden selection:bg-purple-600/30">
      {/* LEFT HALF: Virtual Mobile Device Frame Wrapper */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-slate-950 relative border-b md:border-b-0 md:border-r border-slate-900 overflow-y-auto">
        
        {/* Decorative ambient background glows */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        {/* Top Header Label for responsive view */}
        <div className="text-center mb-4 z-10 max-w-sm">
          <h1 className="text-sm font-bold tracking-wide uppercase text-slate-400 font-display flex items-center justify-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Interactive Android Simulator</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
            Click widgets inside the smartphone frame to test the AI applet. Review Flutter exports in the right panel!
          </p>
        </div>

        {/* Smartphone Shell Mockup */}
        <div className="relative w-full max-w-[360px] h-[640px] rounded-[36px] border-4 border-slate-800 bg-slate-950 shadow-2xl flex flex-col overflow-hidden z-10 ring-1 ring-slate-800/50">
          
          {/* Bezel Camera Punch Hole / Speaker slit */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-3.5 w-16 rounded-full bg-slate-800 flex items-center justify-center z-30">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-900/80 ml-2" />
          </div>

          {/* Android Status Bar Container */}
          <div className="bg-white dark:bg-slate-950 px-5 pt-3 pb-1.5 flex justify-between items-center text-[9px] font-mono font-bold tracking-wider text-slate-500 z-20 select-none">
            <span>{timeStr} UTCai study buddy</span>
            <div className="flex items-center space-x-1">
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
              <span>98%</span>
            </div>
          </div>

          {/* Virtual App Screens Router */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
            {view === 'onboarding' && (
  <Auth
    onSuccess={(newProfile) => {
      handleUpdateProfile(newProfile);
      setView('dashboard');
    }}
  />
)}

            {view === 'auth' && (
              <Auth 
                onSuccess={(newProfile) => {
                  handleUpdateProfile(newProfile);
                  setView('dashboard');
                }} 
              />
            )}

            {profile && (
              <>
                {view === 'dashboard' && (
                  <Dashboard
                    profile={profile}
                    notes={notes}
                    onAddXp={handleAddXp}
                    onSetView={(v) => {
                      setCarryTopic(''); // clear shortcut topic
                      setView(v);
                    }}
                    onSelectSubject={handleSelectSubject}
                  />
                )}

                {view === 'chat' && (
                  <ChatTutor
                    profile={profile}
                    initialSubject={activeSubject?.name}
                    initialTopic={carryTopic}
                    onAddXp={handleAddXp}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'summarize' && (
                  <Summarizer
                    profile={profile}
                    onAddXp={handleAddXp}
                    onSaveNote={handleSaveNote}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'quiz' && (
                  <QuizGenerator
                    profile={profile}
                    onAddXp={handleAddXp}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'flashcard' && (
                  <FlashcardSet
                    profile={profile}
                    onAddXp={handleAddXp}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'ocr' && (
                  <OCRScanner
                    profile={profile}
                    onAddXp={handleAddXp}
                    onSaveNote={handleSaveNote}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'planner' && (
                  <Planner
                    profile={profile}
                    onAddXp={handleAddXp}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'voice' && (
                  <VoiceMode
                    profile={profile}
                    notes={notes}
                    onAddXp={handleAddXp}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'notes' && (
                  <NotesManager
                    profile={profile}
                    notes={notes}
                    onAddNote={handleSaveNote}
                    onEditNote={handleEditNote}
                    onDeleteNote={handleDeleteNote}
                    onTriggerSummarize={handleTriggerSummarize}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'profile' && (
                  <Profile
                    profile={profile}
                    onUpdateProfile={handleUpdateProfile}
                    onLogout={handleLogout}
                    onGoBack={() => setView('dashboard')}
                  />
                )}

                {view === 'subject_browser' && activeSubject && (
                  <SubjectBrowser
                    subject={activeSubject}
                    onGoBack={() => setView('dashboard')}
                    onQuickAction={handleQuickAction}
                  />
                )}
              </>
            )}
          </div>

          {/* Native-looking Android Navigation Bar (Tabs) */}
          {profile && view !== 'onboarding' && view !== 'auth' && (
            <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-1.5 px-4 flex justify-between items-center z-20 text-[9px] font-medium text-slate-400 select-none">
              
              {/* Home / Dashboard trigger */}
              <button 
                onClick={() => setView('dashboard')}
                className={`flex flex-col items-center ${view === 'dashboard' ? 'text-purple-600' : 'hover:text-slate-600'}`}
              >
                <Home className="h-4 w-4" />
                <span className="mt-0.5">Home</span>
              </button>

              {/* Notes trigger */}
              <button 
                onClick={() => setView('notes')}
                className={`flex flex-col items-center ${view === 'notes' ? 'text-purple-600' : 'hover:text-slate-600'}`}
              >
                <FileText className="h-4 w-4" />
                <span className="mt-0.5">Notes</span>
              </button>

              {/* AI Chat Tutor trigger */}
              <button 
                onClick={() => {
                  setCarryTopic('');
                  setView('chat');
                }}
                className={`flex flex-col items-center ${view === 'chat' ? 'text-purple-600' : 'hover:text-slate-600'}`}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="mt-0.5">AI Tutor</span>
              </button>

              {/* Profile trigger */}
              <button 
                onClick={() => setView('profile')}
                className={`flex flex-col items-center ${view === 'profile' ? 'text-purple-600' : 'hover:text-slate-600'}`}
              >
                <User className="h-4 w-4" />
                <span className="mt-0.5">Profile</span>
              </button>

              {/* Mobile Mobile-exporter Overlay trigger */}
              <button 
                onClick={() => setShowCodeOverlay(true)}
                className="flex md:hidden flex-col items-center text-purple-400 animate-pulse"
              >
                <Code2 className="h-4 w-4" />
                <span className="mt-0.5 font-bold">Code Kit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT HALF / OVERLAY PANEL: Flutter Mobile Code Exporter */}
      <div className={`w-full md:w-[48%] h-full flex flex-col z-20 border-l border-slate-900 bg-slate-900 overflow-hidden ${
        showCodeOverlay ? 'fixed inset-0 flex' : 'hidden md:flex'
      }`}>
        
        {/* Mobile close overlay button */}
        {showCodeOverlay && (
          <div className="bg-slate-950 p-2 text-right">
            <button 
              onClick={() => setShowCodeOverlay(false)}
              className="text-xs font-mono font-bold uppercase bg-rose-950/40 text-rose-400 border border-rose-800/35 px-3 py-1 rounded"
            >
              Close Code Kit &times;
            </button>
          </div>
        )}

        <FlutterExporter />
      </div>
    </div>
  );
}
