import React, { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, AlertCircle, RefreshCw, Layers, Eye, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { Flashcard, FlashcardSet as FCSet, UserProfile } from '../types';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface FlashcardSetProps {
  profile: UserProfile;
  onAddXp: (xp: number) => void;
  onGoBack: () => void;
}

export default function FlashcardSet({ profile, onAddXp, onGoBack }: FlashcardSetProps) {
  const [subject, setSubject] = useState('Biology');
  const [topic, setTopic] = useState('');
  const [quantity, setQuantity] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeSet, setActiveSet] = useState<FCSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [scores, setScores] = useState<{ [key: number]: 'easy' | 'medium' | 'hard' }>({});
const saveFlashcardDeck = async (deck: FCSet) => {
  try {
    // Make sure a user is signed in
    if (!auth.currentUser) {
      console.error("❌ No user is logged in.");
      return;
    }

    await addDoc(
      collection(
        db,
        "users",
        auth.currentUser.uid,
        "flashcards"
      ),
      {
        title: deck.title,
        subject: deck.subject,
        cards: deck.cards,
        createdAt: serverTimestamp(),
        userName: profile.name,
      }
    );

    console.log("✅ Flashcards saved successfully.");
  } catch (error) {
    console.error("❌ Error saving flashcards:", error);
  }
};
const loadLatestFlashcardDeck = async () => {
  if (!auth.currentUser) return;

  try {
    const q = query(
      collection(
        db,
        "users",
        auth.currentUser.uid,
        "flashcards"
      ),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();

      setActiveSet({
        id: snapshot.docs[0].id,
        title: data.title,
        subject: data.subject,
        cards: data.cards,
        dateCreated: new Date().toLocaleDateString(),
      });

      console.log("✅ Previous flashcards loaded.");
    }
  } catch (error) {
    console.error("Error loading flashcards:", error);
  }
};
  const handleGenerateDeck = async () => {
    if (!topic.trim()) return;

    setError('');
    setLoading(true);
    setActiveSet(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setScores({});

    try {
      const response = await fetch('/api/gemini/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          quantity
        })
      });

      const data = await response.json();
      if (response.ok && data.flashcards) {
       const deck: FCSet = {
  id: Math.random().toString(),
  title: `${subject}: ${topic}`,
  subject,
  cards: data.flashcards,
  dateCreated: new Date().toLocaleDateString()
};

setActiveSet(deck);

await saveFlashcardDeck(deck);
        onAddXp(15); // Generation XP
      } else {
        throw new Error(data.error || 'Failed to generate flashcards.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Server connection error. Initializing offline syllabus deck.');
      // Offline fallback cards
      const offlineDecks: Flashcard[] = [
        { front: `What is the core definition of "${topic || 'studies'}"?`, back: 'Review your syllabus outline. Active revision is key to memorization!' },
        { front: 'How does Spaced Repetition enhance retention?', back: 'By reviewing content at expanding, strategically timed intervals, strengthening long-term memory pathways.' },
        { front: 'Explain the "Feynman Technique".', back: 'A learning method where you explain a concept in simple terms, as if teaching a child, to identify gaps in your knowledge.' }
      ];
      setActiveSet({
        id: 'fallback_deck',
        title: `${subject}: ${topic || 'Key Terms'}`,
        subject,
        cards: offlineDecks,
        dateCreated: new Date().toLocaleDateString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreCard = (difficultyRating: 'easy' | 'medium' | 'hard') => {
    if (!activeSet) return;
    setScores({
      ...scores,
      [currentCardIndex]: difficultyRating
    });
    
    // Spaced repetition XP rewards
    let xpAward = 5;
    if (difficultyRating === 'easy') xpAward = 8;
    onAddXp(xpAward);

    // Auto flip back and progress
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIndex < activeSet.cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // finished deck
        onAddXp(15); // Deck completion bonus!
      }
    }, 250);
  };

  const isCompleted = activeSet && Object.keys(scores).length === activeSet.cards.length;
useEffect(() => {
  loadLatestFlashcardDeck();
}, []);
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <button onClick={onGoBack} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-600 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-xs font-bold font-display text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            AI Flashcards
          </h2>
          <p className="text-[9px] text-slate-400">Spaced repetition memory review</p>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* State 1: Configuration Form */}
        {!activeSet && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option>Biology</option>
                <option>Chemistry</option>
                <option>Physics</option>
                <option>Mathematics</option>
                <option>Computer Science</option>
                <option>English Literature</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Topic / Lecture Chapter</label>
              <input
                type="text"
                placeholder="e.g. Mitosis, Periodic Table, Classical Mechanics, SQL Joins..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Deck Card Quantity</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value={4}>4 Flashcards (Quick)</option>
                <option value={6}>6 Flashcards (Standard)</option>
                <option value={10}>10 Flashcards (Deep Review)</option>
              </select>
            </div>

            {error && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-center space-x-1.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerateDeck}
              disabled={!topic.trim() || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Generating Memory deck...</span>
                </>
              ) : (
                <>
                  <Layers className="h-4 w-4" />
                  <span>Generate Spaced Repetition Deck</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* State 2: Reviewing Flashcards */}
        {activeSet && !isCompleted && (
          <div className="space-y-4">
            {/* Upper deck metrics */}
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span className="truncate max-w-[150px]">Deck: <strong>{activeSet.title}</strong></span>
              <span>Card <strong>{currentCardIndex + 1}</strong> of <strong>{activeSet.cards.length}</strong></span>
            </div>

            {/* Progress line */}
            <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / activeSet.cards.length) * 100}%` }}
              />
            </div>

            {/* CSS 3D Perspektiv Card wrapper */}
            <div className="perspective-1000 h-56 w-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              <div 
                className={`relative h-full w-full rounded-2xl shadow-md border duration-500 transform style-preserve-3d transition-transform ${
                  isFlipped 
                    ? 'rotate-y-180 bg-purple-50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-900/30' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Front Side */}
                <div className={`absolute inset-0 backface-hidden p-6 flex flex-col justify-between ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100/40 dark:bg-purple-950/40 px-2 py-0.5 rounded mr-auto">
                    Question Card
                  </span>
                  <p className="text-center text-xs font-semibold text-slate-800 dark:text-slate-100 px-2 leading-relaxed font-sans">
                    {activeSet.cards[currentCardIndex].front}
                  </p>
                  <span className="text-[9px] text-slate-400 text-center flex items-center justify-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>Tap card to reveal answer</span>
                  </span>
                </div>

                {/* Back Side */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 p-6 flex flex-col justify-between ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/40 dark:bg-emerald-950/40 px-2 py-0.5 rounded mr-auto">
                    Answer Key
                  </span>
                  <p className="text-center text-xs font-medium text-slate-700 dark:text-slate-300 px-2 leading-relaxed font-sans">
                    {activeSet.cards[currentCardIndex].back}
                  </p>
                  <span className="text-[8px] text-slate-400 text-center font-mono uppercase tracking-wide">
                    Rate difficulty to progress
                  </span>
                </div>
              </div>
            </div>

            {/* Card controls (Spaced Repetition Buttons) */}
            {isFlipped ? (
              <div className="grid grid-cols-3 gap-2 pt-2 animate-fade-in">
                <button
                  onClick={() => handleScoreCard('hard')}
                  className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 font-semibold py-2 px-1 rounded-xl text-[10px] text-center transition active:scale-[0.98]"
                >
                  Again (Hard)
                </button>
                <button
                  onClick={() => handleScoreCard('medium')}
                  className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 font-semibold py-2 px-1 rounded-xl text-[10px] text-center transition active:scale-[0.98]"
                >
                  Good (Medium)
                </button>
                <button
                  onClick={() => handleScoreCard('easy')}
                  className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 font-semibold py-2 px-1 rounded-xl text-[10px] text-center transition active:scale-[0.98]"
                >
                  Easy (Mastered)
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center text-xs text-slate-400 py-1 font-sans">
                <button 
                  disabled={currentCardIndex === 0} 
                  onClick={() => setCurrentCardIndex(currentCardIndex - 1)}
                  className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40"
                >
                  Prev Card
                </button>
                <span>Flipped? {isFlipped ? 'Yes' : 'No'}</span>
                <button 
                  onClick={() => setIsFlipped(true)}
                  className="px-2.5 py-1.5 rounded bg-purple-600 text-white font-medium"
                >
                  Reveal
                </button>
              </div>
            )}
          </div>
        )}

        {/* State 3: Spaced Repetition Complete */}
        {activeSet && isCompleted && (
          <div className="space-y-4 text-center py-4">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl p-5 space-y-3.5 shadow-lg shadow-emerald-500/15">
              <CheckCircle2 className="h-10 w-10 mx-auto animate-bounce" />
              <div>
                <h3 className="text-base font-bold font-display">Deck Completed!</h3>
                <p className="text-[10px] text-emerald-100">Congratulations on reviewing your deck</p>
              </div>
              <p className="text-xs font-semibold text-purple-200">
                Study session fully processed. +30 completion XP rewarded!
              </p>
            </div>

            <button
              onClick={() => setActiveSet(null)}
              className="w-full bg-slate-900 dark:bg-slate-950 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition hover:bg-slate-900"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Load New Deck</span>
            </button>
          </div>
        )}
      </div>

      {/* Style Helpers for Card Flip */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
