import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">FlowFi</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-black hover:bg-zinc-200">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-[-10vh]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-sm font-medium text-zinc-300">Next Generation Digital Banking</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 mb-6 leading-tight">
          Finance at the speed of <br className="hidden md:block"/> thought.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Experience seamless payments, AI-powered credit scoring, and ultra-secure wallets. FlowFi is the modern financial OS built for the future.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] border-0">
              Open an Account
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium border-zinc-700 bg-zinc-900/50 backdrop-blur-md hover:bg-zinc-800 text-white">
              Access Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
