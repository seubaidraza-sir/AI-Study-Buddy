import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, Sparkles, Check, FileText, AlertCircle, RefreshCw, FlipHorizontal } from 'lucide-react';
import { Note, UserProfile } from '../types';

interface OCRScannerProps {
  profile: UserProfile;
  onAddXp: (xp: number) => void;
  onSaveNote: (note: Omit<Note, 'id' | 'date'>) => void;
  onGoBack: () => void;
}

export default function OCRScanner({ profile, onAddXp, onSaveNote, onGoBack }: OCRScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
const [aiExplanation, setAiExplanation] = useState("");
const [summary, setSummary] = useState<string[]>([]);
const [flashcards, setFlashcards] = useState<any[]>([]);
const [quiz, setQuiz] = useState<any[]>([]);
  // Scan outputs
  const [scanResult, setScanResult] = useState<{
    text: string;
    title: string;
    confidence: string;
    extractedTopics: string[];
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError('');
    setScanResult(null);
    setSaved(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not open camera. Permission may be blocked inside the sandboxed preview. Please utilize our Upload File tab below to scan notes!');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg');
      stopCamera();
      processOCR(base64Image, 'image/jpeg');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setScanResult(null);
    setSaved(false);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result as string;
      processOCR(base64Image, file.type);
    };
    reader.onerror = () => {
      setError('Could not read the uploaded image file.');
    };
    reader.readAsDataURL(file);
  };

  const processOCR = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setScanResult(data);
        onAddXp(25); // OCR scans award substantial study XP!
      } else {
        throw new Error(data.error || 'Failed to extract text from image.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Server error. Utilizing robust OCR model fallbacks.');
      // Offline mock fallback
      setScanResult({
        text: `### Handwritten Algebra Notes\n\n- **Quadratic Formula**: The formula is derived as:\n  $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n- **Discriminant ($D$)**:\n  - If $b^2 - 4ac > 0$: Two distinct real roots.\n  - If $b^2 - 4ac = 0$: One repeated real root.\n  - If $b^2 - 4ac < 0$: Two complex roots.\n\n*(Connect your GEMINI_API_KEY to run high-precision AI image text OCR!)*`,
        title: 'Handwritten Algebra Formulas',
        confidence: 'High',
        extractedTopics: ['Algebra', 'Quadratic Equations', 'Discriminant']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!scanResult) return;
    onSaveNote({
      title: scanResult.title || 'Scanned AI Note',
      content: scanResult.text,
      category: scanResult.extractedTopics?.[0] || 'Scanned',
      isFavorite: true
    });
    setSaved(true);
  };
  const handleExplain = async () => {
  if (!scanResult) return;

  setLoading(true);

  try {
    const response = await fetch("/api/gemini/study", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: scanResult.text,
      }),
    });

    if (!response.ok) {
      throw new Error("Study API failed");
    }

    const data = await response.json();

    setAiExplanation(data.explanation || "");

    setSummary(data.summary || []);

    setFlashcards(data.flashcards || []);

    setQuiz(data.quiz || []);
  } catch (err) {
    console.error(err);
    alert("Failed to generate AI study materials.");
  }

  setLoading(false);
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
            OCR Note Scanner
          </h2>
          <p className="text-[9px] text-slate-400">Scan handwritten or book notes</p>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-start space-x-1.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* State 1: Choose Camera or Upload */}
        {!cameraActive && !scanResult && !loading && (
          <div className="space-y-4 pt-4">
            <div className="p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-4 bg-white dark:bg-slate-900 shadow-sm">
              <Camera className="h-10 w-10 mx-auto text-purple-500 animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Camera Scan</h3>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Hold your handwritten note sheet or textbook chapter up to the lens and snap a snapshot.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Activate Camera</span>
              </button>
            </div>

            <div className="flex items-center text-[10px] text-slate-400">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              <span className="px-3 font-medium">Or upload file</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-900 hover:border-purple-400 rounded-2xl text-center cursor-pointer space-y-3 bg-white dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 transition"
            >
              <Upload className="h-8 w-8 mx-auto text-slate-400" />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">Choose image file</span>
                <p className="text-[9px] text-slate-400">Supports PNG, JPEG, WEBP snapshots up to 10MB</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
           
        )}

        {/* State 2: Camera Active Viewfinder */}
        {cameraActive && (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 shadow-md">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-purple-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-4/5 h-3/4 border-2 border-dashed border-white/50 rounded-lg"></div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={stopCamera}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 shadow"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Snap Snapshot</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden Canvas helper */}
        <canvas ref={canvasRef} className="hidden" />

        {/* State 3: Processing loading */}
        {loading && (
          <div className="py-12 text-center space-y-4">
            <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">AI Reading Note...</h3>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Gemini Multi-Modal API is transcribing handwriting, extracting equations, and structuring academic study guides.
              </p>
            </div>
          </div>
        )}

        {/* State 4: Display OCR Result */}
{scanResult && !loading && (
  <div className="space-y-4">

    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl flex items-center justify-between text-xs font-semibold text-purple-800 dark:text-purple-300">
      <span className="flex items-center space-x-2">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span>Text Successfully Extracted!</span>
      </span>

      <span className="text-[9px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-purple-200 text-purple-600 dark:text-purple-400">
        Confidence: {scanResult.confidence}
      </span>
    </div>

    <div className="space-y-3">

      <div>
        <label className="text-[9px] font-bold text-slate-400 uppercase">
          Suggested Note Title
        </label>

        <input
          type="text"
          value={scanResult.title}
          onChange={(e) =>
            setScanResult({
              ...scanResult,
              title: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        />
      </div>

      {scanResult.extractedTopics.length > 0 && (
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            Identified Topics
          </span>

          <div className="flex flex-wrap gap-2 mt-2">
            {scanResult.extractedTopics.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-[9px] font-bold text-slate-400 uppercase">
          Extracted Study Text
        </label>

        <div className="bg-white dark:bg-slate-900 border rounded-xl p-3 whitespace-pre-wrap">
          {scanResult.text}
        </div>
      </div>

    </div>

    {/* Buttons */}

    <div className="flex flex-col gap-2">

      <div className="flex gap-2">

        <button
          onClick={() => setScanResult(null)}
          className="flex-1 py-2 border rounded-lg"
        >
          Scan New
        </button>

        <button
          onClick={handleSaveToNotes}
          disabled={saved}
          className="flex-1 py-2 bg-purple-600 text-white rounded-lg"
        >
          {saved ? "Saved to Notes!" : "Import to Notes"}
        </button>

      </div>

      <button
        onClick={handleExplain}
        className="w-full py-2 bg-indigo-600 text-white rounded-lg"
      >
        🤖 Explain with AI
      </button>

    </div>

    {/* AI Explanation */}

    {aiExplanation && (
      <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 border">
        <h3 className="font-bold mb-2">
          🤖 AI Explanation
        </h3>

        <p className="whitespace-pre-wrap">
          {aiExplanation}
        </p>
      </div>
    )}

    {/* Summary */}

    {summary.length > 0 && (
      <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 border">
        <h3 className="font-bold mb-2">
          📄 Summary
        </h3>

        <ul className="list-disc pl-5">
          {summary.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )}
{/* Flashcards */}
{flashcards.length > 0 && (
  <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
    <h3 className="font-bold text-lg mb-2">
      🧠 Flashcards
    </h3>

    <div className="space-y-3">
      {flashcards.map((card, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-300 dark:border-slate-700 p-3"
        >
          <p className="font-semibold">
            Q: {card.question}
          </p>

          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            A: {card.answer}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
{/* Quiz */}
{quiz.length > 0 && (
  <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
    <h3 className="font-bold text-lg mb-3">
      📝 AI Quiz
    </h3>

    <div className="space-y-4">
      {quiz.map((q, index) => (
        <div
          key={index}
          className="border rounded-lg p-3 border-slate-300 dark:border-slate-700"
        >
          <p className="font-semibold mb-2">
            {index + 1}. {q.question}
          </p>

          <div className="space-y-2">
            {q.options?.map((option: string, i: number) => (
              <div
                key={i}
                className="rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2"
              >
                {option}
              </div>
            ))}
          </div>

          <p className="mt-3 text-green-600 font-semibold">
            ✅ Correct Answer: {q.answer}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
  </div>
)}

</div>
    </div>
  );
}