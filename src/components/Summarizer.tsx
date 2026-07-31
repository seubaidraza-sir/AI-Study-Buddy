import React, { useState } from 'react';
import { ArrowLeft, Sparkles, FileText, Check, Copy, Share2, Download, AlertCircle, Save } from 'lucide-react';
import { Note, UserProfile } from '../types';

interface SummarizerProps {
  profile: UserProfile;
  onAddXp: (xp: number) => void;
  onSaveNote: (note: Omit<Note, 'id' | 'date'>) => void;
  onGoBack: () => void;
}

export default function Summarizer({ profile, onAddXp, onSaveNote, onGoBack }: SummarizerProps) {
  const [inputText, setInputText] = useState('');
  const [focus, setFocus] = useState('General Overview');
  const [docType, setDocType] = useState('Lecture Notes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    summary: string;
    keyPoints: string[];
    definitions: { term: string; definition: string }[];
    examTips: string[];
  } | null>(null);

  const [activeResultTab, setActiveResultTab] = useState<'summary' | 'bullets' | 'definitions' | 'tips'>('summary');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setError('');
    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputText,
          focus,
          documentType: docType
        })
      });

      const data = await response.json();
      if (response.ok && data.summary) {
        setResult(data);
        onAddXp(20); // Award study XP
      } else {
        throw new Error(data.error || 'Failed to generate summary.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Server error. Please verify the Gemini API setup.');
      // Fallback preview data
      setResult({
        summary: `This is a mock summary of your ${docType} focused on ${focus}. To unlock live high-quality summaries, configure your GEMINI_API_KEY.`,
        keyPoints: [
          'Core concepts require consistent active recall and review.',
          'Formulating structured summaries assists in retention.',
          'Always review key vocabulary and formula structures.'
        ],
        definitions: [
          { term: 'Active Recall', definition: 'Testing your memory immediately after reading a text.' },
          { term: 'Spaced Repetition', definition: 'Increasing interval review schedules over time.' }
        ],
        examTips: [
          'Rest properly before exams to ensure neural pathways are healthy.',
          'Check marking criteria prior to drafting detailed answers.'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const formattedText = `AI STUDY SUMMARY
=========================
Focus: ${focus}

SUMMARY:
${result.summary}

KEY POINTS:
${result.keyPoints.map(p => `• ${p}`).join('\n')}

DEFINITIONS:
${result.definitions.map(d => `• ${d.term}: ${d.definition}`).join('\n')}

EXAM TIPS:
${result.examTips.map(t => `• ${t}`).join('\n')}`;

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!result) return;
    const text = result.summary;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${focus.replace(/\s+/g, '_')}_summary.txt`;
    a.click();
  };

  const handleSaveToNotes = () => {
    if (!result) return;
    onSaveNote({
      title: `${focus} Summary (${docType})`,
      content: `### AI Summary
${result.summary ?? ""}

### Key Concepts
${(result.keyPoints ?? []).map(p => `- ${p}`).join("\n")}

### Core Definitions
${(result.definitions ?? []).map(d => `**${d.term}**: ${d.definition}`).join("\n\n")}

### Exam Advice
${(result.examTips ?? []).map(t => `* ${t}`).join("\n")}`,
      category: 'Summaries',
      isFavorite: true
    });
    setSaved(true);
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
            AI Note Summarizer
          </h2>
          <p className="text-[9px] text-slate-400">Condense and learn material instantly</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Input / Control Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!result ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Study Materials / Notes text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste lecture notes, book chapters, transcript texts, or PDF scraps here (at least 50 characters)..."
                className="w-full h-44 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block">Study Focus</label>
                <select
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option>General Overview</option>
                  <option>Exam Prep Cheat-Sheet</option>
                  <option>Formulas & Derivations</option>
                  <option>Vocabulary & Concepts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block">Material Source</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option>Lecture Notes</option>
                  <option>Textbook Chapter</option>
                  <option>Research Paper</option>
                  <option>Revision Outline</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-center space-x-1.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSummarize}
              disabled={inputText.length < 20 || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Processing notes...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Generate AI Summary</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Summary Result Display */
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-3 rounded-xl flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-purple-800 dark:text-purple-300">AI Summary Ready</span>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-[10px] bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition text-slate-600 dark:text-slate-300"
              >
                Reset
              </button>
            </div>

            {/* Sub-Tabs for Result */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 text-[10px] bg-white dark:bg-slate-950 p-1 rounded-lg space-x-1">
              {(['summary', 'bullets', 'definitions', 'tips'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveResultTab(tab)}
                  className={`flex-1 py-1.5 rounded transition font-medium ${
                    activeResultTab === tab
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {tab === 'summary' && 'Summary'}
                  {tab === 'bullets' && 'Key Points'}
                  {tab === 'definitions' && 'Definitions'}
                  {tab === 'tips' && 'Exam Tips'}
                </button>
              ))}
            </div>

            {/* Result Panel Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 min-h-[180px] max-h-[300px] overflow-y-auto">
              {activeResultTab === 'summary' && (
                <p className="whitespace-pre-line font-sans">{result.summary}</p>
              )}

              {activeResultTab === 'bullets' && (
                <ul className="list-disc pl-4 space-y-2 font-sans">
                  {(result.keyPoints ?? []).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              )}

              {activeResultTab === 'definitions' && (
                <div className="space-y-3 font-sans">
                  {result.definitions.length > 0 ? (
                    (result.definitions ?? []).map((def, i) => (
                      <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                        <strong className="text-purple-600 dark:text-purple-400 block mb-0.5">{def.term}</strong>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{def.definition}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No specific terminology extracted.</p>
                  )}
                </div>
              )}

              {activeResultTab === 'tips' && (
                <ul className="list-decimal pl-4 space-y-2 font-sans">
                  {(result.examTips ?? []).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleCopy}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 transition"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span className="mt-1">Copy Report</span>
              </button>

              <button
                onClick={handleExport}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 transition"
              >
                <Download className="h-4 w-4" />
                <span className="mt-1">Export TXT</span>
              </button>

              <button
                onClick={handleSaveToNotes}
                disabled={saved}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-900/30 text-[10px] text-purple-600 dark:text-purple-300 transition disabled:opacity-50"
              >
                {saved ? <Check className="h-4 w-4 text-emerald-500" /> : <Save className="h-4 w-4" />}
                <span className="mt-1">{saved ? 'Saved!' : 'Save Note'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
