export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type Topic = 'Execution Context' | 'Call Stack' | 'Hoisting' | 'Temporal Dead Zone' | 'Scope' | 'Variable Declarations' | 'Parameters vs Arguments' | 'Shadowing' | 'Closures' | 'JS Engine' | 'Functions' | 'First Class Functions' | 'Higher-Order Functions' | 'Event Loop' | 'Microtask Queue' | 'Promises' | 'Async/Await' | 'this Keyword' | 'Bind/Call/Apply' | 'Final' | 'All';

export interface Question {
  id: number;
  topic: Topic | string;
  difficulty: DifficultyLevel;
  question: string;
  detailed_answer: string;
  code_snippet?: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  answers: Record<number, boolean>; // true = reviewed, false = skipped
  isFinished: boolean;
  activeTopic: Topic | string;
  activeDifficulty: DifficultyLevel | 'All';
  quizHistory: QuizSession[];
}

export interface QuizSession {
  id: string;
  date: string;
  topic: Topic | string;
  difficulty: string;
  score: number; // total reviewed
  total: number;
}
