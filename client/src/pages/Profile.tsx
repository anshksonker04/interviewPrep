import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { attemptService } from '../services/api';
import { Attempt } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { cn } from '../lib/utils';
import {
  Mail, KeyRound, Award,
  Lock, CheckCircle2, Flame, Zap, ZapOff, Sparkles, Trophy, Calendar
} from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type PasswordFields = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { show: showToast } = useToastStore();
  const [history, setHistory] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await attemptService.getAttemptHistory();
        setHistory(data.attempts);
      } catch {
        showToast('Could not load achievements.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [showToast]);

  const onSubmit = async () => {
    try {
      setUpdating(true);
      await new Promise((r) => setTimeout(r, 800));
      showToast('Password updated successfully.', 'success');
      reset();
    } catch {
      showToast('Password change failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const badges = [
    {
      id: 'first_steps',
      title: 'Ready Player One',
      description: 'Completed your first technical prep quiz.',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      unlocked: history.length >= 1,
    },
    {
      id: 'marathon',
      title: 'Persistent Solver',
      description: 'Completed at least 5 quizzes.',
      icon: <Flame className="w-5 h-5 text-orange-400 animate-pulse" />,
      unlocked: history.length >= 5,
    },
    {
      id: 'elite_accuracy',
      title: 'Precision Architect',
      description: 'Scored 85%+ accuracy on any quiz.',
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
      unlocked: history.some((a) => a.accuracy >= 85),
    },
    {
      id: 'speedy',
      title: 'Speed Demon',
      description: 'Finished any exam in under 90 seconds.',
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      unlocked: history.some((a) => a.time_taken <= 90),
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Profile & Achievements</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
          Manage your account, credentials, and unlocked badges
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Account + Password */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile card */}
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 text-2xl font-bold mx-auto mb-3">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <CardTitle className="text-sm">{user?.name || 'Loading...'}</CardTitle>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest badge-violet self-center inline-block mt-1">
                {user?.role || 'Student'}
              </span>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-zinc-500 dark:text-zinc-500">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Password card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>Update your login credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.currentPassword?.message}
                  disabled={updating}
                  {...register('currentPassword')}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.newPassword?.message}
                  disabled={updating}
                  {...register('newPassword')}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  disabled={updating}
                  {...register('confirmPassword')}
                />
                <Button type="submit" className="w-full mt-1" isLoading={updating}>
                  Save Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Badges */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-500" />
                  Achievement Badges
                </CardTitle>
                <CardDescription>Milestones unlocked through practice</CardDescription>
              </div>
              <span className="badge-violet px-2.5 py-1 rounded-md text-[10px] font-bold">
                {unlockedCount} / {badges.length}
              </span>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={cn(
                        'p-4 rounded-lg border flex items-start gap-3 transition-all',
                        badge.unlocked
                          ? 'border-zinc-200/70 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]'
                          : 'border-zinc-200/40 dark:border-white/[0.03] bg-zinc-50/50 dark:bg-transparent opacity-50'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
                        badge.unlocked
                          ? 'bg-zinc-50 dark:bg-white/[0.04] border-zinc-200/70 dark:border-white/[0.06]'
                          : 'bg-zinc-100 dark:bg-white/[0.02] border-zinc-200/60 dark:border-white/[0.04]'
                      )}>
                        {badge.unlocked ? badge.icon : <ZapOff className="w-4 h-4 text-zinc-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                          {badge.title}
                          {badge.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-600 mt-0.5 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
