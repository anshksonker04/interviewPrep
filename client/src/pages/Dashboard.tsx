import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptService } from '../services/api';
import { StudentAnalytics, Attempt } from '../types';
import { useToastStore } from '../store/toastStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Table, THead, TBody, Tr, Th, Td } from '../components/Table';
import { Skeleton } from '../components/Skeleton';
import { Button } from '../components/Button';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell
} from 'recharts';
import {
  Award, Flame, Percent, CheckCircle2,
  BookOpen, ArrowUpRight, TrendingUp, Zap, AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToastStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [analyticsData, historyData] = await Promise.all([
          attemptService.getStudentAnalytics(),
          attemptService.getAttemptHistory()
        ]);
        setAnalytics(analyticsData);
        setRecentAttempts(historyData.attempts.slice(0, 5));
      } catch {
        showToast('Could not load dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [showToast]);

  const CHART_COLORS = ['#8b5cf6', '#6d28d9', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4', '#14b8a6'];

  const TOOLTIP_STYLE = {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    color: '#e4e4e7',
    fontSize: '12px',
    padding: '8px 12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  };

  const getGreetingMessage = () => {
    if (!analytics || analytics.total_attempts === 0) return 'Start your first quiz to reveal performance insights.';
    if (analytics.average_accuracy >= 75) return 'Excellent! You are exceeding standard technical benchmarks.';
    if (analytics.average_accuracy >= 60) return 'Good consistency. Focus on weak areas to cross the 80% mark.';
    return 'Keep practicing. Consistency is the key to mastering technical interviews.';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-violet-500/15 dark:border-violet-500/10 bg-gradient-to-br from-violet-600/10 via-violet-500/5 to-transparent dark:from-violet-600/10 dark:via-violet-500/5 dark:to-[#0f0f0f] p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.12),transparent_60%)]" />
        <div className="absolute right-6 bottom-0 opacity-5 pointer-events-none">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-violet-500/10 border border-violet-500/15 text-violet-600 dark:text-violet-400 mb-3">
              <Zap className="w-3 h-3" /> PrepPortal
            </span>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
              Master Your Placement Exams
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1.5 max-w-md">{getGreetingMessage()}</p>
          </div>
          <Button onClick={() => navigate('/quizzes')} className="self-start md:self-center shrink-0">
            Start Practicing
            <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Quizzes Done',
            value: analytics?.total_attempts || 0,
            icon: <CheckCircle2 className="w-4 h-4" />,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-500/8 dark:bg-violet-500/10',
          },
          {
            label: 'Avg. Accuracy',
            value: analytics?.average_accuracy ? `${Math.round(analytics.average_accuracy)}%` : '0%',
            icon: <Percent className="w-4 h-4" />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-500/8 dark:bg-emerald-500/10',
          },
          {
            label: 'Daily Streak',
            value: `${analytics?.streak || 0}d`,
            icon: <Flame className="w-4 h-4" />,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-500/8 dark:bg-amber-500/10',
          },
          {
            label: 'Avg. Score',
            value: analytics?.average_score ? `${Math.round(analytics.average_score)}%` : '0%',
            icon: <Award className="w-4 h-4" />,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-500/8 dark:bg-blue-500/10',
          },
        ].map((stat) => (
          <Card key={stat.label} className="glow-hover">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {analytics && analytics.total_attempts > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Accuracy trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                <CardTitle>Accuracy Trend</CardTitle>
              </div>
              <CardDescription>Performance rate (%) over last 10 attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.recent_progress} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(161,161,170,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'rgba(161,161,170,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2.5}
                      dot={{ r: 3.5, strokeWidth: 2, fill: '#0f0f0f', stroke: '#8b5cf6' }}
                      activeDot={{ r: 5, fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Topic performance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                <CardTitle>Topic-Wise Performance</CardTitle>
              </div>
              <CardDescription>Average accuracy (%) across subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topic_performance} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="topic" tick={{ fill: 'rgba(161,161,170,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'rgba(161,161,170,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={32}>
                      {analytics.topic_performance.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border border-dashed border-zinc-200 dark:border-white/[0.06]">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-zinc-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No analytics yet</h3>
            <p className="text-xs text-zinc-500 max-w-xs">Your charts will appear after your first quiz attempt.</p>
            <Button size="sm" onClick={() => navigate('/quizzes')} className="mt-2">Take a Quiz</Button>
          </CardContent>
        </Card>
      )}

      {/* Recent attempts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Attempts</CardTitle>
            <CardDescription>Your last 5 completed quizzes</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {recentAttempts.length > 0 ? (
            <Table>
              <THead>
                <Tr>
                  <Th>Quiz</Th>
                  <Th>Topic</Th>
                  <Th className="text-center">Score</Th>
                  <Th className="text-center">Accuracy</Th>
                  <Th className="text-right">Date</Th>
                </Tr>
              </THead>
              <TBody>
                {recentAttempts.map((attempt) => (
                  <Tr key={attempt.id}>
                    <Td className="font-semibold text-zinc-900 dark:text-zinc-200">{attempt.quiz_title}</Td>
                    <Td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/[0.05]">
                        {attempt.quiz_topic}
                      </span>
                    </Td>
                    <Td className="text-center font-semibold text-zinc-900 dark:text-zinc-200">
                      {attempt.score} / {attempt.total_questions}
                    </Td>
                    <Td className="text-center">
                      <span className={`text-xs font-bold ${
                        attempt.accuracy >= 75 ? 'text-emerald-500' :
                        attempt.accuracy >= 60 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {Math.round(attempt.accuracy)}%
                      </span>
                    </Td>
                    <Td className="text-right text-zinc-400 dark:text-zinc-600 text-[11px]">
                      {new Date(attempt.attempted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-xs text-zinc-500">
              No attempts yet. <button onClick={() => navigate('/quizzes')} className="text-violet-600 dark:text-violet-400 font-semibold hover:underline underline-offset-4">Start your first quiz →</button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
