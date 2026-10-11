'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginMutation } from '@/features/auth/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials({ user: response.user, accessToken: response.accessToken }));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.data?.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <div className="perspective-container">
      <Card className="glass-panel rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 card-3d">
        <CardHeader className="px-8 pt-8 text-center pb-6 border-b border-white/10 bg-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-white/60 font-medium mt-1">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/50 text-destructive-foreground text-sm font-medium flex items-center justify-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus-visible:ring-primary transition-shadow neon-glow"
                {...register('email')}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/90 font-semibold">Password</Label>
                <Link href="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors neon-text-glow">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary transition-shadow neon-glow"
                {...register('password')}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl text-lg font-semibold shadow-[0_0_15px_rgba(100,50,255,0.5)] transition-all mt-6"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm font-medium text-white/60 px-8 pb-8 bg-white/5 border-t border-white/10 pt-6">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-primary hover:text-primary/80 ml-1 transition-colors neon-text-glow">
            Register here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
