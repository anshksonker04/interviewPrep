export type UserRole = 'student' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Question {
  id: number;
  quiz_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  quiz_title?: string;
}

export interface Quiz {
  id: number;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Personalized';
  question_count: number;
  created_at: string;
  questions?: Question[];
}

export interface Attempt {
  id: number;
  user_id: number;
  quiz_id: number;
  quiz_title: string;
  quiz_topic: string;
  score: number;
  total_questions: number;
  accuracy: number;
  time_taken: number; // in seconds
  attempted_at: string;
}

export interface Bookmark {
  id: number;
  user_id: number;
  question_id: number;
  question: Question & {
    quiz_title: string;
    quiz_topic: string;
    quiz_difficulty: 'Easy' | 'Medium' | 'Hard' | 'Personalized';
  };
}

export interface TopicStat {
  topic: string;
  attempts: number;
  accuracy: number;
}

export interface ProgressStat {
  quiz: string;
  accuracy: number;
  date: string;
}

export interface StudentAnalytics {
  total_attempts: number;
  average_score: number;
  average_accuracy: number;
  streak: number;
  topic_performance: TopicStat[];
  recent_progress: ProgressStat[];
  strong_topics: string[];
  weak_topics: string[];
}

export interface RecentActivity {
  id: number;
  user: string;
  quiz: string;
  topic: string;
  accuracy: number;
  attempted_at: string;
}

export interface PopularTopic {
  topic: string;
  attempts: number;
}

export interface AdminAnalytics {
  total_users: number;
  total_quizzes: number;
  total_questions: number;
  total_attempts: number;
  popular_topics: PopularTopic[];
  recent_activity: RecentActivity[];
}
