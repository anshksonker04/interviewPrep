import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Zap, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});
type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuthStore();
  const { show: showToast } = useToastStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      showToast('Account created! Welcome aboard.', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
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
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Start your interview journey</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border/30 bg-card shadow-xl shadow-black/60 p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">Create your account</h2>
            <p className="text-xs text-[#E0E0E0] mt-0.5">Free for all students</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Smith"
              error={errors.name?.message}
              disabled={isLoading}
              {...register('name')}
            />
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
              placeholder="At least 6 characters"
              error={errors.password?.message}
              disabled={isLoading}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              error={errors.confirm?.message}
              disabled={isLoading}
              {...register('confirm')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#E0E0E0] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#FF7A00] font-semibold hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
