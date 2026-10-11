'use client';
import { useGetPlatformStatsQuery, useGetPendingKycQuery, useUpdateKycStatusMutation } from '@/features/admin/adminApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Wallet, Landmark, Activity, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useGetPlatformStatsQuery({});
  const { data: kycQueue, isLoading: isLoadingQueue } = useGetPendingKycQuery({});
  const [updateKyc, { isLoading: isUpdating }] = useUpdateKycStatusMutation();

  const handleKycAction = async (kycId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await updateKyc({ kycId, status }).unwrap();
      alert(`KYC has been ${status.toLowerCase()}`);
    } catch (err) {
      alert('Failed to update KYC status');
    }
  };

  if (isLoadingStats || isLoadingQueue) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 perspective-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white neon-text-glow">Admin Dashboard</h1>
        <p className="text-white/60 mt-1">Platform overview and user management.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel border-0 shadow-[0_0_15px_rgba(100,50,255,0.15)] card-3d">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm font-medium">Total Users</p>
                <h3 className="text-2xl font-bold text-white mt-1 neon-text-glow">{stats?.totalUsers || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_10px_rgba(100,50,255,0.3)]">
                <Users className="w-6 h-6 text-primary drop-shadow-[0_0_5px_rgba(100,50,255,0.8)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 shadow-[0_0_15px_rgba(100,50,255,0.15)] card-3d">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm font-medium">Total Wallet Funds</p>
                <h3 className="text-2xl font-bold text-white mt-1 neon-text-glow">₹{(stats?.totalWalletBalance || 0).toLocaleString('en-IN')}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                <Wallet className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 shadow-[0_0_15px_rgba(100,50,255,0.15)] card-3d">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm font-medium">Active Loan Volume</p>
                <h3 className="text-2xl font-bold text-white mt-1 neon-text-glow">₹{(stats?.totalLoanVolume || 0).toLocaleString('en-IN')}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                <Landmark className="w-6 h-6 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 shadow-[0_0_15px_rgba(100,50,255,0.15)] card-3d">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm font-medium">Tx Volume</p>
                <h3 className="text-2xl font-bold text-white mt-1 neon-text-glow">₹{(stats?.totalTransactionVolume || 0).toLocaleString('en-IN')}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <Activity className="w-6 h-6 text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Review Queue */}
      <Card className="glass-panel border-0 shadow-[0_0_20px_rgba(100,50,255,0.2)] card-3d">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-white flex items-center gap-2 neon-text-glow">
            KYC Verification Queue
            {stats?.pendingKycCount > 0 && (
              <span className="bg-destructive text-white text-xs px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]">{stats.pendingKycCount}</span>
            )}
          </CardTitle>
          <CardDescription className="text-white/50">Review and approve pending user identity documents.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {kycQueue?.length === 0 ? (
            <div className="py-8 text-center text-white/40 font-medium">
              No pending KYC applications. You're all caught up!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-white/70">
                <thead className="text-xs text-white/50 uppercase bg-black/40 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Submitted At</th>
                    <th className="px-6 py-4">Documents</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kycQueue?.map((kyc: any) => (
                    <tr key={kyc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {kyc.user?.email}
                      </td>
                      <td className="px-6 py-4 text-white/50">
                        {format(new Date(kyc.submitted_at), 'PPp')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {kyc.documents?.map((doc: any) => (
                            <a 
                              key={doc.id} 
                              href={`http://localhost:5000${doc.file_url}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-primary hover:text-white hover:bg-primary/50 text-xs bg-primary/20 px-2 py-1 rounded border border-primary/30 transition-colors shadow-[0_0_5px_rgba(100,50,255,0.2)]"
                            >
                              {doc.type}
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-destructive/50 text-red-400 hover:bg-destructive/20 hover:text-red-300 bg-transparent shadow-[0_0_5px_rgba(239,68,68,0.2)]"
                          onClick={() => handleKycAction(kyc.id, 'REJECTED')}
                          disabled={isUpdating}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600/80 hover:bg-emerald-600 text-white shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                          onClick={() => handleKycAction(kyc.id, 'VERIFIED')}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
