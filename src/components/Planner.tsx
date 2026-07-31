import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, Award, Plus, Trash2 } from 'lucide-react';
import { StudyPlan, DaySchedule, UserProfile } from '../types';
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
interface PlannerProps {
  profile: UserProfile;
  onAddXp: (xp: number) => void;
  onGoBack: () => void;
}

export default function Planner({ profile, onAddXp, onGoBack }: PlannerProps) {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
const [activeDayIndex, setActiveDayIndex] = useState(0);



  const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'Physics']);
  const [newSubject, setNewSubject] = useState('');
  const [dailyHours, setDailyHours] = useState(3);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
  loadPlannerFromFirestore();
}, []);

  // Load plan from localStorage if exists
  useEffect(() => {
    const savedPlan = localStorage.getItem('studybuddy_planner');
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter(s => s !== sub));
  };
const savePlannerToFirestore = async (planner: StudyPlan) => {

  const user = auth.currentUser;

  if (!user) {
    console.log("No user logged in");
    return;
  }

  try {

    const plannerRef = doc(
      db,
      "users",
      user.uid,
      "planner",
      "plan"
    );

    await setDoc(plannerRef, planner);

    console.log("Planner saved successfully");

  } catch (error) {

    console.error("Error saving planner:", error);

  }

};
const loadPlannerFromFirestore = async () => {

  const user = auth.currentUser;

  if (!user) {
    console.log("No user logged in");
    return;
  }

  try {

    const plannerRef = doc(
      db,
      "users",
      user.uid,
      "planner",
      "plan"
    );

    const snapshot = await getDoc(plannerRef);

    if (snapshot.exists()) {

      const savedPlan = snapshot.data() as StudyPlan;

      setPlan(savedPlan);

      console.log("Planner loaded successfully:", savedPlan);

    }

  } catch (error) {

    console.error("Error loading planner:", error);

  }

};
  const handleGeneratePlanner = async () => {
    if (subjects.length === 0) {
      setError('Please add at least one subject to plan.');
      return;
    }

    setError('');
    setLoading(true);
    setPlan(null);

    try {
      const response = await fetch('/api/gemini/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          dailyHours,
          examCountdownDays: countdown,
          learningStyle: 'Practical Bento',
          mainGoals: 'Revise comprehensive study materials'
        })
      });

      const data = await response.json();
      if (response.ok && data.schedule) {
        const newPlan: StudyPlan = {
          id: Math.random().toString(),
          title: `Custom ${countdown}-Day Study Plan`,
          schedule: data.schedule,
          weeklyTips: data.weeklyTips || [
            'Maintain a regular sleep cycle of 7-8 hours.',
            'Hydrate properly between intensive focus hours.'
          ],
          dateCreated: new Date().toLocaleDateString()
        };
setPlan(newPlan);

await savePlannerToFirestore(newPlan);

onAddXp(20); // Award study planner XP
      } else {
        throw new Error(data.error || 'Failed to create study planner.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Server error. Loading robust offline planning template.');
      // Offline fallback plan
      const offlineSchedule: DaySchedule[] = [
        {
          day: 'Monday',
          topics: [
            { time: '09:00 AM', subject: subjects[0] || 'Mathematics', activity: 'Read definitions and solve fundamental practice questions.', duration: '1.5 Hours' },
            { time: '03:00 PM', subject: subjects[1] || 'Physics', activity: 'Draft revision notes and mind map formulas.', duration: '1.5 Hours' }
          ]
        },
        {
          day: 'Tuesday',
          topics: [
            { time: '10:00 AM', subject: subjects[0] || 'Mathematics', activity: 'Practice previous years exam papers.', duration: '2 Hours' }
          ]
        },
        {
          day: 'Wednesday',
          topics: [
            { time: '09:00 AM', subject: subjects[1] || 'Physics', activity: 'Review summary outlines and take mock quiz.', duration: '1.5 Hours' }
          ]
        },
        {
          day: 'Thursday',
          topics: [
            { time: '02:00 PM', subject: subjects[0] || 'Mathematics', activity: 'Review weak problem sets and consult AI Tutor.', duration: '1 Hour' }
          ]
        },
        {
          day: 'Friday',
          topics: [
            { time: '09:00 AM', subject: subjects[1] || 'Physics', activity: 'Spaced repetition review on textbook chapters.', duration: '2 Hours' }
          ]
        }
      ];
      const fallbackPlan: StudyPlan = {
        id: 'fallback_planner',
        title: `Custom ${countdown}-Day Schedule (Offline Mode)`,
        schedule: offlineSchedule,
        weeklyTips: [
          'Use the Pomodoro technique: study for 25 minutes, rest for 5 minutes.',
          'Always active-recall major formulas before sleeping.'
        ],
        dateCreated: new Date().toLocaleDateString()
      };
      setPlan(fallbackPlan);

await savePlannerToFirestore(fallbackPlan);
    } finally {
      setLoading(false);
    }
  };

  const handleClearPlan = async () => {

  const user = auth.currentUser;

  if (!user) {
    console.log("No user logged in");
    return;
  }

  try {

    const plannerRef = doc(
      db,
      "users",
      user.uid,
      "planner",
      "plan"
    );

    await deleteDoc(plannerRef);

    setPlan(null);

    console.log("Planner deleted successfully");

  } catch (error) {

    console.error("Error deleting planner:", error);

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
            AI Study Planner
          </h2>
          <p className="text-[9px] text-slate-400">Personalized weekly study timetables</p>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-center space-x-1.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* State 1: Configuration Form */}
        {!plan && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Configure Study Program</span>
              </h3>

              {/* Subjects tags manager */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Select Target Subjects</label>
                <div className="flex flex-wrap gap-1">
                  {subjects.map((sub) => (
                    <span 
                      key={sub} 
                      onClick={() => handleRemoveSubject(sub)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] rounded-lg bg-purple-100 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
                    >
                      <span>{sub}</span>
                      <span className="text-[8px] font-mono">&times;</span>
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom subject..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    onClick={handleAddSubject}
                    className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Slider details */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Daily Hours: <strong>{dailyHours}h</strong></span>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-purple-600 bg-slate-200 dark:bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Exam Countdown: <strong>{countdown} Days</strong></span>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="5"
                    value={countdown}
                    onChange={(e) => setCountdown(Number(e.target.value))}
                    className="w-full accent-purple-600 bg-slate-200 dark:bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGeneratePlanner}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Drafting Schedule...</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Generate Customized Schedule</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* State 2: Plan generated view */}
        {plan && (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="font-semibold text-purple-800 dark:text-purple-300">Exam countdown: {countdown} Days remaining</span>
              <button
                onClick={handleClearPlan}
                className="text-[9px] text-rose-500 hover:underline font-semibold font-mono"
              >
                Clear Plan
              </button>
            </div>

            {/* Week days slider */}
            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-x-auto space-x-1 text-[10px]">
              {plan.schedule.map((dayPlan, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDayIndex(i)}
                  className={`px-2.5 py-1 rounded transition font-semibold ${
                    activeDayIndex === i
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {dayPlan.day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Daily study items card */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {plan.schedule[activeDayIndex]?.day}'s Study blocks
              </h4>

              <div className="space-y-2.5">
                {plan.schedule[activeDayIndex]?.topics.map((slot, i) => (
                  <div 
                    key={i} 
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-start space-x-3 shadow-sm hover:border-purple-300 dark:hover:border-purple-900/35 transition"
                  >
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-lg flex-shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 flex-1 text-xs">
                      <div className="flex justify-between items-center">
                        <strong className="font-semibold text-slate-800 dark:text-slate-100">{slot.subject}</strong>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{slot.time} ({slot.duration})</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                        {slot.activity}
                      </p>
                    </div>
                  </div>
                ))}

                {(!plan.schedule[activeDayIndex]?.topics || plan.schedule[activeDayIndex].topics.length === 0) && (
                  <div className="p-6 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center rounded-xl text-xs text-slate-400 italic">
                    Rest Day / General Revision Buffer
                  </div>
                )}
              </div>
            </div>

            {/* Weekly study advice panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-sm">
              <h4 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Study Hygiene Tips</span>
              </h4>
              <ul className="list-disc pl-4 text-[10px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
                {plan.weeklyTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
