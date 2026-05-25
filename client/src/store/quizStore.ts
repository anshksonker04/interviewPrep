import { create } from 'zustand';
import { Quiz, Question, Attempt, Bookmark } from '../types';
import { quizService, attemptService, bookmarkService } from '../services/api';

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: (Quiz & { questions: Question[] }) | null;
  bookmarkedQuestionIds: Set<number>;
  bookmarks: Bookmark[];
  
  // Active test runner variables
  isQuizActive: boolean;
  currentQuestionIndex: number;
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  timeRemaining: number;
  timeTaken: number;
  quizResult: Attempt | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchQuizzes: (params?: any) => Promise<void>;
  fetchQuizDetails: (quizId: number) => Promise<void>;
  startQuiz: (quizId: number) => Promise<void>;
  selectAnswer: (questionId: number, option: 'A' | 'B' | 'C' | 'D') => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitQuiz: () => Promise<Attempt>;
  endQuizSession: () => void;
  
  // Bookmarks
  fetchBookmarks: () => Promise<void>;
  toggleBookmark: (questionId: number) => Promise<boolean>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  bookmarkedQuestionIds: new Set<number>(),
  bookmarks: [],

  isQuizActive: false,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  timeTaken: 0,
  quizResult: null,
  isLoading: false,
  error: null,

  fetchQuizzes: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await quizService.getQuizzes(params);
      set({ quizzes: data.quizzes, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to load quizzes.', isLoading: false });
    }
  },

  fetchQuizDetails: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await quizService.getQuiz(quizId);
      set({ currentQuiz: data.quiz, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to load quiz details.', isLoading: false });
    }
  },

  startQuiz: async (quizId) => {
    set({ isLoading: true, error: null, quizResult: null });
    try {
      const data = await quizService.getQuiz(quizId);
      const questionCount = data.quiz.questions.length;
      
      // Standard timer calculation: 3 minutes (180 seconds) per question
      const calculatedDuration = questionCount * 180;

      set({
        currentQuiz: data.quiz,
        isQuizActive: true,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: calculatedDuration,
        timeTaken: 0,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: 'Could not launch the quiz session.', isLoading: false });
    }
  },

  selectAnswer: (questionId, option) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: option
      }
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentQuiz } = get();
    if (!currentQuiz) return;
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  submitQuiz: async () => {
    const { currentQuiz, answers, timeRemaining, isLoading } = get();
    if (!currentQuiz || isLoading) throw new Error('No active quiz session found.');

    set({ isLoading: true });

    // Calculate score
    let score = 0;
    currentQuiz.questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected && selected === q.correct_answer) {
        score += 1;
      }
    });

    const totalQuestions = currentQuiz.questions.length;
    // Calculated elapsed time
    const totalDuration = totalQuestions * 180;
    const timeTaken = totalDuration - timeRemaining;

    try {
      const data = await attemptService.submitAttempt({
        quiz_id: currentQuiz.id,
        score,
        total_questions: totalQuestions,
        time_taken: timeTaken > 0 ? timeTaken : 10
      });
      
      set({
        quizResult: data.attempt,
        isQuizActive: false,
        isLoading: false
      });

      return data.attempt;
    } catch (err: any) {
      set({ error: 'Failed to submit quiz attempt.', isLoading: false });
      throw err;
    }
  },

  endQuizSession: () => {
    set({
      isQuizActive: false,
      currentQuiz: null,
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 0,
      quizResult: null
    });
  },

  fetchBookmarks: async () => {
    try {
      const data = await bookmarkService.getBookmarks();
      const ids = new Set(data.bookmarks.map(b => b.question_id));
      set({ bookmarks: data.bookmarks, bookmarkedQuestionIds: ids });
    } catch (err) {
      console.error('Could not fetch bookmarks', err);
    }
  },

  toggleBookmark: async (questionId) => {
    try {
      const data = await bookmarkService.toggleBookmark(questionId);
      
      set((state) => {
        const nextIds = new Set(state.bookmarkedQuestionIds);
        if (data.bookmarked) {
          nextIds.add(questionId);
        } else {
          nextIds.delete(questionId);
        }
        return { bookmarkedQuestionIds: nextIds };
      });
      
      // Refresh bookmarks list
      get().fetchBookmarks();
      return data.bookmarked;
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
      return false;
    }
  }
}));
