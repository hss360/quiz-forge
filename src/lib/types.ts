export interface QuizQuestion {
  id: number;
  type: 'mcq' | 'true_false';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizConfig {
  numQuestions: number;
  timePerQuestion: number; // seconds
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  questionId: number;
  selectedIndex: number | null;
  correct: boolean;
  timeSpent: number; // seconds
  pointsEarned: number;
}

export type AppState = 'upload' | 'configure' | 'loading' | 'playing' | 'review' | 'results';
