import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Square, Sparkles, Volume2, Music, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { Note, UserProfile } from '../types';

interface VoiceModeProps {
  profile: UserProfile;
  notes: Note[];
  onAddXp: (xp: number) => void;
  onGoBack: () => void;
}

export default function VoiceMode({ profile, notes, onAddXp, onGoBack }: VoiceModeProps) {
  const [text, setText] = useState('Welcome to AI Study Buddy Voice Mode! Select any saved summary or paste custom textbook chapters, and I will read them aloud to you clearly.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1); // speech rate
  const [pitch, setPitch] = useState(1);
  const [selectedNoteId, setSelectedNoteId] = useState('');

  // Waveform styling helper state
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 25, 40, 15, 30, 45, 20, 10, 35, 50, 15]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 45) + 8));
      }, 150);
    } else {
      setWaveHeights([15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  // Cancel any speaking on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech first

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
    onAddXp(10); // Voice review XP!
  };

  const handlePause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleLoadNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    const matched = notes.find(n => n.id === noteId);
    if (matched) {
      // clean markdown formatting for speech
      const clean = matched.content
        .replace(/[#*`$-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      setText(clean);
    }
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
            Voice Study Mode
          </h2>
          <p className="text-[9px] text-slate-400">Audio narration of summaries</p>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Narrator waveform box */}
        <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white rounded-2xl p-5 text-center space-y-4 shadow-lg shadow-purple-500/15">
          <Volume2 className="h-8 w-8 mx-auto text-purple-200 animate-pulse" />
          
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-display">Audio Synthesizer</h3>
            <p className="text-[9px] text-purple-100">AI Voice Assistant reads notes aloud</p>
          </div>

          {/* Waveform graphic */}
          <div className="flex justify-center items-center h-16 space-x-1.5 bg-purple-900/30 rounded-xl px-4 py-2 border border-purple-400/20">
            {waveHeights.map((h, i) => (
              <div 
                key={i} 
                className="w-1 bg-white rounded-full transition-all duration-150"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Load note dropdown */}
        {notes.length > 0 && (
          <div className="space-y-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Load Narration Text from Notepad</label>
            <select
              value={selectedNoteId}
              onChange={(e) => handleLoadNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="">-- Choose saved note --</option>
              {notes.map(n => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Text Area */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Narration Script</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste textbook chapters to recite..."
            className="w-full h-32 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none leading-relaxed"
          />
        </div>

        {/* Playback rate controls */}
        <div className="grid grid-cols-2 gap-3.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 shadow-sm">
          <div className="space-y-1">
            <span className="block text-[8px] font-bold uppercase text-slate-400">Speech Speed: {rate}x</span>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1"
              value={rate} 
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-purple-600 h-1 rounded appearance-none bg-slate-200 dark:bg-slate-750" 
            />
          </div>

          <div className="space-y-1">
            <span className="block text-[8px] font-bold uppercase text-slate-400">Vocal Pitch: {pitch}</span>
            <input 
              type="range" 
              min="0.5" 
              max="1.5" 
              step="0.1"
              value={pitch} 
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-purple-600 h-1 appearance-none bg-slate-200 dark:bg-slate-750 rounded" 
            />
          </div>
        </div>
      </div>

      {/* Persistent Audio Controls Floating Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center justify-around space-x-3 shadow-md">
        <button
          onClick={handleStop}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition"
        >
          <Square className="h-4 w-4" />
        </button>

        <button
          onClick={handlePlay}
          className="p-3 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-[0.98] transition flex items-center justify-center"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>

        <button
          onClick={() => {
            handleStop();
            setTimeout(handlePlay, 100);
          }}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
