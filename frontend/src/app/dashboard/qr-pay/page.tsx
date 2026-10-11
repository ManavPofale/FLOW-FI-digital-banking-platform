'use client';
import { useState, useRef } from 'react';
import { useGetPersonalQRQuery, usePayViaQRMutation } from '@/features/payment/paymentApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, QrCode, ScanLine, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function QrPayPage() {
  const [activeTab, setActiveTab] = useState<'my-qr' | 'scan'>('my-qr');
  
  const { data: qrData, isLoading: isLoadingQR, error } = useGetPersonalQRQuery({});
  const [payViaQR, { isLoading: isPaying }] = usePayViaQRMutation();

  const [scanResult, setScanResult] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // Fallback manual entry
  const [manualId, setManualId] = useState('');

  const startScanning = async () => {
    setCameraError('');
    setIsScanning(true);
    setScanResult(null);
    try {
      const videoInputDevices = await codeReader.current.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found.');
      }
      // Use the first available camera (usually rear camera on mobile)
      const selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId;
      
      codeReader.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
        if (result) {
          try {
            const data = JSON.parse(result.getText());
            if (data.flowfi_id) {
              setScanResult(data);
              stopScanning();
            }
          } catch (e) {
            // Invalid QR
          }
        }
        if (err && !(err.name === 'NotFoundException')) {
          console.error(err);
        }
      });
    } catch (err: any) {
      setCameraError(err.message || 'Camera access denied or unavailable.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    codeReader.current.reset();
    setIsScanning(false);
  };

  const handleManualLookup = () => {
    if (manualId) {
      setScanResult({ flowfi_id: manualId, email: 'Manual Entry' });
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanResult) return;

    try {
      await payViaQR({
        receiverId: scanResult.flowfi_id,
        amount: parseFloat(payAmount),
        note: payNote
      }).unwrap();
      
      alert('QR Payment Successful!');
      setScanResult(null);
      setPayAmount('');
      setPayNote('');
    } catch (err: any) {
      alert(err.data?.message || 'Payment failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 perspective-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white neon-text-glow">QR Payments</h1>
        <p className="text-white/60 mt-1 text-lg">Scan to pay or show your QR to receive money instantly.</p>
      </div>

      <div className="flex p-1 bg-black/40 rounded-xl w-full max-w-md mx-auto border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <button 
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'my-qr' ? 'bg-primary text-white shadow-[0_0_10px_rgba(100,50,255,0.6)] neon-glow' : 'text-white/50 hover:text-white'}`}
          onClick={() => { setActiveTab('my-qr'); stopScanning(); }}
        >
          My QR Code
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'scan' ? 'bg-primary text-white shadow-[0_0_10px_rgba(100,50,255,0.6)] neon-glow' : 'text-white/50 hover:text-white'}`}
          onClick={() => setActiveTab('scan')}
        >
          Scan & Pay
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 'my-qr' && (
          <Card className="max-w-md mx-auto glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] relative overflow-hidden card-3d">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
            <CardHeader className="text-center pt-8 border-b border-white/5 relative z-10">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 shadow-[0_0_10px_rgba(100,50,255,0.3)] border border-white/10 flex items-center justify-center mb-4">
                <QrCode className="w-7 h-7 text-primary drop-shadow-[0_0_8px_rgba(100,50,255,0.8)]" />
              </div>
              <CardTitle className="text-white text-2xl neon-text-glow">Receive Money</CardTitle>
              <CardDescription className="text-white/60 font-medium">Show this QR to any FlowFi user to get paid.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-10 pt-8 relative z-10">
              {isLoadingQR ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary my-10" />
              ) : qrData?.qrCode ? (
                <div className="p-5 bg-white/10 rounded-3xl shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20">
                  <img src={qrData.qrCode} alt="My QR Code" className="w-56 h-56 mix-blend-screen" />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-red-400 font-semibold drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">Failed to load QR code.</p>
                  <p className="text-red-400/70 text-sm mt-2">{error ? JSON.stringify(error) : 'No data received'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'scan' && (
          <Card className="max-w-md mx-auto glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] card-3d">
            <CardHeader className="px-8 pt-8 border-b border-white/5">
              <CardTitle className="text-white flex items-center gap-2 text-2xl neon-text-glow">
                <ScanLine className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(100,50,255,0.8)]" />
                Scan to Pay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8 pt-8">
              
              {!scanResult ? (
                <div className="space-y-6">
                  {cameraError && (
                    <div className="p-4 bg-destructive/20 border border-destructive/30 rounded-xl flex items-start gap-3 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-red-400">{cameraError}</p>
                    </div>
                  )}

                  <div className="relative w-full aspect-square bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner border border-white/10">
                    <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                    {!isScanning && (
                      <div className="text-center px-4 relative z-10">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_10px_rgba(0,0,0,0.5)] text-white/40">
                          <ScanLine className="w-8 h-8" />
                        </div>
                        <p className="text-white/50 font-semibold text-sm">Camera is inactive</p>
                      </div>
                    )}
                    {isScanning && (
                      <div className="absolute inset-0 border-[4px] border-primary/50 m-8 rounded-2xl pointer-events-none shadow-[inset_0_0_20px_rgba(100,50,255,0.5)]" />
                    )}
                  </div>

                  {!isScanning ? (
                    <Button onClick={startScanning} className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl text-lg shadow-[0_0_15px_rgba(100,50,255,0.5)] text-primary-foreground">
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={stopScanning} variant="destructive" className="w-full h-12 rounded-xl text-lg shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-destructive/80 hover:bg-destructive">
                      Stop Camera
                    </Button>
                  )}

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-white/40 text-xs font-bold uppercase tracking-wider">or enter ID manually</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <div className="flex gap-3">
                    <Input 
                      placeholder="Receiver FlowFi ID" 
                      value={manualId} 
                      onChange={(e) => setManualId(e.target.value)}
                      className="bg-black/20 border-white/10 text-white rounded-xl h-12 focus-visible:ring-primary placeholder:text-white/30"
                    />
                    <Button onClick={handleManualLookup} variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white h-12 rounded-xl font-semibold">Verify</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="p-5 bg-primary/10 border border-primary/30 rounded-2xl shadow-[0_0_15px_rgba(100,50,255,0.1)]">
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Paying to</p>
                    <p className="text-xl font-extrabold text-white truncate mt-1 neon-text-glow">{scanResult.email || 'User'}</p>
                    <p className="text-sm font-medium text-white/70 truncate">ID: {scanResult.flowfi_id}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/90 font-semibold">Amount (₹)</Label>
                    <Input 
                      type="number" 
                      required min="1" 
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="bg-black/20 border-white/10 text-white text-2xl h-16 rounded-2xl font-bold focus-visible:ring-primary placeholder:text-white/20 neon-glow"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/90 font-semibold">Add a note (Optional)</Label>
                    <Input 
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary placeholder:text-white/30"
                      placeholder="e.g. Dinner split"
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button type="button" onClick={() => setScanResult(null)} variant="outline" className="w-1/3 border-white/20 bg-white/5 hover:bg-white/10 text-white h-12 rounded-xl font-semibold">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPaying} className="flex-1 bg-primary hover:bg-primary/90 h-12 rounded-xl text-lg font-semibold shadow-[0_0_15px_rgba(100,50,255,0.5)] text-primary-foreground">
                      {isPaying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      Pay Now
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
