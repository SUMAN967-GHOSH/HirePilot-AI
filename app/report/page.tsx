'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StepProgress } from '@/components/shared/StepProgress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { Suspense } from 'react';

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');
  
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push('/upload');
      return;
    }
    
    if (sessionId === '${sessionData.sessionId}') {
      router.push('/interview');
      return;
    }

    const fetchReport = async () => {
      try {
        const sessionStr = sessionStorage.getItem('hirepilot_interview');
        const sessionDataObj = sessionStr ? JSON.parse(sessionStr) : null;
        const qaLog = sessionDataObj?.qa_log || [];

        const res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, qaLog })
        });
        
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        
        setReport(data.report);
      } catch (err: any) {
        alert('Error loading report: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-32 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Session Data...</h2>
        <p className="text-slate-400">Compiling your interview scorecard.</p>
      </main>
    );
  }

  if (!report) return null;

  const percentage = (report.correctCount / report.totalCount) * 100;

  return (
    <main className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-center mt-4">
        <StepProgress currentStep={4} />
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Interview Report</h2>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-8">
        {/* Left Column: Score */}
        <div className="space-y-6">
          <Card className="bg-slate-900/50 backdrop-blur border-slate-800 p-6 flex flex-col items-center text-center">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Accuracy Score</h3>
            
            <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-slate-800" strokeWidth="16" fill="none" />
                <circle 
                  cx="96" cy="96" r="88" 
                  className={`${percentage >= 80 ? 'stroke-emerald-500' : percentage >= 50 ? 'stroke-amber-500' : 'stroke-rose-500'} transition-all duration-1000 ease-out`}
                  strokeWidth="16" fill="none" 
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{report.correctCount} / {report.totalCount}</span>
                <span className="text-sm text-slate-400 mt-2">{Math.round(percentage)}% Correct</span>
              </div>
            </div>
          </Card>
          
          <div className="flex flex-col gap-4">
             <Button variant="outline" className="w-full h-12 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => window.print()}>
               <Download className="w-4 h-4 mr-2" /> Export PDF
             </Button>
             <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white" onClick={() => router.push('/upload')}>
               <RotateCcw className="w-4 h-4 mr-2" /> Start New Session
             </Button>
          </div>
        </div>

        {/* Right Column: Summary & Log */}
        <div className="space-y-6">
          <Card className="bg-slate-900/50 backdrop-blur border-slate-800 p-6">
            <h3 className="text-xl font-bold text-slate-200 mb-4">AI Recruiter Summary</h3>
            <div className="prose prose-invert">
              <p className="text-slate-300 leading-relaxed text-lg">
                {report.summary}
              </p>
            </div>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur border-slate-800 p-6">
            <h3 className="text-xl font-bold text-slate-200 mb-6">Detailed Q&A Log</h3>
            <div className="space-y-8">
              {report.qaLog?.map((log: any, idx: number) => (
                <div key={idx} className="border-b border-slate-800 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-slate-200 pr-8">
                      <span className="text-violet-400 mr-2">Q{idx + 1}:</span>
                      {log.question}
                    </p>
                    {log.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-500 uppercase tracking-wider block mb-2">You Selected:</span>
                      <ul className="list-disc pl-4 text-sm text-slate-300 space-y-1">
                        {(log.selectedOptions || []).map((opt: string, i: number) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/50">
                      <span className="text-xs text-emerald-500/70 uppercase tracking-wider block mb-2">Correct Answers:</span>
                      <ul className="list-disc pl-4 text-sm text-emerald-400 space-y-1">
                        {(log.correctAnswers || []).map((opt: string, i: number) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-400 bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="font-medium text-slate-300 mr-2">Explanation:</span>
                    {log.explanation}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <main className="container max-w-3xl mx-auto px-4 py-32 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Loading Session...</h2>
      </main>
    }>
      <ReportContent />
    </Suspense>
  );
}
