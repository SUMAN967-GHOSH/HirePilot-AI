'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepProgress } from '@/components/shared/StepProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const sessionStr = sessionStorage.getItem('hirepilot_session');
    if (!sessionStr) {
      router.push('/upload');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(JSON.parse(sessionStr));
  }, [router]);

  if (!data) return null;

  const matchScore = data.matchData.rawScore || 0;
  const assessment = data.matchData.assessment || {};
  const matchedSkills = assessment.matchedSkills || [];
  const missingSkills = assessment.missingSkills || [];

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: data.resumeId, jdId: data.jdId })
      });
      const result = await res.json();
      
      if (!result.success) throw new Error(result.error);

      sessionStorage.setItem('hirepilot_interview', JSON.stringify({
        sessionId: result.sessionId,
        questions: result.questions,
        currentQ: 0
      }));

      router.push('/interview');
    } catch (err: unknown) {
      alert('Error starting interview: ' + (err instanceof Error ? err.message : String(err)));
      setIsStarting(false);
    }
  };

  return (
    <main className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/upload')} className="text-slate-400 hover:text-white mb-4 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
        </Button>
        <div className="flex justify-center">
          <StepProgress currentStep={2} />
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-8">
        {/* Match Score Card */}
        <Card className="bg-card/50 backdrop-blur border-border p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
          <h3 className="text-xl font-medium mb-6 text-card-foreground">Match Score</h3>
          
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            {/* Animated ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" className="stroke-muted" strokeWidth="16" fill="none" />
              <circle 
                cx="96" cy="96" r="88" 
                className={`${matchScore > 75 ? 'stroke-emerald-500' : matchScore > 50 ? 'stroke-amber-500' : 'stroke-rose-500'} transition-all duration-1000 ease-out`}
                strokeWidth="16" fill="none" 
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - matchScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-foreground">{matchScore}%</span>
              <span className="text-sm text-muted-foreground mt-1">
                {matchScore > 75 ? 'Strong Match' : matchScore > 50 ? 'Fair Match' : 'Weak Match'}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm mb-8 text-left bg-background p-4 rounded-lg border border-border">
            {assessment.explanation || 'No explanation provided.'}
          </p>

          <Button 
            onClick={handleStartInterview} 
            disabled={isStarting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
          >
            {isStarting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isStarting ? 'Starting...' : 'Start Mock Interview'}
            {!isStarting && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </Card>

        {/* Skill Analysis */}
        <Card className="bg-card/50 backdrop-blur border-border p-6 hover:border-primary/50 transition-colors">
          <h3 className="text-xl font-medium mb-6 text-card-foreground">Skill Analysis</h3>
          
          <div className="mb-8">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> 
              Matched Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length > 0 ? matchedSkills.map((skill: string, i: number) => (
                <Badge key={i} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1 text-sm">
                  {skill}
                </Badge>
              )) : <span className="text-muted-foreground/50 text-sm">No matched skills identified.</span>}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center">
              <XCircle className="w-4 h-4 mr-2 text-rose-500" /> 
              Missing Skills (Gaps)
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? missingSkills.map((skill: string, i: number) => (
                <Badge key={i} variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 px-3 py-1 text-sm">
                  {skill}
                </Badge>
              )) : <span className="text-muted-foreground/50 text-sm">No significant gaps identified.</span>}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border">
             <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Top Resume Strengths</h4>
             <ul className="space-y-4">
               {data.matchData.topMatches.map((match: Record<string, unknown>, idx: number) => (
                 <li key={idx} className="text-sm bg-background p-3 rounded-md border border-border">
                    <p className="text-muted-foreground mb-1"><span className="text-primary font-medium">JD wants:</span> {match.jdChunk}</p>
                    <p className="text-card-foreground"><span className="text-emerald-400 font-medium">You have:</span> {match.resumeChunk}</p>
                 </li>
               ))}
             </ul>
          </div>
        </Card>
      </div>
    </main>
  );
}
