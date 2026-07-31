import React from 'react';
import { ArrowLeft, BookOpen, MessageSquare, Award, Layers } from 'lucide-react';
import { PrebuiltSubject } from '../types';

interface SubjectBrowserProps {
  subject: PrebuiltSubject;
  onGoBack: () => void;
  onQuickAction: (actionType: 'chat' | 'quiz' | 'flashcard', topicName: string) => void;
}

export default function SubjectBrowser({ subject, onGoBack, onQuickAction }: SubjectBrowserProps) {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <button onClick={onGoBack} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-600 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-xs font-bold font-display text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            {subject.name} Syllabus
          </h2>
          <p className="text-[9px] text-slate-400">Prebuilt syllabus learning tracks</p>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Subject Splash banner */}
        <div className={`p-4 bg-gradient-to-tr ${subject.color} text-white rounded-2xl space-y-1.5 shadow-md`}>
          <span className="text-[8px] font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded mr-auto inline-block">
            Syllabus Track
          </span>
          <h3 className="text-sm font-bold font-display">{subject.name}</h3>
          <p className="text-[10px] text-purple-100 leading-relaxed font-sans">{subject.description}</p>
        </div>

        {/* Chapters list */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Syllabus Chapters & Topics</h4>

          <div className="space-y-3">
            {subject.chapters.map((chapterName: string, i: number) => (
              <div 
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 shadow-sm hover:border-purple-300 transition"
              >
                <div className="space-y-0.5 text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Chapter {i + 1}: {chapterName}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    Study the core theoretical foundations, standard diagrams, and comprehensive formula sheets for this lesson.
                  </p>
                </div>

                {/* Topics quick actions launcher */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 flex items-center justify-between">
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">
                    Launch AI tools
                  </span>
                  
                  <div className="flex space-x-1">
                    {/* Ask Tutor */}
                    <button 
                      onClick={() => onQuickAction('chat', chapterName)}
                      className="p-1.5 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 text-purple-600 dark:text-purple-400 rounded-lg flex items-center space-x-1 text-[9px] font-bold border border-purple-200/25"
                      title="Explain with AI Tutor"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Explain</span>
                    </button>

                    {/* Solve Quiz */}
                    <button 
                      onClick={() => onQuickAction('quiz', chapterName)}
                      className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center space-x-1 text-[9px] font-bold border border-emerald-200/25"
                      title="Solve Mock Quiz"
                    >
                      <Award className="h-3 w-3" />
                      <span>Quiz</span>
                    </button>

                    {/* Memorize Flashcards */}
                    <button 
                      onClick={() => onQuickAction('flashcard', chapterName)}
                      className="p-1.5 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 text-amber-600 dark:text-amber-400 rounded-lg flex items-center space-x-1 text-[9px] font-bold border border-amber-200/25"
                      title="Review Flashcards"
                    >
                      <Layers className="h-3 w-3" />
                      <span>Learn</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
