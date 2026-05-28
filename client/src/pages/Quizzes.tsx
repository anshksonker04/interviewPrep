import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { useDebounce } from '../hooks/useDebounce';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { Search, HelpCircle, Clock, ArrowRight, BookOpenCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export const Quizzes: React.FC = () => {
  const { quizzes, fetchQuizzes, isLoading, startQuiz } = useQuizStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    fetchQuizzes({ search: debouncedSearch, topic, difficulty });
  }, [debouncedSearch, topic, difficulty, fetchQuizzes]);

  const handleStartQuiz = async (quizId: number) => {
    try { await startQuiz(quizId); navigate(`/quiz/${quizId}`); } catch {}
  };

  const topicsList = [
    { label: 'All Topics', value: '' },
    { label: 'DBMS', value: 'DBMS' },
    { label: 'Operating Systems', value: 'Operating Systems' },
    { label: 'Computer Networks', value: 'Computer Networks' },
    { label: 'OOPs', value: 'OOPs' },
    { label: 'Aptitude', value: 'Aptitude' },
    { label: 'Java', value: 'Java' },
    { label: 'Python', value: 'Python' },
    { label: 'DSA', value: 'DSA' },
  ];

  const difficultiesList = [
    { label: 'All Difficulties', value: '' },
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' },
  ];

  const difficultyConfig = {
    Easy:   { cls: 'badge-emerald', dot: 'bg-emerald-500' },
    Medium: { cls: 'badge-amber',   dot: 'bg-amber-500'   },
    Hard:   { cls: 'badge-rose',    dot: 'bg-rose-500'    },
    Personalized: { cls: 'badge-violet', dot: 'bg-violet-500' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Practice Quizzes</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
          Select a subject, test your speed, and review solutions instantly
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-[34px] text-zinc-400 w-4 h-4" />
            <Input
              label="Search"
              type="text"
              placeholder="e.g. SQL Fundamentals, Memory Management..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Select label="Topic" options={topicsList} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Select label="Difficulty" options={difficultiesList} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Quiz grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const diff = difficultyConfig[quiz.difficulty as keyof typeof difficultyConfig] || difficultyConfig.Easy;
            return (
              <Card key={quiz.id} className="flex flex-col group cursor-default">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="badge-blue px-2 py-0.5 rounded text-[10px] font-bold">
                      {quiz.topic}
                    </span>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5', diff.cls)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', diff.dot)} />
                      {quiz.difficulty}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-3">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-600 mt-3">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {quiz.question_count} questions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {quiz.question_count * 3} min
                    </span>
                  </div>
                </CardContent>

                <div className="px-5 pb-5 pt-0">
                  <div className="h-px bg-zinc-100 dark:bg-white/[0.04] mb-4" />
                  <Button
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="w-full"
                    size="sm"
                  >
                    Start Quiz
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border border-dashed border-zinc-200 dark:border-white/[0.06]">
          <CardContent className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-zinc-400">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No quizzes found</h3>
            <p className="text-xs text-zinc-500 max-w-xs">Try adjusting your search or filter settings.</p>
            <Button size="sm" onClick={() => { setSearch(''); setTopic(''); setDifficulty(''); }} className="mt-2">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
