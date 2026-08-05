'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="container max-w-xl mx-auto px-4 py-32 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
      <p className="text-slate-400 mb-8">
        We encountered an unexpected error. This might be due to a rate limit or a network issue.
      </p>
      <Button
        onClick={() => reset()}
        className="bg-violet-600 hover:bg-violet-700 text-white"
      >
        Try again
      </Button>
    </main>
  );
}
