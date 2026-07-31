import React, { useState } from 'react';
import { Mail, Lock, User, Key, Check, AlertCircle, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { signup, login, resetPassword, googleLogin } from "../lib/auth";
import { saveUserProfile } from "../lib/firestore";
interface AuthProps {
  onSuccess: (profile: UserProfile) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  if (mode === "login") {
    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await login(email, password);

      onSuccess({
        name: userCredential.user.email?.split("@")[0] || "Student",
        email: userCredential.user.email || "",
        streak: 1,
        studyMinutes: 0,
        joinedDate: new Date().toLocaleDateString(),
        language: "en",
        avatar: "🦉",
        xp: 0,
        level: 1,
      });
    } catch (error: any) {
  console.error("Firebase Register Error:", error);
  console.log("Error code:", error.code);
  console.log("Error message:", error.message);
  setError(error.message);
}

    setLoading(false);
    return;
  }
  if (mode === "forgot") {
  if (!email) {
    setError("Please enter your email address.");
    setLoading(false);
    return;
  }

  try {
    await resetPassword(email);
    setSuccess("Password reset email sent! Check your inbox.");
  } catch (error: any) {
    setError(error.message);
  }

  setLoading(false);
  return;
}
if (mode === "register") {
  if (!name || !email || !password) {
    setError("Please fill in all fields.");
    setLoading(false);
    return;
  }

  try {
   const userCredential = await signup(name, email, password);

    setSuccess("Account created successfully!");

    onSuccess({
      name: name,
      email: userCredential.user.email || "",
      streak: 1,
      studyMinutes: 0,
      joinedDate: new Date().toLocaleDateString(),
      language: "en",
      avatar: "🦉",
      xp: 0,
      level: 1,
    });

  } catch (error: any) {
    setError(error.message);
  }

  setLoading(false);
  return;
}

setLoading(false);
  
};

 const handleGoogleSignIn = async () => {
  try {
    setLoading(true);

    const result = await googleLogin();
    const user = result.user;
await saveUserProfile(
  user.uid,
  user.displayName || "Student",
  user.email || ""
);
    onSuccess({
      name: user.displayName || "Student",
      email: user.email || "",
      streak: 1,
      studyMinutes: 0,
      joinedDate: new Date().toLocaleDateString(),
      language: "en",
      avatar: "🦉",
      xp: 0,
      level: 1,
    });

  } catch (error: any) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-6 justify-between font-sans">
      {/* Brand logo */}
      <div className="text-center space-y-2 mt-4">
        <div className="inline-flex p-3.5 bg-gradient-to-tr from-purple-500 to-indigo-600 text-white rounded-2xl shadow-md">
          <Sparkles className="h-7 w-7 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          AI Study Buddy
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Unlock the power of server-side academic AI models
        </p>
      </div>

      {/* Main card panel */}
      <form onSubmit={handleAuth} className="my-auto space-y-4 max-w-xs mx-auto w-full">
        {mode === 'forgot' ? (
          <div className="space-y-1.5 text-center mb-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Reset Password</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              We will email you step-by-step instructions to securely restore your credentials.
            </p>
          </div>
        ) : null}

        {error && (
          <div className="flex items-center space-x-1.5 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-[10px] text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-1.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-[10px] text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            <Check className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-3">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {mode === 'login' && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center shadow"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Log In' : mode === 'register' ? 'Register Account' : 'Send Reset Link'}
          </button>

          {mode !== 'forgot' && (
            <>
              <div className="flex items-center my-2 text-[10px] text-slate-400">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                <span className="px-2">or continue with</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center space-x-2 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.52 4.114-5.134 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.633 0 3.111.626 4.234 1.646l3.09-3.09C19.215 2.502 15.93 1.2 12.24 1.2c-6.075 0-11 4.925-11 11s4.925 11 11 11c5.542 0 10.514-3.996 10.514-11 0-.7-.063-1.378-.179-1.915H12.24z"
                  />
                </svg>
                <span>Google Sign-In</span>
              </button>
            </>
          )}
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="text-center text-[11px] text-slate-400 pb-2">
        {mode === 'login' ? (
          <p>
            Don't have an account?{' '}
            <button onClick={() => setMode('register')} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              Sign Up
            </button>
          </p>
        ) : mode === 'register' ? (
          <p>
            Already registered?{' '}
            <button onClick={() => setMode('login')} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              Log In
            </button>
          </p>
        ) : (
          <p>
            Remember your credentials?{' '}
            <button onClick={() => setMode('login')} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              Back to Log In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
