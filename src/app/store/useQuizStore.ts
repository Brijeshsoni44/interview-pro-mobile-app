import { create } from 'zustand';
import { QuizState, Topic, DifficultyLevel, QuizSession, Question } from '../../shared/types';
import rawQuestions from '../../data/questions.json';

type QuizStore = QuizState & {
  setFilter: (topic: Topic | string, difficulty: DifficultyLevel | 'All') => void;
  startQuiz: () => void;
  markRevealed: (questionId: number) => void;
  nextQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
};

export const useQuizStore = create<QuizStore>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  answers: {}, // Tracks if a question was revealed/reviewed
  isFinished: false,
  activeTopic: 'All',
  activeDifficulty: 'All',
  quizHistory: [],

  setFilter: (topic, difficulty) => set({ activeTopic: topic, activeDifficulty: difficulty }),

  startQuiz: () => {
    const { activeTopic, activeDifficulty } = get();
    // Filter questions based on selection
    let filteredQuestions = [...rawQuestions] as Question[];
    
    if (activeTopic !== 'All') {
      filteredQuestions = filteredQuestions.filter(q => q.topic === activeTopic);
    }
    
    if (activeDifficulty !== 'All') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === activeDifficulty);
    }

    // Shuffle and pick top 10
    filteredQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = filteredQuestions.slice(0, 10);

    set({
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      score: 0,
      answers: {},
      isFinished: false,
    });
  },

  markRevealed: (questionId) => {
    const { answers, score } = get();
    if (answers[questionId]) return; // Already reviewed

    set({
      answers: { ...answers, [questionId]: true },
      score: score + 1, // Every reviewed question gives a point
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      get().finishQuiz();
    }
  },

  finishQuiz: () => {
    const { score, questions, activeTopic, activeDifficulty, quizHistory } = get();
    const session: QuizSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      topic: activeTopic,
      difficulty: activeDifficulty,
      score,
      total: questions.length,
    };

    set({
      isFinished: true,
      quizHistory: [...quizHistory, session],
    });
  },

  resetQuiz: () => set({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    answers: {},
    isFinished: false,
  }),
}));
