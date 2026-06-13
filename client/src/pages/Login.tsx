import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Zap, KeyRound, Mail, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFields = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, isLoading } = useAuthStore();
  const { show: showToast } = useToastStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginFields) => {
    try {
      await login(data);
      showToast('Signed in successfully.', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Login failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-violet-600/5 dark:bg-violet-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40 mb-4">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">PrepPortal</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Technical interview preparation</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border/30 bg-card shadow-xl shadow-black/60 p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">Sign in to your account</h2>
            <p className="text-xs text-[#E0E0E0] mt-0.5">Welcome back</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@university.edu"
              error={errors.email?.message}
              disabled={isLoading}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isLoading}
              {...register('password')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-4 border-t border-border/15">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2.5">
              Demo accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[#15151E] border border-border/20 p-2.5">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Student</p>
                <p className="text-[10px] text-zinc-300 font-mono">student@prep.com</p>
                <p className="text-[10px] text-zinc-400 font-mono">student123</p>
              </div>
              <div className="rounded-lg bg-[#15151E] border border-border/20 p-2.5">
                <p className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider mb-1">Admin</p>
                <p className="text-[10px] text-zinc-300 font-mono">admin@prep.com</p>
                <p className="text-[10px] text-zinc-400 font-mono">admin123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#E0E0E0] mt-5">
          No account?{' '}
          <Link to="/register" className="text-[#FF7A00] font-semibold hover:underline underline-offset-4">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};
