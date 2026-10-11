'use client';
import { useState } from 'react';
import { useGetProfileQuery } from '@/features/profile/profileApi';
import { useCalculateTrustScoreMutation, useApplyForLoanMutation, useGetMyLoansQuery } from '@/features/loan/loanApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Activity, Zap, ShieldCheck, Landmark, CheckCircle2, Clock } from 'lucide-react';

export default function LoansPage() {
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useGetProfileQuery({});
  const { data: loans = [], isLoading: isLoadingLoans, refetch: refetchLoans } = useGetMyLoansQuery({});
  
  const [calculateScore, { isLoading: isCalculating }] = useCalculateTrustScoreMutation();
  const [applyForLoan, { isLoading: isApplying }] = useApplyForLoanMutation();

  const [loanOpen, setLoanOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState('10000');
  const [loanTerm, setLoanTerm] = useState('12');

  const score = profile?.trust_score || 0;
  
  // Calculate preview EMI
  const interestRate = score >= 750 ? 10.5 : 14.5;
  const r = interestRate / (12 * 100);
  const n = parseInt(loanTerm) || 12;
  const p = parseFloat(loanAmount) || 0;
  const estimatedEmi = (p > 0 && n > 0) ? ((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;

  const handleCalculateScore = async () => {
    try {
      const res = await calculateScore({}).unwrap();
      alert(`Trust Score Calculated: ${res.trust_score}\nReasoning: ${res.reasoning}`);
      refetchProfile();
    } catch (err) {
      alert('Failed to calculate score.');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await applyForLoan({ 
        amount: parseFloat(loanAmount), 
        term_months: parseInt(loanTerm) 
      }).unwrap();
      alert(res.message);
      setLoanOpen(false);
      refetchLoans();
    } catch (err: any) {
      alert(err.data?.message || 'Loan application failed.');
    }
  };

  if (isLoadingProfile || isLoadingLoans) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  // Determine score color
  let scoreColor = 'text-slate-500';
  if (score >= 750) { scoreColor = 'text-emerald-500'; }
  else if (score >= 600) { scoreColor = 'text-amber-500'; }
  else if (score > 0) { scoreColor = 'text-red-500'; }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 perspective-container">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white neon-text-glow">AI Lending</h1>
          <p className="text-white/60 mt-1 text-lg">Get instant loans powered by your AI Trust Score.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Trust Score Card */}
        <Card className="md:col-span-1 glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] card-3d">
          <CardHeader className="px-6 pt-6 border-b border-white/5">
            <CardTitle className="text-white flex items-center gap-2 neon-text-glow">
              <Zap className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(100,50,255,0.8)]" /> AI Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4 pb-8">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${score >= 750 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : score >= 600 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}
                  strokeDasharray={`${(score / 900) * 100}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="text-center absolute">
                <span className={`text-4xl font-extrabold ${score >= 750 ? 'text-emerald-400' : score >= 600 ? 'text-amber-400' : 'text-red-400'}`}>
                  {score > 0 ? score : 'N/A'}
                </span>
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Score</p>
              </div>
            </div>

            <Button 
              onClick={handleCalculateScore} 
              disabled={isCalculating}
              variant="outline" 
              className="mt-8 border-white/20 bg-white/5 hover:bg-white/10 text-white w-full rounded-xl"
            >
              {isCalculating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
              Refresh Score
            </Button>
          </CardContent>
        </Card>

        {/* Loan Application Area */}
        <Card className="md:col-span-2 glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] overflow-hidden relative card-3d">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
          <CardHeader className="px-8 pt-8 relative z-10 border-b border-white/5">
            <CardTitle className="text-white text-2xl neon-text-glow">Instant Loan Marketplace</CardTitle>
            <CardDescription className="text-white/60 text-base mt-1">
              Apply for an instant personal loan. If your trust score is 700+, get disbursed immediately directly to your wallet!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-8 pb-8 relative z-10">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 border border-white/10 p-5 rounded-2xl shadow-inner">
                <p className="text-white/50 text-sm font-semibold uppercase tracking-wide">Your Interest Rate</p>
                <p className="text-3xl font-extrabold text-white mt-1 neon-text-glow">{score > 0 ? interestRate : '--'}% <span className="text-sm font-semibold text-white/50">p.a.</span></p>
              </div>
              <div className="bg-black/20 border border-white/10 p-5 rounded-2xl shadow-inner">
                <p className="text-white/50 text-sm font-semibold uppercase tracking-wide">Eligibility</p>
                <div className="flex items-center mt-1">
                  {score >= 500 ? (
                    <><ShieldCheck className="w-6 h-6 text-emerald-400 mr-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" /><span className="text-2xl font-extrabold text-white neon-text-glow">Eligible</span></>
                  ) : (
                    <><Clock className="w-6 h-6 text-red-400 mr-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" /><span className="text-2xl font-extrabold text-white neon-text-glow">Improve</span></>
                  )}
                </div>
              </div>
            </div>

            <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-primary hover:bg-primary/90 h-14 rounded-xl text-lg font-semibold shadow-[0_0_15px_rgba(100,50,255,0.6)] text-primary-foreground neon-glow" disabled={score < 500}>
                  <Landmark className="w-6 h-6 mr-2" /> Apply for Loan
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel-heavy border-white/10 text-white max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white neon-text-glow">Loan Application</DialogTitle>
                  <DialogDescription className="text-white/60">Calculate and apply for a personal loan.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleApply} className="space-y-6">
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/90">Loan Amount (₹)</Label>
                      <Input 
                        type="number" min="1000" max="500000" required
                        value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)}
                        className="bg-black/20 border-white/10 text-lg rounded-xl text-white focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90">Tenure (Months)</Label>
                      <Input 
                        type="number" min="3" max="60" required
                        value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)}
                        className="bg-black/20 border-white/10 text-lg rounded-xl text-white focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="bg-primary/20 border border-primary/30 p-5 rounded-2xl flex justify-between items-center shadow-[0_0_15px_rgba(100,50,255,0.2)]">
                    <div>
                      <p className="text-white/70 text-sm font-medium">Estimated EMI</p>
                      <p className="text-3xl font-bold text-white neon-text-glow">₹{Math.round(estimatedEmi).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm font-medium">Interest Rate</p>
                      <p className="text-xl font-bold text-white">{interestRate}%</p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={isApplying} className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 text-lg shadow-[0_0_15px_rgba(100,50,255,0.5)]">
                      {isApplying ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                      Submit Application
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

          </CardContent>
        </Card>
      </div>

      {/* Active Loans */}
      <h2 className="text-2xl font-bold tracking-tight pt-6 text-white neon-text-glow">My Loans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.length === 0 ? (
          <p className="text-white/50 col-span-full text-lg">No loans found. Apply for one above.</p>
        ) : (
          loans.map((loan: any) => (
            <Card key={loan.id} className="glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] card-3d">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/50 font-semibold uppercase tracking-wide text-xs">Loan Amount</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1 neon-text-glow">₹{loan.amount.toLocaleString('en-IN')}</h3>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_currentColor] border ${
                    loan.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    loan.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-destructive/20 text-red-400 border-destructive/30'
                  }`}>
                    {loan.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
                  <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">EMI</p>
                    <p className="text-white font-bold text-lg mt-1">₹{loan.emi.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Tenure</p>
                    <p className="text-white font-bold text-lg mt-1">{loan.term_months} Months</p>
                  </div>
                </div>

                <div className="flex items-center text-sm font-medium text-white/70">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-primary drop-shadow-[0_0_5px_rgba(100,50,255,0.8)]" />
                  Auto-debit active on 5th
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
