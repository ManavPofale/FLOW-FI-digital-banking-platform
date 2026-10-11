'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Link from 'next/link';
import { Wallet, User, FileCheck, LogOut, Activity, ScanLine, Landmark, ShieldAlert } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout, setCredentials } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [logoutApi] = useLogoutMutation();

  const user = useSelector((state: RootState) => state.auth.user);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    if (!isAuthenticated && !token) {
      router.push('/login');
    } else if (token && !isAuthenticated && user === null) {
      // Rehydrate Redux from localStorage if it was missed during SSR
      const localUser = localStorage.getItem('user');
      if (localUser && token) {
        dispatch(setCredentials({ user: JSON.parse(localUser), accessToken: token }));
      }
    }
  }, [isAuthenticated, router, dispatch, user]);

  if (!isMounted || !isAuthenticated) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'QR Pay', href: '/dashboard/qr-pay', icon: ScanLine },
    { name: 'AI Loans', href: '/dashboard/loans', icon: Landmark },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'KYC Verification', href: '/dashboard/kyc', icon: FileCheck },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldAlert });
  }

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
      dispatch(logout());
      router.push('/login');
    } catch (e) {
      console.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex relative font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 glass-panel border-r border-r-primary/20 flex flex-col hidden md:flex z-20">
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-xl text-primary-foreground shadow-[0_0_15px_rgba(100,50,255,0.6)]">
            F
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white neon-text-glow">FlowFi</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/20 text-primary font-bold neon-glow' 
                    : 'text-white/60 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-white/40 group-hover:text-white/80'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-xl text-white/50 font-medium hover:bg-destructive/20 hover:text-destructive-foreground transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 bg-transparent h-screen overflow-hidden perspective-container">
        
        <header className="h-16 glass-panel border-b border-white/10 flex items-center px-6 md:hidden">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-sm text-primary-foreground mr-3 shadow-[0_0_10px_rgba(100,50,255,0.6)]">
            F
          </div>
          <h2 className="text-xl font-bold text-white neon-text-glow">FlowFi</h2>
        </header>

        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
