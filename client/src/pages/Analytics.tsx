import React, { useEffect, useState } from 'react';
import { attemptService } from '../services/api';
import { StudentAnalytics, Attempt } from '../types';
import { useToastStore } from '../store/toastStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Table, THead, TBody, Tr, Th, Td } from '../components/Table';
import { Skeleton } from '../components/Skeleton';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { BarChart3, TrendingUp, Star, AlertTriangle, Zap } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [history, setHistory] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToastStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [a, h] = await Promise.all([
          attemptService.getStudentAnalytics(),
          attemptService.getAttemptHistory()
        ]);
        setAnalytics(a);
        setHistory(h.attempts);
      } catch {
        showToast('Could not load analytics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [showToast]);

  const COLORS = ['#8b5cf6', '#6d28d9', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4', '#14b8a6'];

  const TOOLTIP_STYLE = {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    color: '#e4e4e7',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const pieData = analytics?.topic_performance.map((tp) => ({ name: tp.topic, value: tp.attempts })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Analytics</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
          Detailed metrics, subject breakdown charts, and diagnostic insights
        </p>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-2 border-l-emerald-500">
          <CardHeader className="pb-3 flex flex-row items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Strong Topics</CardTitle>
              <CardDescription>Avg. accuracy above 75%</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analytics?.strong_topics && analytics.strong_topics.length > 0 ? (
              analytics.strong_topics.map((t) => (
                <span key={t} className="badge-emerald px-2.5 py-1 rounded-md text-[10px] font-bold">{t}</span>
              ))
            ) : (
              <p className="text-xs text-zinc-500">Complete more quizzes to discover your strongest topics.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-amber-500">
          <CardHeader className="pb-3 flex flex-row items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Needs Focus</CardTitle>
              <CardDescription>Avg. accuracy below 60%</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analytics?.weak_topics && analytics.weak_topics.length > 0 ? (
              analytics.weak_topics.map((t) => (
                <span key={t} className="badge-amber px-2.5 py-1 rounded-md text-[10px] font-bold">{t}</span>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No topics below 60% yet. Keep going!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analytics && analytics.total_attempts > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Line chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                <CardTitle>Accuracy History</CardTitle>
              </div>
              <CardDescription>Performance rate (%) over last 10 attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
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

          {/* Pie chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-500" />
                <CardTitle>Attempts by Topic</CardTitle>
              </div>
              <CardDescription>Distribution of quiz attempts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History log */}
      <Card>
        <CardHeader>
          <CardTitle>Attempt History</CardTitle>
          <CardDescription>Complete log of all quiz attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <Table>
              <THead>
                <Tr>
                  <Th>Quiz</Th>
                  <Th>Topic</Th>
                  <Th className="text-center">Score</Th>
                  <Th className="text-center">Accuracy</Th>
                  <Th className="text-center">Time</Th>
                  <Th className="text-right">Date</Th>
                </Tr>
              </THead>
              <TBody>
                {history.map((a) => (
                  <Tr key={a.id}>
                    <Td className="font-semibold text-zinc-900 dark:text-zinc-200">{a.quiz_title}</Td>
                    <Td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/[0.05]">
                        {a.quiz_topic}
                      </span>
                    </Td>
                    <Td className="text-center font-semibold text-zinc-900 dark:text-zinc-200">{a.score}/{a.total_questions}</Td>
                    <Td className="text-center">
                      <span className={`text-xs font-bold ${a.accuracy >= 75 ? 'text-emerald-500' : a.accuracy >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {Math.round(a.accuracy)}%
                      </span>
                    </Td>
                    <Td className="text-center text-zinc-500">{Math.floor(a.time_taken / 60)}m {a.time_taken % 60}s</Td>
                    <Td className="text-right text-[11px] text-zinc-400 dark:text-zinc-600">
                      {new Date(a.attempted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-xs text-zinc-500">
              No history yet. Complete your first quiz to see results here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
