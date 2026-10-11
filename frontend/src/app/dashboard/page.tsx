'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetWalletBalanceQuery } from '@/features/wallet/walletApi';
import { useGetProfileQuery } from '@/features/profile/profileApi';
import { Activity, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, ShieldCheck, Lock, Globe, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: wallet } = useGetWalletBalanceQuery({});
  const { data: profile } = useGetProfileQuery({});

  const balance = wallet?.balance || 0;
  const trustScore = profile?.trust_score || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-10 perspective-container">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white neon-text-glow">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-white/60 mt-2 text-lg">Here is what is happening with your finances today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <div className="glass-panel p-8 rounded-3xl transition-all duration-300 relative overflow-hidden group card-3d">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white/60 font-semibold tracking-wide uppercase text-sm">Total Balance</h3>
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary shadow-[0_0_15px_rgba(100,50,255,0.3)] border border-white/10 group-hover:shadow-[0_0_20px_rgba(100,50,255,0.6)] transition-all">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <Link href="/dashboard/wallet" className="text-primary hover:text-primary/80 font-semibold text-sm mt-8 inline-flex items-center gap-1 neon-text-glow">
            View details <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-panel p-8 rounded-3xl transition-all duration-300 relative overflow-hidden group card-3d">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white/60 font-semibold tracking-wide uppercase text-sm">Monthly Inflow</h3>
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] border border-white/10 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.6)] transition-all">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">+ Active</p>
          <p className="text-emerald-400/80 font-semibold text-sm mt-8 inline-flex items-center gap-1">
            Healthy status <Activity className="w-4 h-4" />
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl transition-all duration-300 relative overflow-hidden group card-3d">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white/60 font-semibold tracking-wide uppercase text-sm">AI Trust Score</h3>
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-white/10 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className={`text-3xl font-extrabold ${trustScore >= 750 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-white'}`}>
            {trustScore > 0 ? trustScore : 'Calculate Now'}
          </p>
          <Link href="/dashboard/loans" className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm mt-8 inline-flex items-center gap-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">
            Apply for loan <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Explore Platform Box */}
      <div className="glass-panel-heavy p-10 text-center mt-12 rounded-3xl relative overflow-hidden card-3d-intense">
        <Activity className="w-16 h-16 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(100,50,255,0.8)]" />
        <h3 className="text-2xl font-bold text-white mb-3 neon-text-glow">Explore FlowFi Platform</h3>
        <p className="text-white/70 max-w-xl mx-auto text-lg">
          Use the sidebar on the left to navigate between your secure Wallet, AI-powered Loans, instant QR Payments, and Profile.
        </p>
      </div>

      {/* Trust & Information Section */}
      <div className="pt-8">
        <h2 className="text-2xl font-bold text-white mb-6 neon-text-glow">Why Trust FlowFi?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel p-6 rounded-3xl transition-shadow card-3d">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary border border-white/10 mb-4 shadow-[0_0_10px_rgba(100,50,255,0.4)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Bank-Grade Security</h4>
            <p className="text-white/60 font-medium text-sm">
              Your data is heavily encrypted with AES-256 bit encryption and stored securely according to the highest industry standards.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl transition-shadow card-3d">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10 mb-4 shadow-[0_0_10px_rgba(52,211,153,0.4)]">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">RBI Compliant</h4>
            <p className="text-white/60 font-medium text-sm">
              Fully compliant with RBI guidelines. We ensure all KYC and transaction monitoring follows strict regulatory frameworks.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl transition-shadow card-3d">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-cyan-400 border border-white/10 mb-4 shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">AI-Driven Decisions</h4>
            <p className="text-white/60 font-medium text-sm">
              Our advanced AI trust scoring guarantees fair, unbiased, and instant loan approvals based on your accurate financial health.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl transition-shadow card-3d">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary border border-white/10 mb-4 shadow-[0_0_10px_rgba(100,50,255,0.4)]">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">24/7 Monitoring</h4>
            <p className="text-white/60 font-medium text-sm">
              Continuous fraud detection and active monitoring protect your wallet and ensure secure, seamless global transfers at all times.
            </p>
          </div>

        </div>
      </div>
      
    </div>
  );
}
