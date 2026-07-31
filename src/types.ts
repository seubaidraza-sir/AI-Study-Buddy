export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  isFavorite: boolean;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  dateCreated: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  score?: number; // Score obtained, e.g. 80 out of 100
  totalQuestions?: number;
  dateTaken?: string;
}

export interface ScheduleItem {
  time: string;
  subject: string;
  activity: string;
  duration: string;
}

export interface DaySchedule {
  day: string;
  topics: ScheduleItem[];
}

export interface StudyPlan {
  id: string;
  title: string;
  schedule: DaySchedule[];
  weeklyTips: string[];
  dateCreated: string;
}

export interface UserProfile {
  name: string;
  email: string;
  streak: number;
  studyMinutes: number;
  joinedDate: string;
  language: 'en' | 'ur';
  avatar: string;
  xp: number;
  level: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  dateUnlocked?: string;
  points: number;
}

export interface PrebuiltSubject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  chapters: string[];
}
