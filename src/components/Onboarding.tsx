import React, { useState } from 'react';
import { Sparkles, BrainCircuit, GraduationCap, ChevronRight, User, Award, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'School' | 'College' | 'University' | 'Competitive Exams'>('College');
  const [style, setStyle] = useState<'Visual & Practical' | 'Theoretical & Text' | 'Socratic Q&A' | 'Spaced Repetition'>('Visual & Practical');
  const [avatar, setAvatar] = useState('🦊');

  const steps = [
    {
      title: 'Meet AI Study Buddy',
      desc: 'Your premium, multi-subject AI companion. Ask homework questions, draft bullet summaries, create mock quizzes, and study on the go.',
      icon: <BrainCircuit className="h-14 w-14 text-purple-500 animate-bounce" />,
    },
    {
      title: 'Welcome Muhammad Ubaid',
      desc:  "Welcome to my AI Study Buddy. Let's learn smarter together!",
      icon: <User className="h-14 w-14 text-violet-500" />,
    },
    {
      title: 'Learning Preference',
      desc: 'We will configure our AI generators, note summaries, and study planner to fit your style perfectly.',
      icon: <Award className="h-14 w-14 text-emerald-500" />,
    }
  ];

  const avatars = ['🦊', '🦉', '🐨', '🦖', '🦁', '🐼', '🐱', '🎓'];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const initialProfile: UserProfile = {
        name: name.trim() || 'Buddy Student',
        email: 'student@studybuddy.ai',
        streak: 1,
        studyMinutes: 45,
        joinedDate: new Date().toLocaleDateString(),
        language: 'en',
        avatar: avatar,
        xp: 150,
        level: 1
      };
      onComplete(initialProfile);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 justify-between p-6 font-sans">
      {/* Top Header Indicators */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-1">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display text-slate-800 dark:text-slate-200">
            Study Buddy
          </span>
        </div>
        <div className="flex space-x-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-350 ${
                i === step ? 'w-5 bg-purple-600' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Illustration / Content Area */}
      <div className="my-auto py-4 flex flex-col items-center text-center space-y-6">
        <div className="p-5 bg-purple-50 dark:bg-purple-950/20 rounded-full border border-purple-100 dark:border-purple-900/30">
          {steps[step].icon}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {steps[step].title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs px-2 leading-relaxed">
            {steps[step].desc}
          </p>
        </div>

        {/* Step 1: Form */}
        {step === 1 && (
          <div className="w-full max-w-xs space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Exam Tier
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['School', 'College', 'University', 'Competitive Exams'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setRole(opt)}
                    className={`px-2 py-2 text-[10px] font-medium rounded-lg border text-center transition ${
                      role === opt
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preference and Avatar */}
        {step === 2 && (
          <div className="w-full max-w-xs space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Choose Mascot/Avatar
              </label>
              <div className="flex justify-between items-center gap-1.5 overflow-x-auto py-1">
                {avatars.map((av) => (
                  <button
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`text-xl p-2 rounded-full transition-transform ${
                      avatar === av
                        ? 'bg-purple-100 dark:bg-purple-950/40 ring-1 ring-purple-500 scale-110'
                        : 'bg-white dark:bg-slate-800 hover:scale-105'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Learning style Preference
              </label>
              <div className="space-y-1.5">
                {(['Visual & Practical', 'Theoretical & Text', 'Socratic Q&A', 'Spaced Repetition'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border text-left transition ${
                      style === s
                        ? 'bg-purple-50 dark:bg-purple-950/10 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{s}</span>
                    {style === s && <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="space-y-4">
        <button
          onClick={handleNext}
          className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-lg shadow-purple-500/20"
        >
          <span>{step === steps.length - 1 ? 'Start Learning' : 'Continue'}</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        {step < steps.length - 1 && (
          <button
            onClick={() => setStep(steps.length - 1)}
            className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[11px] font-semibold transition text-center"
          >
            Skip Intro
          </button>
        )}
      </div>
    </div>
  );
}
