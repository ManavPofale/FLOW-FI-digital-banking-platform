'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
      <h2 className="text-3xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        We encountered an unexpected error. Please try again or return to the dashboard.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Try again
        </Button>
        <Button 
          variant="outline" 
          className="border-zinc-700 hover:bg-zinc-800"
          onClick={() => window.location.href = '/dashboard'}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
