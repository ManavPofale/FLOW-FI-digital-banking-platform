import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-black">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <p className="mt-4 text-zinc-500 font-medium animate-pulse">Loading FlowFi...</p>
    </div>
  );
}
