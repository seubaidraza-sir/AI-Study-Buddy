import React, { useState } from "react";
import { Badge, UserProfile, Note } from "../types";
import { backupUserData } from "../lib/backup";
import {
ArrowLeft,
Award,
Moon,
Sun,
Globe,
Shield,
RefreshCw,
LogOut,
Check,
Heart,
Trophy,
Flame,
Brain
} from "lucide-react";
import {
getTheme,
setTheme
} from "../lib/theme";

interface ProfileProps {
  profile: UserProfile;
  notes: Note[];
  onUpdateProfile: (p: UserProfile) => void;
  onLogout: () => void;
  onGoBack: () => void;
}
export default function Profile({
  profile,
  notes,
  onUpdateProfile,
  onLogout,
  onGoBack
}: ProfileProps) {
  console.log(notes);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setCurrentTheme] = useState(getTheme());
 const changeTheme = (newTheme: "light" | "dark") => {
  setCurrentTheme(newTheme);
  setTheme(newTheme);

  setSuccess(
    newTheme === "dark"
      ? "Dark Mode Enabled 🌙"
      : "Light Mode Enabled ☀️"
  );

  setTimeout(() => setSuccess(""), 2000);
};
const toggleTheme = () => {
  changeTheme(theme === "dark" ? "light" : "dark");
};
  const badges: Badge[] = [
    { id: 'b1', name: 'Academic Pioneer', description: 'Registered and completed onboarding steps.', icon: '🎓', unlocked: true, points: 50 },
    { id: 'b2', name: 'Note Transcriber', description: 'Extracted printed textbook sheets using AI OCR.', icon: '📷', unlocked: profile.studyMinutes > 30, points: 100 },
    { id: 'b3', name: 'Memory Master', description: 'Cleared a spaced repetition flashcard deck.', icon: '🧠', unlocked: profile.xp > 200, points: 150 },
    { id: 'b4', name: 'Trivia Overlord', description: 'Scored high accuracy marks on customized mock quizzes.', icon: '🏆', unlocked: profile.xp > 300, points: 200 },
    { id: 'b5', name: 'Persistent scholar', description: 'Maintained a active streak study pattern.', icon: '🔥', unlocked: profile.streak >= 2, points: 250 }
  ];

  const toggleLanguage = () => {
    const nextLang = profile.language === 'en' ? 'ur' : 'en';
    onUpdateProfile({
      ...profile,
      language: nextLang
    });
    setSuccess(`Language successfully set to ${nextLang === 'ur' ? 'Urdu (اردو)' : 'English'}`);
    setTimeout(() => setSuccess(''), 2500);
  };

  const handleBackup = async () => {
  try {
    setLoading(true);
    setSuccess("");

    console.log("Profile:", profile);

notes.forEach((note, index) => {
  console.log(`Note ${index}:`, note);

  Object.entries(note).forEach(([key, value]) => {
    if (value === undefined) {
      console.error(`❌ Note ${index} field '${key}' is undefined`);
    }
  });
});

await backupUserData(profile, notes);

    setSuccess("✅ Successfully backed up to Firebase Cloud.");
  } catch (error) {
    console.error(error);
    setSuccess("❌ Backup failed.");
  } finally {
    setLoading(false);

    setTimeout(() => setSuccess(""), 3000);
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
            Student Profile
          </h2>
          <p className="text-[9px] text-slate-400">Manage credentials and awards</p>
        </div>
        <button onClick={onLogout} className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full transition" title="Log out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {success && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-[10px] text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex items-start space-x-1.5">
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* User Card Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="text-3xl p-3 bg-purple-50 dark:bg-purple-950/40 rounded-full select-none">
            {profile.avatar}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display leading-tight">{profile.name}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-950/35 text-purple-700 dark:text-purple-300">
              Level {profile.level} Scholar
            </span>
            <p className="text-[9px] text-slate-400">Joined on: {profile.joinedDate}</p>
          </div>
        </div>

        {/* Stat Rows */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <Flame className="h-5 w-5 mx-auto text-amber-500 animate-pulse" />
            <span className="text-sm font-bold block text-slate-800 dark:text-slate-100 mt-1">{profile.streak} Days</span>
            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block">Study Streak</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <Trophy className="h-5 w-5 mx-auto text-purple-500" />
            <span className="text-sm font-bold block text-slate-800 dark:text-slate-100 mt-1">{profile.xp} XP</span>
            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block">Total Points</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <Brain className="h-5 w-5 mx-auto text-emerald-500" />
            <span className="text-sm font-bold block text-slate-800 dark:text-slate-100 mt-1">{profile.studyMinutes}m</span>
            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block">Study Hours</span>
          </div>
        </div>

        {/* Level XP slider */}
        <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5 shadow-sm text-xs">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Level {profile.level} Progress</span>
            <span>{profile.xp} / {profile.level * 500} XP</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${Math.min((profile.xp / (profile.level * 500)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unlocked Badges</h4>
          
          <div className="space-y-2">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`flex items-center space-x-3 p-3 rounded-xl border transition ${
                  badge.unlocked
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/40 opacity-50'
                }`}
              >
                <span className="text-2xl select-none">{badge.unlocked ? badge.icon : '🔒'}</span>
                <div className="space-y-0.5 flex-1 text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="font-semibold text-slate-900 dark:text-slate-100">{badge.name}</strong>
                    {badge.unlocked && <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold">+{badge.points} XP</span>}
                  </div>
                  <p className="text-[10px] text-slate-400">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences / Controls */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Preferences</h4>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800 text-xs">
           {/* Theme */}
<button
  onClick={toggleTheme}
  className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition"
>
  <div className="flex items-center space-x-2">
    {theme === "dark" ? (
      <Moon className="h-4 w-4 text-yellow-400" />
    ) : (
      <Sun className="h-4 w-4 text-orange-500" />
    )}

    <span className="text-slate-700 dark:text-slate-200">
      Theme
    </span>
  </div>

  <span className="font-semibold text-purple-600">
    {theme === "dark" ? "Dark" : "Light"}
  </span>
</button>

            {/* Multi Language trigger */}
            <button 
              onClick={toggleLanguage}
              className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-slate-700 dark:text-slate-300"
            >
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Default Language</span>
              </div>
              <strong className="text-[10px] uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-350">
                {profile.language === 'en' ? 'English' : 'Urdu (اردو)'}
              </strong>
            </button>

            {/* Cloud Sync Backup trigger */}
            <button 
              onClick={handleBackup}
              disabled={loading}
              className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Secure Cloud Sync Backup</span>
              </div>
              {loading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
              ) : (
                <span className="text-[9px] text-purple-600 hover:underline">Sync now</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}