'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRegisterMutation } from '@/features/auth/authApi';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...submitData } = data;
      await registerUser(submitData).unwrap();
      
      // On successful registration, redirect to login
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="perspective-container">
      <Card className="glass-panel rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 card-3d">
        <CardHeader className="px-8 pt-8 text-center pb-6 border-b border-white/10 bg-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Create an Account</CardTitle>
          <CardDescription className="text-white/60 font-medium mt-1">
            Join FlowFi to start managing your finances
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/50 text-destructive-foreground text-sm font-medium flex items-center justify-center">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white/90 font-semibold">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus-visible:ring-primary transition-shadow neon-glow"
                  {...register('firstName')}
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1 font-medium">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white/90 font-semibold">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus-visible:ring-primary transition-shadow neon-glow"
                  {...register('lastName')}
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1 font-medium">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/90 font-semibold">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus-visible:ring-primary transition-shadow neon-glow"
                {...register('phone')}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1 font-medium">{errors.phone.message}</p>}
            </div>

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
              <Label htmlFor="password" className="text-white/90 font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary transition-shadow neon-glow"
                {...register('password')}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/90 font-semibold">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary transition-shadow neon-glow"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl text-lg font-semibold shadow-[0_0_15px_rgba(100,50,255,0.5)] transition-all mt-6"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm font-medium text-white/60 px-8 pb-8 bg-white/5 border-t border-white/10 pt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:text-primary/80 ml-1 transition-colors neon-text-glow">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
