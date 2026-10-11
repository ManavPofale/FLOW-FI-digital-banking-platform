'use client';
import { useState } from 'react';
import { 
  useGetWalletBalanceQuery, 
  useAddMoneyMutation, 
  useWithdrawMoneyMutation, 
  useTransferMoneyMutation 
} from '@/features/wallet/walletApi';
import { paymentApi } from '@/features/payment/paymentApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Loader2, ArrowUpRight, ArrowDownRight, Plus, Send, Wallet as WalletIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function WalletPage() {
  const { data: wallet, isLoading } = useGetWalletBalanceQuery({});
  
  const [addMoney, { isLoading: isAdding }] = useAddMoneyMutation();
  const [withdrawMoney, { isLoading: isWithdrawing }] = useWithdrawMoneyMutation();
  const [transferMoney, { isLoading: isTransferring }] = useTransferMoneyMutation();

  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [createRazorpayOrder, { isLoading: isCreatingOrder }] = paymentApi.useCreateRazorpayOrderMutation();
  const [verifyPayment] = paymentApi.useVerifyRazorpayPaymentMutation();

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMoney({ amount: parseFloat(addAmount) }).unwrap();
      alert('Money added successfully (Mock)!');
      setAddOpen(false);
      setAddAmount('');
      // Trigger refetch
      window.location.reload(); 
    } catch (err: any) {
      alert(err.data?.message || 'Failed to add money');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await withdrawMoney({ amount: parseFloat(withdrawAmount) }).unwrap();
      setWithdrawOpen(false);
      setWithdrawAmount('');
    } catch (err: any) {
      alert(err.data?.message || 'Failed to withdraw money');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transferMoney({ 
        receiverEmail, 
        amount: parseFloat(transferAmount), 
        note: transferNote 
      }).unwrap();
      setTransferOpen(false);
      setTransferAmount('');
      setReceiverEmail('');
      setTransferNote('');
    } catch (err: any) {
      alert(err.data?.message || 'Failed to transfer money');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  const balance = wallet?.balance || 0;
  const transactions = wallet?.transactions || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Digital Wallet</h1>
          <p className="text-zinc-400 mt-1 text-lg">Manage your funds and track recent transactions.</p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="glass-panel border-0 shadow-[0_0_20px_rgba(100,50,255,0.2)] overflow-hidden rounded-3xl card-3d">
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(100,50,255,0.4)]">
              <WalletIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-white/60 font-semibold tracking-wide text-sm uppercase">Total Balance</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-1 neon-text-glow">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* ADD MONEY DIALOG */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black/40 border border-white/10 text-white hover:bg-black/60 rounded-xl px-6 neon-glow">
                  <Plus className="w-4 h-4 mr-2" /> Add Money
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel-heavy border-white/10 text-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white neon-text-glow">Add Money (Mock)</DialogTitle>
                  <DialogDescription className="text-white/60">Instantly credit your wallet for testing purposes.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90">Amount (₹)</Label>
                    <Input 
                      type="number" 
                      required min="1" 
                      value={addAmount} 
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="bg-black/20 border-white/10 focus-visible:ring-primary rounded-xl text-white placeholder:text-white/40"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isAdding} className="bg-primary hover:bg-primary/90 w-full rounded-xl shadow-[0_0_15px_rgba(100,50,255,0.5)]">
                      {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Proceed
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* WITHDRAW DIALOG */}
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl px-6">
                  <ArrowDownRight className="w-4 h-4 mr-2" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel-heavy border-white/10 text-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white neon-text-glow">Withdraw Money (Mock)</DialogTitle>
                  <DialogDescription className="text-white/60">Withdraw funds to your linked bank account.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90">Amount (₹)</Label>
                    <Input 
                      type="number" 
                      required min="1" max={balance}
                      value={withdrawAmount} 
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-black/20 border-white/10 focus-visible:ring-primary rounded-xl text-white placeholder:text-white/40"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isWithdrawing} className="bg-primary hover:bg-primary/90 w-full rounded-xl shadow-[0_0_15px_rgba(100,50,255,0.5)]">
                      {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Withdraw
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* TRANSFER DIALOG */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-[0_0_15px_rgba(100,50,255,0.6)] rounded-xl px-6">
                  <Send className="w-4 h-4 mr-2" /> Transfer
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel-heavy border-white/10 text-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white neon-text-glow">Send Money</DialogTitle>
                  <DialogDescription className="text-white/60">Instantly transfer funds to another FlowFi user.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90">Receiver Email</Label>
                    <Input 
                      type="email" 
                      required 
                      value={receiverEmail} 
                      onChange={(e) => setReceiverEmail(e.target.value)}
                      className="bg-black/20 border-white/10 focus-visible:ring-primary rounded-xl text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/90">Amount (₹)</Label>
                    <Input 
                      type="number" 
                      required min="1" max={balance}
                      value={transferAmount} 
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="bg-black/20 border-white/10 focus-visible:ring-primary rounded-xl text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/90">Note (Optional)</Label>
                    <Input 
                      type="text" 
                      value={transferNote} 
                      onChange={(e) => setTransferNote(e.target.value)}
                      className="bg-black/20 border-white/10 focus-visible:ring-primary rounded-xl text-white placeholder:text-white/40"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isTransferring} className="bg-primary hover:bg-primary/90 w-full rounded-xl shadow-[0_0_15px_rgba(100,50,255,0.5)]">
                      {isTransferring ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Send Securely
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="glass-panel border-0 rounded-3xl shadow-xl perspective-container">
        <CardHeader className="px-8 pt-8">
          <CardTitle className="text-white text-2xl neon-text-glow">Recent Transactions</CardTitle>
          <CardDescription className="text-white/60 text-base">Your latest wallet activities.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-white/50 font-medium">
              No transactions found.
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all card-3d">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${tx.type === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive-foreground'}`}>
                      {tx.type === 'CREDIT' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{tx.description || (tx.type === 'CREDIT' ? 'Money Added' : 'Money Deducted')}</p>
                      <p className="text-sm text-white/50 font-medium">{format(new Date(tx.created_at), 'PPp')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-extrabold text-xl ${tx.type === 'CREDIT' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-red-400'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
