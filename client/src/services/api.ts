import axios from 'axios';
import { 
  User, Quiz, Question, Attempt, Bookmark, 
  StudentAnalytics, AdminAnalytics 
} from '../types';

// Set up base Axios configuration
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token if exists in local storage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('prep_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Redirect to login or clear session on token expiration (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and reload to trigger login redirect
      localStorage.removeItem('prep_token');
      localStorage.removeItem('prep_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// SERVICE LAYER ENDPOINTS
// ==========================================

export const authService = {
  register: async (payload: any) => {
    const response = await API.post<{ message: string; access_token: string; user: User }>('/auth/register', payload);
    return response.data;
  },
  login: async (payload: any) => {
    const response = await API.post<{ message: string; access_token: string; user: User }>('/auth/login', payload);
    return response.data;
  },
  getProfile: async () => {
    const response = await API.get<{ user: User }>('/auth/profile');
    return response.data;
  },
};

export const quizService = {
  getQuizzes: async (params?: { topic?: string; difficulty?: string; search?: string; page?: number; limit?: number }) => {
    const response = await API.get<{ 
      quizzes: Quiz[]; 
      total?: number; 
      page?: number; 
      pages?: number 
    }>('/quizzes', { params });
    return response.data;
  },
  getQuiz: async (id: number) => {
    const response = await API.get<{ quiz: Quiz & { questions: Question[] } }>(`/quizzes/${id}`);
    return response.data;
  },
  createQuiz: async (payload: Partial<Quiz>) => {
    const response = await API.post<{ message: string; quiz: Quiz }>('/quizzes', payload);
    return response.data;
  },
  updateQuiz: async (id: number, payload: Partial<Quiz>) => {
    const response = await API.put<{ message: string; quiz: Quiz }>(`/quizzes/${id}`, payload);
    return response.data;
  },
  deleteQuiz: async (id: number) => {
    const response = await API.delete<{ message: string }>(`/quizzes/${id}`);
    return response.data;
  },
  generateFromSyllabus: async (
    payload: FormData | { syllabus_text: string; num_questions: number; api_key?: string },
    customApiKey?: string
  ) => {
    const headers: Record<string, string> = {};
    if (customApiKey) {
      headers['X-Gemini-Key'] = customApiKey;
    }
    
    if (payload instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
      const response = await API.post<{ message: string; quiz_id: number }>('/quizzes/generate-from-syllabus', payload, { headers });
      return response.data;
    } else {
      const response = await API.post<{ message: string; quiz_id: number }>('/quizzes/generate-from-syllabus', payload, { headers });
      return response.data;
    }
  },
};

export const questionService = {
  getQuestions: async (params?: { quiz_id?: number; page?: number; limit?: number }) => {
    const response = await API.get<{ 
      questions: (Question & { quiz_title: string })[]; 
      total?: number; 
      page?: number; 
      pages?: number 
    }>('/questions', { params });
    return response.data;
  },
  addQuestion: async (payload: Partial<Question>) => {
    const response = await API.post<{ message: string; question: Question }>('/questions', payload);
    return response.data;
  },
  bulkAddQuestions: async (payload: Partial<Question>[]) => {
    const response = await API.post<{ message: string; questions: Question[] }>('/questions', payload);
    return response.data;
  },
  updateQuestion: async (id: number, payload: Partial<Question>) => {
    const response = await API.put<{ message: string; question: Question }>(`/questions/${id}`, payload);
    return response.data;
  },
  deleteQuestion: async (id: number) => {
    const response = await API.delete<{ message: string }>(`/questions/${id}`);
    return response.data;
  },
};

export const attemptService = {
  submitAttempt: async (payload: { quiz_id: number; score: number; total_questions: number; time_taken: number }) => {
    const response = await API.post<{ message: string; attempt: Attempt }>('/attempts', payload);
    return response.data;
  },
  getAttemptHistory: async () => {
    const response = await API.get<{ attempts: Attempt[] }>('/attempts/history');
    return response.data;
  },
  getStudentAnalytics: async () => {
    const response = await API.get<StudentAnalytics>('/attempts/analytics');
    return response.data;
  },
  getAdminDashboardStats: async () => {
    const response = await API.get<AdminAnalytics>('/attempts/admin/dashboard');
    return response.data;
  },
};

export const bookmarkService = {
  toggleBookmark: async (questionId: number) => {
    const response = await API.post<{ message: string; bookmarked: boolean }>('/bookmarks', { question_id: questionId });
    return response.data;
  },
  getBookmarks: async () => {
    const response = await API.get<{ bookmarks: Bookmark[] }>('/bookmarks');
    return response.data;
  },
};

export const userService = {
  getUsers: async () => {
    const response = await API.get<{ users: User[] }>('/users');
    return response.data;
  },
  changeRole: async (userId: number, role: string) => {
    const response = await API.put<{ message: string; user: User }>(`/users/${userId}/role`, { role });
    return response.data;
  },
  deleteUser: async (userId: number) => {
    const response = await API.delete<{ message: string }>(`/users/${userId}`);
    return response.data;
  },
};

export default API;
