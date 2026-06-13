import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { quizService, questionService, userService, attemptService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Quiz, Question, User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Table, THead, TBody, Tr, Th, Td } from '../components/Table';
import { Skeleton } from '../components/Skeleton';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { 
  Users, BookOpen, HelpCircle, GraduationCap, Plus, Edit2, 
  Trash2, Upload, AlertCircle, BarChart3, Database, KeyRound, Sparkles 
} from 'lucide-react';
import { cn } from '../lib/utils';

// ==========================================
// ZOD VALIDATION SCHEMAS FOR ADMIN FORMS
// ==========================================
const quizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  topic: z.string().min(1, 'Topic is required').max(50),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

const questionSchema = z.object({
  quiz_id: z.coerce.number().min(1, 'Select a quiz'),
  question: z.string().min(1, 'Question text is required'),
  option_a: z.string().min(1, 'Option A is required'),
  option_b: z.string().min(1, 'Option B is required'),
  option_c: z.string().min(1, 'Option C is required'),
  option_d: z.string().min(1, 'Option D is required'),
  correct_answer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().optional(),
});

type QuizFields = z.infer<typeof quizSchema>;
type QuestionFields = z.infer<typeof questionSchema>;

export const AdminDashboard: React.FC = () => {
  const { user: currentAdmin } = useAuthStore();
  const { show: showToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<'stats' | 'quizzes' | 'questions' | 'users'>('stats');
  const [loading, setLoading] = useState(true);

  // States for database entities
  const [stats, setStats] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Filtering states for questions list
  const [filterQuizId, setFilterQuizId] = useState<string>('');

  // Modals controllers
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkQuizId, setBulkQuizId] = useState<string>('');
  const [bulkJsonText, setBulkJsonText] = useState('');

  // ==========================================
  // FORM BINDINGS
  // ==========================================
  const quizForm = useForm<QuizFields>({ resolver: zodResolver(quizSchema), defaultValues: { title: '', topic: 'DBMS', difficulty: 'Easy' } });
  const questionForm = useForm<QuestionFields>({ resolver: zodResolver(questionSchema), defaultValues: { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' } });

  // Load telemetry
  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const [statsData, quizzesData, questionsData, usersData] = await Promise.all([
        attemptService.getAdminDashboardStats(),
        quizService.getQuizzes(),
        questionService.getQuestions(),
        userService.getUsers()
      ]);
      setStats(statsData);
      setQuizzes(quizzesData.quizzes);
      setQuestions(questionsData.questions);
      setUsers(usersData.users);
    } catch {
      showToast('Could not load administrative repositories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // ==========================================
  // ACTIONS: QUIZ CRUD
  // ==========================================
  const onQuizSubmit = async (data: QuizFields) => {
    try {
      if (editingQuiz) {
        await quizService.updateQuiz(editingQuiz.id, data);
        showToast('Quiz details updated.', 'success');
      } else {
        await quizService.createQuiz(data);
        showToast('New practice quiz registered.', 'success');
      }
      setIsQuizModalOpen(false);
      setEditingQuiz(null);
      quizForm.reset({ title: '', topic: 'DBMS', difficulty: 'Easy' });
      fetchTelemetry();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Quiz modification failed.', 'error');
    }
  };

  const handleEditQuizClick = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    quizForm.setValue('title', quiz.title);
    quizForm.setValue('topic', quiz.topic);
    quizForm.setValue('difficulty', quiz.difficulty === 'Personalized' ? 'Easy' : quiz.difficulty);
    setIsQuizModalOpen(true);
  };

  const handleDeleteQuizClick = async (quizId: number) => {
    if (!window.confirm('Are you absolutely sure you want to delete this quiz? All nested questions and student attempts logs will be deleted!')) return;
    try {
      await quizService.deleteQuiz(quizId);
      showToast('Quiz and relational rows deleted.', 'success');
      fetchTelemetry();
    } catch {
      showToast('Could not delete quiz.', 'error');
    }
  };

  // ==========================================
  // ACTIONS: QUESTION CRUD
  // ==========================================
  const onQuestionSubmit = async (data: QuestionFields) => {
    try {
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, data);
        showToast('Question details updated.', 'success');
      } else {
        await questionService.addQuestion(data);
        showToast('New question saved to bank.', 'success');
      }
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      questionForm.reset({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' });
      fetchTelemetry();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to complete question save.', 'error');
    }
  };

  const handleEditQuestionClick = (q: any) => {
    setEditingQuestion(q);
    questionForm.setValue('quiz_id', q.quiz_id);
    questionForm.setValue('question', q.question);
    questionForm.setValue('option_a', q.option_a);
    questionForm.setValue('option_b', q.option_b);
    questionForm.setValue('option_c', q.option_c);
    questionForm.setValue('option_d', q.option_d);
    questionForm.setValue('correct_answer', q.correct_answer);
    questionForm.setValue('explanation', q.explanation || '');
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestionClick = async (qId: number) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      await questionService.deleteQuestion(qId);
      showToast('Question removed successfully.', 'success');
      fetchTelemetry();
    } catch {
      showToast('Question deletion failure.', 'error');
    }
  };

  // ==========================================
  // ACTIONS: BULK IMPORT
  // ==========================================
  const handleBulkSubmit = async () => {
    if (!bulkQuizId) {
      showToast('Please select a target quiz.', 'warning');
      return;
    }
    try {
      const parsed = JSON.parse(bulkJsonText);
      if (!Array.isArray(parsed)) {
        showToast('JSON input must be a valid array of objects.', 'error');
        return;
      }
      
      // Inject target quiz_id
      const payload = parsed.map((item: any) => ({
        ...item,
        quiz_id: Number(bulkQuizId)
      }));

      await questionService.bulkAddQuestions(payload);
      showToast(`Bulk loaded ${parsed.length} questions successfully!`, 'success');
      setIsBulkModalOpen(false);
      setBulkJsonText('');
      setBulkQuizId('');
      fetchTelemetry();
    } catch (err: any) {
      showToast('JSON syntax error or missing properties in questions list.', 'error');
    }
  };

  // ==========================================
  // ACTIONS: USER CONTROL
  // ==========================================
  const handleRoleToggle = async (userId: number, currentRole: string) => {
    if (userId === currentAdmin?.id) {
      showToast('Safety lock: You cannot alter your own admin role.', 'error');
      return;
    }
    const nextRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await userService.changeRole(userId, nextRole);
      showToast(`User role updated to ${nextRole}.`, 'success');
      fetchTelemetry();
    } catch {
      showToast('Could not alter user privileges.', 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (userId === currentAdmin?.id) {
      showToast('Safety lock: You cannot delete your own active administrator profile.', 'error');
      return;
    }
    if (!window.confirm('Delete this user account permanently?')) return;
    try {
      await userService.deleteUser(userId);
      showToast('User account wiped.', 'success');
      fetchTelemetry();
    } catch {
      showToast('User deletion failure.', 'error');
    }
  };

  // ==========================================
  // LOADING / ERROR RENDERS
  // ==========================================
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Filtered questions
  const filteredQuestions = filterQuizId === '' 
    ? questions 
    : questions.filter(q => q.quiz_id === Number(filterQuizId));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-150 tracking-tight flex items-center gap-2">
            <Database className="w-8 h-8 text-amber-500 animate-pulse" />
            Admin Control Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            System status monitoring, user role alterations, and mock sheet CRUD panel
          </p>
        </div>
      </div>

      {/* TABS NAVBAR */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        {[
          { key: 'stats', label: 'Dashboard Stats', icon: <BarChart3 className="w-4 h-4" /> },
          { key: 'quizzes', label: 'Manage Quizzes', icon: <BookOpen className="w-4 h-4" /> },
          { key: 'questions', label: 'Manage Questions', icon: <HelpCircle className="w-4 h-4" /> },
          { key: 'users', label: 'User Control', icon: <Users className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
              activeTab === tab.key
                ? "border-primary text-primary dark:border-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================
          TAB 1: STATS OVERVIEW & RECENT ACTIVITY
          ======================================================== */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6 animate-fade-in">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-primary shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Users</span>
                  <h4 className="text-xl font-black mt-0.5">{stats.total_users}</h4>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-650 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Quizzes</span>
                  <h4 className="text-xl font-black mt-0.5">{stats.total_quizzes}</h4>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-500 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Questions</span>
                  <h4 className="text-xl font-black mt-0.5">{stats.total_questions}</h4>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Attempts Recorded</span>
                  <h4 className="text-xl font-black mt-0.5">{stats.total_attempts}</h4>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scrolling table of recent students attempts */}
          <Card className="glass-card border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Recent Platform Activity</CardTitle>
              <CardDescription>Live feed of student quiz completions</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recent_activity && stats.recent_activity.length > 0 ? (
                <Table>
                  <THead>
                    <Tr>
                      <Th>Student</Th>
                      <Th>Quiz Attempted</Th>
                      <Th>Topic</Th>
                      <Th className="text-center">Accuracy %</Th>
                      <Th className="text-right">Timestamp</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {stats.recent_activity.map((act: any) => (
                      <Tr key={act.id}>
                        <Td className="font-bold text-slate-800 dark:text-slate-200">{act.user}</Td>
                        <Td className="text-slate-650 dark:text-slate-350">{act.quiz}</Td>
                        <Td>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                            {act.topic}
                          </span>
                        </Td>
                        <Td className="text-center">
                          <span className={cn(
                            "font-bold",
                            act.accuracy >= 75 ? 'text-emerald-500' : act.accuracy >= 60 ? 'text-amber-500' : 'text-rose-500'
                          )}>
                            {Math.round(act.accuracy)}%
                          </span>
                        </Td>
                        <Td className="text-right text-slate-400 text-xs">{act.attempted_at}</Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-slate-450">
                  No mock examinations have been finished by students yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================
          TAB 2: QUIZZES CRUD
          ======================================================== */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Registered Practice Sheets ({quizzes.length})</h3>
            
            <Button
              size="sm"
              onClick={() => {
                setEditingQuiz(null);
                quizForm.reset({ title: '', topic: 'DBMS', difficulty: 'Easy' });
                setIsQuizModalOpen(true);
              }}
              className="text-xs font-bold h-9"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create New Quiz
            </Button>
          </div>

          <Card className="glass-card border border-slate-200/50 dark:border-slate-850">
            <CardContent className="p-0">
              {quizzes.length > 0 ? (
                <Table>
                  <THead>
                    <Tr>
                      <Th>Quiz Title</Th>
                      <Th>Topic</Th>
                      <Th className="text-center">Difficulty</Th>
                      <Th className="text-center">Questions</Th>
                      <Th className="text-right">Actions</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {quizzes.map((quiz) => (
                      <Tr key={quiz.id}>
                        <Td className="font-bold text-slate-850 dark:text-slate-100">{quiz.title}</Td>
                        <Td>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                            {quiz.topic}
                          </span>
                        </Td>
                        <Td className="text-center">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {quiz.difficulty}
                          </span>
                        </Td>
                        <Td className="text-center font-bold">{quiz.question_count}</Td>
                        <Td className="text-right flex items-center justify-end gap-1 px-6">
                          <button
                            onClick={() => handleEditQuizClick(quiz)}
                            className="p-1.5 text-slate-450 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                            title="Edit details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteQuizClick(quiz.id)}
                            className="p-1.5 text-slate-450 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                            title="Delete quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No practice quizzes available. Create one to populate tables.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================
          TAB 3: QUESTIONS CRUD & BULK IMPORT
          ======================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            {/* Filter by quiz */}
            <div className="w-64">
              <Select
                options={[
                  { label: 'Show All Questions', value: '' },
                  ...quizzes.map(q => ({ label: q.title, value: String(q.id) }))
                ]}
                value={filterQuizId}
                onChange={(e) => setFilterQuizId(e.target.value)}
              />
            </div>

            {/* Ingestion Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkModalOpen(true)}
                className="text-xs font-bold border-slate-200"
              >
                <Upload className="w-4 h-4 mr-1.5" />
                Bulk Import (JSON)
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setEditingQuestion(null);
                  questionForm.reset({ quiz_id: quizzes[0]?.id || 1, question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' });
                  setIsQuestionModalOpen(true);
                }}
                className="text-xs font-bold"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Question
              </Button>
            </div>
          </div>

          <Card className="glass-card border border-slate-200/50 dark:border-slate-850">
            <CardContent className="p-0">
              {filteredQuestions.length > 0 ? (
                <Table>
                  <THead>
                    <Tr>
                      <Th>Quiz Group</Th>
                      <Th>Question Text</Th>
                      <Th className="text-center">Answer Key</Th>
                      <Th className="text-right">Actions</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {filteredQuestions.map((q) => (
                      <Tr key={q.id}>
                        <Td className="max-w-[150px] truncate font-bold text-slate-500 dark:text-slate-400">
                          {q.quiz_title}
                        </Td>
                        <Td className="max-w-[320px] truncate text-slate-850 dark:text-slate-100 font-medium">
                          {q.question}
                        </Td>
                        <Td className="text-center font-extrabold text-emerald-500">
                          Option {q.correct_answer}
                        </Td>
                        <Td className="text-right flex items-center justify-end gap-1 px-6">
                          <button
                            onClick={() => handleEditQuestionClick(q)}
                            className="p-1.5 text-slate-450 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                            title="Edit question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteQuestionClick(q.id)}
                            className="p-1.5 text-slate-450 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No questions found in this sub-repository.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================
          TAB 4: USER CONTROL
          ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Registered Accounts ({users.length})</h3>

          <Card className="glass-card border border-slate-200/50 dark:border-slate-850">
            <CardContent className="p-0">
              {users.length > 0 ? (
                <Table>
                  <THead>
                    <Tr>
                      <Th>User Profile</Th>
                      <Th>Email Address</Th>
                      <Th className="text-center">Active Role</Th>
                      <Th className="text-right">Administration</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {users.map((u) => (
                      <Tr key={u.id}>
                        <Td className="font-bold text-slate-850 dark:text-slate-100">{u.name}</Td>
                        <Td className="text-slate-650 dark:text-slate-350">{u.email}</Td>
                        <Td className="text-center">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold border",
                            u.role === 'admin'
                              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-850"
                          )}>
                            {u.role === 'admin' ? 'SYSTEM ADMIN' : 'STUDENT'}
                          </span>
                        </Td>
                        <Td className="text-right flex items-center justify-end gap-2 px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={u.id === currentAdmin?.id}
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            className="text-[10px] h-8 font-bold border-slate-200"
                          >
                            Toggle Role
                          </Button>

                          <button
                            disabled={u.id === currentAdmin?.id}
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-slate-450 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none"
                            title="Delete User account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  No accounts found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================
          MODAL: QUIZ CREATION/EDITING
          ======================================================== */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => {
          setIsQuizModalOpen(false);
          setEditingQuiz(null);
        }}
        title={editingQuiz ? 'Edit Quiz Details' : 'Create Practice Quiz'}
        description="Register or modify placement sheets. Topics populate in user directories."
      >
        <form onSubmit={quizForm.handleSubmit(onQuizSubmit)} className="space-y-4 pt-2">
          <Input
            label="Quiz Sheet Title"
            placeholder="e.g. Memory allocation scheduling models"
            error={quizForm.formState.errors.title?.message}
            {...quizForm.register('title')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject Topic"
              options={[
                { label: 'DBMS', value: 'DBMS' },
                { label: 'Operating Systems', value: 'Operating Systems' },
                { label: 'Computer Networks', value: 'Computer Networks' },
                { label: 'OOPs', value: 'OOPs' },
                { label: 'Aptitude', value: 'Aptitude' },
                { label: 'Java', value: 'Java' },
                { label: 'Python', value: 'Python' },
                { label: 'DSA', value: 'DSA' },
              ]}
              error={quizForm.formState.errors.topic?.message}
              {...quizForm.register('topic')}
            />

            <Select
              label="Difficulty Level"
              options={[
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' },
              ]}
              error={quizForm.formState.errors.difficulty?.message}
              {...quizForm.register('difficulty')}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsQuizModalOpen(false);
                setEditingQuiz(null);
              }}
            >
              Cancel
            </Button>
            
            <Button type="submit">
              {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          MODAL: QUESTION CREATION/EDITING
          ======================================================== */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        title={editingQuestion ? 'Edit Question Properties' : 'Create Question Box'}
        description="Insert technical problems with options, correct answer triggers, and comprehensive descriptions."
      >
        <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4 pt-2">
          {/* Target Quiz list selection */}
          <Select
            label="Target Quiz Sheet"
            options={quizzes.map(q => ({ label: q.title, value: String(q.id) }))}
            error={questionForm.formState.errors.quiz_id?.message}
            {...questionForm.register('quiz_id')}
          />

          <Input
            label="Question Statement"
            placeholder="What is the time complexity of..."
            error={questionForm.formState.errors.question?.message}
            {...questionForm.register('question')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Option A"
              placeholder="Choice A details"
              error={questionForm.formState.errors.option_a?.message}
              {...questionForm.register('option_a')}
            />
            
            <Input
              label="Option B"
              placeholder="Choice B details"
              error={questionForm.formState.errors.option_b?.message}
              {...questionForm.register('option_b')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Option C"
              placeholder="Choice C details"
              error={questionForm.formState.errors.option_c?.message}
              {...questionForm.register('option_c')}
            />
            
            <Input
              label="Option D"
              placeholder="Choice D details"
              error={questionForm.formState.errors.option_d?.message}
              {...questionForm.register('option_d')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Correct Answer Key"
              options={[
                { label: 'A', value: 'A' },
                { label: 'B', value: 'B' },
                { label: 'C', value: 'C' },
                { label: 'D', value: 'D' },
              ]}
              error={questionForm.formState.errors.correct_answer?.message}
              {...questionForm.register('correct_answer')}
            />
          </div>

          {/* Explanation Text */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase ml-1">
              Detailed Solution & Explanation
            </label>
            <textarea
              className="flex min-h-[90px] w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Provide a step-by-step resolution showing why the correct key is correct..."
              {...questionForm.register('explanation')}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsQuestionModalOpen(false);
                setEditingQuestion(null);
              }}
            >
              Cancel
            </Button>
            
            <Button type="submit">
              {editingQuestion ? 'Update Question' : 'Save Question'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          MODAL: BULK JSON IMPORT
          ======================================================== */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setBulkJsonText('');
        }}
        title="Bulk Import Placement Sheets"
        description="Paste an array of questions in raw JSON formats to load them instantly."
      >
        <div className="space-y-4 pt-2">
          {/* Target Quiz list selection */}
          <Select
            label="Target Quiz Sheet"
            options={[
              { label: 'Select target quiz...', value: '' },
              ...quizzes.map(q => ({ label: q.title, value: String(q.id) }))
            ]}
            value={bulkQuizId}
            onChange={(e) => setBulkQuizId(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase ml-1 flex justify-between">
              <span>JSON QUESTIONS ARRAY</span>
              <span className="text-[10px] text-blue-500 font-bold lowercase tracking-normal">Check JSON schema details below</span>
            </label>
            <textarea
              className="flex min-h-[220px] w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-mono shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-100"
              placeholder={`[\n  {\n    "question": "Which of the following is correct?",\n    "option_a": "DBMS",\n    "option_b": "SQL",\n    "option_c": "RDBMS",\n    "option_d": "All of these",\n    "correct_answer": "D",\n    "explanation": "Everything is part of..."\n  }\n]`}
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-500 font-medium leading-relaxed">
            <span className="font-bold block text-slate-700 dark:text-slate-350 mb-1">
              Required JSON Attributes per Question Object:
            </span>
            - <span className="font-mono text-blue-550">question</span> (String)<br />
            - <span className="font-mono text-blue-550">option_a</span>, <span className="font-mono text-blue-550">option_b</span>, <span className="font-mono text-blue-550">option_c</span>, <span className="font-mono text-blue-550">option_d</span> (String)<br />
            - <span className="font-mono text-blue-550">correct_answer</span> (Char: "A" | "B" | "C" | "D")<br />
            - <span className="font-mono text-blue-550">explanation</span> (String, optional)
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsBulkModalOpen(false);
                setBulkJsonText('');
              }}
            >
              Cancel
            </Button>
            
            <Button onClick={handleBulkSubmit} className="bg-emerald-500 hover:bg-emerald-600">
              Bulk Load Sheets
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
