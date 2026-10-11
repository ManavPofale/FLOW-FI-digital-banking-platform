'use client';
import { useState } from 'react';
import { useGetKycStatusQuery, useUploadKycDocumentsMutation } from '@/features/kyc/kycApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function KycPage() {
  const { data: kycStatus, isLoading: isLoadingStatus } = useGetKycStatusQuery({});
  const [uploadDocuments, { isLoading: isUploading }] = useUploadKycDocumentsMutation();
  
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panFile && !aadhaarFile) {
      alert('Please select at least one document to upload.');
      return;
    }

    const formData = new FormData();
    if (panFile) formData.append('pan', panFile);
    if (aadhaarFile) formData.append('aadhaar', aadhaarFile);

    try {
      await uploadDocuments(formData).unwrap();
      alert('Documents uploaded successfully! Your KYC status is now PENDING.');
      setPanFile(null);
      setAadhaarFile(null);
    } catch (error: any) {
      alert(`Failed to upload documents. Error: ${error?.data?.message || error?.error || JSON.stringify(error)}`);
    }
  };

  if (isLoadingStatus) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  const status = kycStatus?.status || 'NOT_SUBMITTED';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 perspective-container">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white neon-text-glow">KYC Verification</h1>
          <p className="text-white/60 mt-1 text-lg">Verify your identity to unlock higher limits and premium features.</p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] card-3d">
            <CardHeader className="px-8 pt-8 border-b border-white/5">
              <CardTitle className="text-white text-2xl neon-text-glow">Upload Documents</CardTitle>
              <CardDescription className="text-white/60 font-medium">Please upload a clear copy of your valid Government ID (Aadhaar, PAN, or Passport).</CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-8">
              {status === 'VERIFIED' ? (
                <div className="bg-emerald-900/40 border border-emerald-500/50 p-6 rounded-2xl flex items-start space-x-4 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h3 className="text-lg font-bold text-emerald-400">Verification Complete</h3>
                    <p className="text-emerald-400/80 mt-1 font-medium">Your identity has been verified. All account limits have been removed.</p>
                  </div>
                </div>
              ) : (
                <form id="kyc-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* PAN Card Upload */}
                  <div className="space-y-3">
                    <Label className="text-white/90 font-semibold">PAN Card</Label>
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-primary/50 transition-colors bg-black/20 text-center shadow-inner">
                      <input 
                        type="file" 
                        id="pan" 
                        className="hidden" 
                        accept=".jpg,.jpeg,.png,.pdf" 
                        onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                        disabled={status === 'VERIFIED' || status === 'PENDING'}
                      />
                      <label htmlFor="pan" className={`cursor-pointer flex flex-col items-center space-y-2 ${status !== 'NOT_SUBMITTED' && status !== 'REJECTED' ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                          {panFile ? <FileText className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(100,50,255,0.6)]" /> : <UploadCloud className="w-6 h-6" />}
                        </div>
                        <span className="text-sm font-semibold text-white/70">
                          {panFile ? panFile.name : 'Click to upload PAN Card'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Aadhaar Card Upload */}
                  <div className="space-y-3">
                    <Label className="text-white/90 font-semibold">Aadhaar Card</Label>
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-primary/50 transition-colors bg-black/20 text-center shadow-inner">
                      <input 
                        type="file" 
                        id="aadhaar" 
                        className="hidden" 
                        accept=".jpg,.jpeg,.png,.pdf" 
                        onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                        disabled={status === 'VERIFIED' || status === 'PENDING'}
                      />
                      <label htmlFor="aadhaar" className={`cursor-pointer flex flex-col items-center space-y-2 ${status !== 'NOT_SUBMITTED' && status !== 'REJECTED' ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                          {aadhaarFile ? <FileText className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(100,50,255,0.6)]" /> : <UploadCloud className="w-6 h-6" />}
                        </div>
                        <span className="text-sm font-semibold text-white/70">
                          {aadhaarFile ? aadhaarFile.name : 'Click to upload Aadhaar Card'}
                        </span>
                      </label>
                    </div>
                  </div>

                </form>
              )}
            </CardContent>
            {status !== 'VERIFIED' && (
              <CardFooter className="border-t border-white/10 px-8 py-6 bg-white/5">
                <Button 
                  type="submit" 
                  form="kyc-form" 
                  className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl text-lg font-semibold shadow-[0_0_15px_rgba(100,50,255,0.5)] text-primary-foreground" 
                  disabled={isUploading || (!panFile && !aadhaarFile) || status === 'VERIFIED' || status === 'PENDING'}
                >
                  {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Submit Documents
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card className="glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] card-3d">
            <CardHeader className="px-6 pt-6 border-b border-white/5">
              <CardTitle className="text-white text-xl neon-text-glow">Verification Benefits</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-6 space-y-4">
              <BenefitItem title="Higher Limits" desc="Transfer up to ₹5,00,000 per day." />
              <BenefitItem title="Instant Loans" desc="Unlock AI-powered lending access." />
              <BenefitItem title="Global Transfers" desc="Send money across borders seamlessly." />
              
              <div className="mt-8 p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-start gap-3 shadow-[0_0_10px_rgba(100,50,255,0.1)]">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-white mb-1">OCR Processing</p>
                  <p className="text-white/60 font-medium">Our AI will automatically extract details from your documents for faster verification.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'VERIFIED') return <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.3)]"><CheckCircle2 className="w-4 h-4 mr-2" /> VERIFIED</span>;
  if (status === 'PENDING') return <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.3)]"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> PENDING</span>;
  if (status === 'REJECTED') return <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-destructive/20 text-red-400 border border-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><AlertCircle className="w-4 h-4 mr-2" /> REJECTED</span>;
  
  return <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-white/10 text-white/70 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]"><AlertCircle className="w-4 h-4 mr-2" /> UNVERIFIED</span>;
}

function BenefitItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_8px_rgba(100,50,255,0.3)]">
        <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-[0_0_3px_rgba(100,50,255,0.8)]" />
      </div>
      <div>
        <h4 className="text-white font-bold">{title}</h4>
        <p className="text-sm text-white/50 font-medium">{desc}</p>
      </div>
    </div>
  );
}
