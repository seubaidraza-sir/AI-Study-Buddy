import React, { useState } from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, ChevronRight, Award, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { Quiz, QuizQuestion, UserProfile } from '../types';

interface QuizGeneratorProps {
  profile: UserProfile;
  onAddXp: (xp: number) => void;
  onGoBack: () => void;
}

export default function QuizGenerator({ profile, onAddXp, onGoBack }: QuizGeneratorProps) {
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [types, setTypes] = useState<string[]>(['mcq', 'true_false']);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const toggleType = (t: string) => {
    if (types.includes(t)) {
      if (types.length > 1) {
        setTypes(types.filter(item => item !== t));
      }
    } else {
      setTypes([...types, t]);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;

    setError('');
    setLoading(true);
    setQuiz(null);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          questionCount: count,
          types
        })
      });

      const data = await response.json();
      if (response.ok && data.questions) {
        setQuiz({
          id: Math.random().toString(),
          title: `${subject}: ${topic}`,
          subject,
          questions: data.questions,
          totalQuestions: data.questions.length
        });
        onAddXp(10); // Generation XP
      } else {
        throw new Error(data.error || 'Failed to generate quiz questions.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Server error. Utilizing robust textbook offline test generator.');
      // Robust mock fallback matching subject
      const fallbackQuestions: QuizQuestion[] = [
        {
          id: 'q1',
          type: 'mcq',
          question: `What is the fundamental theorem or core principle when evaluating ${topic || 'these general concepts'}?`,
          options: [
            'Evaluating equations under optimal bounding conditions',
            'Applying standard linear transforms and integrations',
            'Applying conservation theories across local parameters',
            'None of the above options fit precisely'
          ],
          correctAnswer: 'Applying standard linear transforms and integrations',
          explanation: 'Standard linear transforms ensure the system coordinates are held within uniform intervals.'
        },
        {
          id: 'q2',
          type: 'true_false',
          question: `In standard curriculum criteria, "${topic || 'studies'}" requires strict empirical observation.`,
          options: ['True', 'False'],
          correctAnswer: 'True',
          explanation: 'Empirical verification validates local hypotheses against standard scientific guidelines.'
        }
      ];
      setQuiz({
        id: 'fallback_quiz',
        title: `${subject}: ${topic || 'Academics'} Mock Quiz`,
        subject,
        questions: fallbackQuestions,
        totalQuestions: fallbackQuestions.length
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    setQuizSubmitted(true);
    const correctCount = calculateScore();
    const finalXp = correctCount * 15 + 10; // 15 XP per correct answer, 10 XP completion bonus!
    onAddXp(finalXp);
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
            AI Quiz Generator
          </h2>
          <p className="text-[9px] text-slate-400">Generate instantly scored mocks</p>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* State 1: Configuration Form */}
        {!quiz && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
                <option>Computer Science</option>
                <option>English Literature</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Topic / Lesson Content</label>
              <input
                type="text"
                placeholder="e.g. Newton's laws, Quadratic equations, Photosynthesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Competitive Exams</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block">Questions Count</label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Question Formats</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'mcq', label: 'MCQs' },
                  { id: 'true_false', label: 'True / False' },
                  { id: 'fill_blank', label: 'Fill in blanks' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleType(item.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      types.includes(item.id)
                        ? 'bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-center space-x-1.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerateQuiz}
              disabled={!topic.trim() || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Generating AI Quiz...</span>
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  <span>Generate Test Paper</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* State 2: Taking the Quiz */}
        {quiz && !quizSubmitted && (
          <div className="space-y-4">
            {/* Header progress info */}
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Topic: <strong>{quiz.title}</strong></span>
              <span>Question <strong>{currentQuestionIndex + 1}</strong> of <strong>{quiz.questions.length}</strong></span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
              <span className="inline-block px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md bg-purple-50 dark:bg-purple-950/25 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/20">
                {quiz.questions[currentQuestionIndex].type.toUpperCase().replace('_', ' ')}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-relaxed font-sans">
                {quiz.questions[currentQuestionIndex].question}
              </p>
            </div>

            {/* Options block */}
            <div className="space-y-2">
              {quiz.questions[currentQuestionIndex].options?.map((opt, oIdx) => {
                const isSelected = selectedAnswers[quiz.questions[currentQuestionIndex].id] === opt;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(quiz.questions[currentQuestionIndex].id, opt)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs text-left transition ${
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-950/20 border-purple-500 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <div className="h-4 w-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[8px] font-bold">&#10003;</div>}
                  </button>
                );
              })}

              {/* Text Input fallback for short answers or fill blanks without options */}
              {(!quiz.questions[currentQuestionIndex].options || quiz.questions[currentQuestionIndex].options.length === 0) && (
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Type your exact answer here..."
                    value={selectedAnswers[quiz.questions[currentQuestionIndex].id] || ''}
                    onChange={(e) => handleSelectAnswer(quiz.questions[currentQuestionIndex].id, e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-medium text-slate-500 disabled:opacity-50"
              >
                Previous
              </button>

              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-[10px] font-medium flex items-center space-x-1"
                >
                  <span>Next Question</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-semibold flex items-center space-x-1"
                >
                  <span>Finish Quiz</span>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* State 3: Quiz Scoreboard & Explanations */}
        {quiz && quizSubmitted && (
          <div className="space-y-4">
            {/* Scorecard Widget */}
            <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white rounded-2xl p-5 text-center space-y-3 shadow-lg shadow-purple-500/15">
              <Award className="h-10 w-10 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-base font-bold font-display">Quiz Finished!</h3>
                <p className="text-[10px] text-purple-100">Review your academic performance</p>
              </div>

              {/* Score circle */}
              <div className="inline-flex flex-col items-center justify-center h-20 w-20 rounded-full border-4 border-purple-400 bg-purple-900/30">
                <span className="text-xl font-bold font-display">
                  {calculateScore()} / {quiz.questions.length}
                </span>
                <span className="text-[8px] font-medium tracking-wider uppercase text-purple-200">Score</span>
              </div>

              <p className="text-xs font-semibold text-emerald-300">
                +{calculateScore() * 15 + 10} XP points added to profile!
              </p>
            </div>

            {/* Question review and explanations list */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Solution Keys & Explanations</h4>
              
              <div className="space-y-3.5">
                {quiz.questions.map((q, idx) => {
                  const userAnswer = selectedAnswers[q.id] || '(No Answer)';
                  const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
                  
                  return (
                    <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs shadow-sm">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                          Q{idx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 ml-1.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 flex-shrink-0 ml-1.5" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                        <div>
                          <span className="text-slate-400 block font-semibold text-[8px] uppercase">Your Answer</span>
                          <span className={isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}>
                            {userAnswer}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold text-[8px] uppercase">Correct Key</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{q.correctAnswer}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-purple-50/40 dark:bg-purple-950/5 border border-purple-100/50 dark:border-purple-900/20 rounded-lg text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        <strong className="text-purple-600 dark:text-purple-400 font-semibold block mb-0.5">Academic Feedback:</strong>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setQuiz(null)}
              className="w-full bg-slate-800 dark:bg-slate-950 hover:bg-slate-900 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center space-x-1 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry / Generate Another</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
