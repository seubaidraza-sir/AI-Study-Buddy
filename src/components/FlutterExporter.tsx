import React, { useState } from 'react';
import { Copy, Check, Download, Code2, FolderTree, Cpu, Settings2, HelpCircle, FileText } from 'lucide-react';

export default function FlutterExporter() {
  const [activeTab, setActiveTab] = useState<'guide' | 'pubspec' | 'architecture' | 'ai_service' | 'auth_repo'>('guide');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeSnippets = {
    pubspec: `name: ai_study_buddy
description: A production-quality AI-powered study companion mobile application.
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

  # State Management & DI
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # Firebase Suite
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  cloud_firestore: ^4.13.3
  firebase_storage: ^11.5.3

  # Core AI & OCR
  google_generative_ai: ^0.2.0
  google_mlkit_text_recognition: ^0.11.0

  # Local Utilities & UI
  shared_preferences: ^2.2.2
  flutter_tts: ^3.8.5
  speech_to_text: ^6.3.0
  camera: ^0.10.5+5
  file_picker: ^6.1.1
  path_provider: ^2.1.1
  uuid: ^4.3.3
  intl: ^0.19.0
  
  # Styling & Animation
  google_fonts: ^6.1.0
  flutter_spinkit: ^5.2.0
  animate_do: ^3.3.4
  percent_indicator: ^4.0.1
  lucide_icons: ^0.300.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  riverpod_generator: ^2.3.9
  build_runner: ^2.4.8

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/onboarding/`,

    ai_service: `import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';

class GeminiService {
  final GenerativeModel _model;
  final GenerativeModel _jsonModel;

  GeminiService({required String apiKey})
      : _model = GenerativeModel(
          model: 'model: MODEL,',
          apiKey: apiKey,
          generationConfig: GenerationConfig(temperature: 0.7),
        ),
        _jsonModel = GenerativeModel(
          model: 'model: MODEL,',
          apiKey: apiKey,
          generationConfig: GenerationConfig(
            temperature: 0.2,
            responseMimeType: 'application/json',
          ),
        );

  /// Ask a question to the AI Tutor
  Future<String> askTutor({
    required String question,
    required List<Content> chatHistory,
    required String difficulty,
    required String subject,
  }) async {
    final systemPrompt = """
You are "AI Study Buddy", an expert academic tutor.
Subject: $subject
Difficulty Level: $difficulty

Provide comprehensive, step-by-step, highly clear academic responses.
Use formatting, bullet points, and equations for readable explanations.
""";

    final chat = _model.startChat(
      history: chatHistory,
      systemInstruction: Content.system(systemPrompt),
    );

    final response = await chat.sendMessage(Content.text(question));
    return response.text ?? "I'm sorry, I couldn't formulate a response.";
  }

  /// Generate structured summarized note
  Future<Map<String, dynamic>> generateSummary({
    required String content,
    required String focus,
  }) async {
    final prompt = """
Summarize the following study text. Focus on: $focus.
Provide the response strictly as a JSON object with:
- "summary": A brief general summary paragraph.
- "keyPoints": List of important bullet points.
- "definitions": List of objects with "term" and "definition".
- "examTips": List of test taking guidelines.

Text:
$content
""";

    final response = await _jsonModel.generateContent([Content.text(prompt)]);
    final jsonText = response.text ?? "{}";
    return jsonDecode(jsonText) as Map<String, dynamic>;
  }

  /// Generate customizable quiz
  Future<Map<String, dynamic>> generateQuiz({
    required String subject,
    required String topic,
    required String difficulty,
    required int count,
  }) async {
    final prompt = """
Generate a test with $count questions on $subject: $topic. Difficulty: $difficulty.
Provide the output strictly in JSON according to this structure:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq", // mcq, true_false, fill_blank
      "question": "question text",
      "options": ["opt1", "opt2", "opt3", "opt4"], // empty if fill_blank
      "correctAnswer": "correct option text or answer",
      "explanation": "educational details"
    }
  ]
}
""";

    final response = await _jsonModel.generateContent([Content.text(prompt)]);
    return jsonDecode(response.text ?? '{"questions":[]}') as Map<String, dynamic>;
  }
}`,

    auth_repo: `import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthRepository {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Stream of Auth State changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Get Current Logged In User
  User? get currentUser => _auth.currentUser;

  /// Sign up with Email & Password
  Future<UserCredential> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = userCredential.user;
      if (user != null) {
        // Create initial Firestore user profile document
        await _firestore.collection('users').doc(user.uid).set({
          'uid': user.uid,
          'name': name,
          'email': email,
          'streak': 1,
          'studyMinutes': 0,
          'joinedDate': DateTime.now().toIso8601String(),
          'language': 'en',
          'xp': 100,
          'level': 1,
        });
      }
      return userCredential;
    } on FirebaseAuthException catch (e) {
      throw Exception(e.message ?? 'Sign up failed.');
    }
  }

  /// Log in with Email & Password
  Future<UserCredential> logIn({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw Exception(e.message ?? 'Login failed.');
    }
  }

  /// Reset password link
  Future<void> sendPasswordReset(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  /// Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }
}`
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200 shadow-2xl overflow-hidden font-sans">
      {/* Exporter Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-purple-400" />
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 font-display">
              AI Study Buddy
            </h2>
            <p className="text-xs text-slate-400">Flutter Mobile Source Exporter</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 bg-purple-950/40 border border-purple-800/40 px-2 py-1 rounded text-xs text-purple-300">
          <Cpu className="h-3 w-3 animate-pulse" />
          <span>Flutter SDK 3.x</span>
        </div>
      </div>

      {/* Exporter Tabs */}
      <div className="flex bg-slate-950/60 p-1.5 border-b border-slate-800 text-xs overflow-x-auto space-x-1">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded transition ${
            activeTab === 'guide'
              ? 'bg-purple-600 text-white font-medium shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Setup Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('pubspec')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded transition ${
            activeTab === 'pubspec'
              ? 'bg-purple-600 text-white font-medium shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>pubspec.yaml</span>
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded transition ${
            activeTab === 'architecture'
              ? 'bg-purple-600 text-white font-medium shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="h-3.5 w-3.5" />
          <span>MVVM Plan</span>
        </button>
        <button
          onClick={() => setActiveTab('ai_service')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded transition ${
            activeTab === 'ai_service'
              ? 'bg-purple-600 text-white font-medium shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>GeminiService.dart</span>
        </button>
        <button
          onClick={() => setActiveTab('auth_repo')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded transition ${
            activeTab === 'auth_repo'
              ? 'bg-purple-600 text-white font-medium shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>AuthRepo.dart</span>
        </button>
      </div>

      {/* Exporter Content Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'guide' && (
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="bg-purple-950/20 border border-purple-900/40 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-purple-300 flex items-center space-x-1.5 font-display text-base">
                <span>Flutter Clean Architecture MVVM Package</span>
              </h3>
              <p className="text-xs text-slate-400">
                This project represents a fully production-grade Clean Architecture implementation in Flutter, integrating Gemini LLM, ML Kit, and Firebase Auth / Firestore.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-100 border-b border-slate-800 pb-1 font-display">
                1. System Setup Requirements
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                <li>Install the latest <strong>Flutter SDK</strong> stable channel.</li>
                <li>Set up <strong>Android Studio</strong> (for Gradle/NDK) or <strong>Xcode</strong> (for iOS CocoaPods).</li>
                <li>Configure a new project on the <strong>Firebase Console</strong>.</li>
                <li>Enable <strong>Email/Password Auth</strong> and <strong>Firestore Database</strong>.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-100 border-b border-slate-800 pb-1 font-display">
                2. Firebase Configuration Steps
              </h4>
              <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono space-y-2 text-slate-400">
                <p className="text-purple-400"># Android:</p>
                <p>1. Copy the <code className="text-slate-200">google-services.json</code> into <code className="text-slate-200">/android/app/</code></p>
                <p>2. Add the google-services dependency to root <code className="text-slate-200">build.gradle</code></p>
                
                <p className="text-purple-400 mt-2"># iOS:</p>
                <p>1. Open workspace in Xcode, drag <code className="text-slate-200">GoogleService-Info.plist</code> into Runner root.</p>
                <p>2. Set bundle identifiers to match.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-100 border-b border-slate-800 pb-1 font-display">
                3. Gemini API Key Configuration
              </h4>
              <p className="text-xs">
                To run the app securely, pass the Gemini API Key as a Dart Environment Variable or bundle it using a secrets config file. Run your Flutter app with:
              </p>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded font-mono text-xs">
                <span className="text-emerald-400 overflow-x-auto whitespace-nowrap select-all">
                  flutter run --dart-define=GEMINI_API_KEY="YOUR_KEY_HERE"
                </span>
                <button
                  onClick={() => handleCopy('flutter run --dart-define=GEMINI_API_KEY="YOUR_KEY_HERE"', 'run_cmd')}
                  className="p-1 hover:bg-slate-800 rounded ml-2"
                  title="Copy Command"
                >
                  {copied === 'run_cmd' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-4 flex space-x-2">
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(codeSnippets, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'ai_study_buddy_flutter_source.json';
                  a.click();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition"
              >
                <Download className="h-4 w-4" />
                <span>Download Code Kit (JSON)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pubspec' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">/pubspec.yaml</span>
              <button
                onClick={() => handleCopy(codeSnippets.pubspec, 'pubspec')}
                className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded text-purple-300 transition"
              >
                {copied === 'pubspec' ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy pubspec</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono overflow-x-auto text-slate-300 border border-slate-800 max-h-[480px]">
              {codeSnippets.pubspec}
            </pre>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <h4 className="font-semibold text-slate-200">Recommended Folder Tree:</h4>
              <pre className="font-mono text-slate-400 text-[11px] leading-tight overflow-x-auto max-h-[300px]">
{`lib/
├── main.dart
├── config/
│   ├── routes.dart
│   └── theme.dart
├── core/
│   ├── errors/
│   │   └── failures.dart
│   └── network/
│       └── gemini_client.dart
├── data/
│   ├── models/
│   │   ├── note_model.dart
│   │   ├── quiz_model.dart
│   │   └── user_model.dart
│   └── repositories/
│       ├── auth_repository_impl.dart
│       └── ai_repository_impl.dart
├── domain/
│   ├── entities/
│   └── repositories/
│       ├── auth_repository.dart
│       └── ai_repository.dart
└── presentation/
    ├── providers/
    │   ├── auth_provider.dart
    │   └── study_provider.dart
    └── views/
        ├── auth/
        │   ├── login_view.dart
        │   └── register_view.dart
        ├── dashboard/
        │   └── home_dashboard.dart
        ├── chat_tutor/
        │   └── chat_tutor_view.dart
        └── quiz/
            └── quiz_generator_view.dart`}
              </pre>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200 border-b border-slate-800 pb-1">MVVM Pattern Explanation</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>Model:</strong> Core pure business entities (such as Note, Flashcard, Quiz) holding no UI dependencies. Under <code className="text-slate-300">data/models/</code> they extend domain entities and provide JSON mapping helpers (<code className="text-slate-300">fromJson</code>, <code className="text-slate-300">toJson</code>).
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>View:</strong> Standard Flutter widgets (Stateful or ConsumerWidget). Interacts purely with ViewModels or Controllers via Riverpod providers to update states. Holds zero business logic.
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>ViewModel/Provider:</strong> Implemented via StateNotifier or AsyncNotifier from <code className="text-slate-300">flutter_riverpod</code>. Manages the state variables, pulls from Repositories asynchronously, and emits new immutable states, causing the view to redraw.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'ai_service' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">/lib/core/network/gemini_service.dart</span>
              <button
                onClick={() => handleCopy(codeSnippets.ai_service, 'ai_service')}
                className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded text-purple-300 transition"
              >
                {copied === 'ai_service' ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono overflow-x-auto text-slate-300 border border-slate-800 max-h-[480px]">
              {codeSnippets.ai_service}
            </pre>
          </div>
        )}

        {activeTab === 'auth_repo' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">/lib/data/repositories/auth_repository.dart</span>
              <button
                onClick={() => handleCopy(codeSnippets.auth_repo, 'auth_repo')}
                className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded text-purple-300 transition"
              >
                {copied === 'auth_repo' ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono overflow-x-auto text-slate-300 border border-slate-800 max-h-[480px]">
              {codeSnippets.auth_repo}
            </pre>
          </div>
        )}
      </div>

      {/* Footer credits */}
      <div className="p-3 border-t border-slate-800 text-center text-[10px] bg-slate-950 text-slate-500 font-mono">
        Designed for Google AI Studio &bull; Flutter MVVM SOLID
      </div>
    </div>
  );
}
