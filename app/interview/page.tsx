'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepProgress } from '@/components/shared/StepProgress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, ArrowRight, Target, XCircle } from 'lucide-react';

export default function InterviewPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<Record<string, unknown> | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [lastScore, setLastScore] = useState<any>(null);
  
  useEffect(() => {
    const data = sessionStorage.getItem('hirepilot_interview');
    if (!data) {
      router.push('/upload');
      return;
    }
    const parsed = JSON.parse(data);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionData(parsed);
    setCurrentQIndex(parsed.currentQ || 0);
  }, [router]);

  if (!sessionData || !sessionData.questions) return null;

  const currentQ = sessionData.questions[currentQIndex];
  const isFinished = currentQIndex >= sessionData.questions.length;

  if (isFinished) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Generating Final Report...</h2>
      </main>
    );
  }

  const toggleOption = (opt: string) => {
    setSelectedOptions(prev => 
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) return;
    
    // Grading logic (exact match)
    const correctAnswers = currentQ.correctAnswers || [];
    const isCorrect = 
      selectedOptions.length === correctAnswers.length &&
      selectedOptions.every(val => correctAnswers.includes(val));

    // Update session log
    const updatedLog = [
      ...(sessionData.qa_log || []),
      {
        questionId: currentQ.id,
        question: currentQ.question,
        selectedOptions,
        correctAnswers,
        isCorrect,
        explanation: currentQ.explanation
      }
    ];

    const updatedSession = {
      ...sessionData,
      qa_log: updatedLog
    };

    setSessionData(updatedSession);
    setLastScore({ isCorrect, explanation: currentQ.explanation, correctAnswers });
  };

  const handleNext = () => {
    setLastScore(null);
    setSelectedOptions([]);
    
    const nextIndex = currentQIndex + 1;
    if (nextIndex >= sessionData.questions.length) {
      sessionStorage.setItem('hirepilot_interview', JSON.stringify({
        ...sessionData,
        currentQ: nextIndex
      }));
      router.push(`/report?session=${sessionData.sessionId}`);
    } else {
      setCurrentQIndex(nextIndex);
      sessionStorage.setItem('hirepilot_interview', JSON.stringify({
        ...sessionData,
        currentQ: nextIndex
      }));
    }
  };

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-center mt-4">
        <StepProgress currentStep={3} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-200">Mock Interview</h2>
        <Badge variant="outline" className="text-slate-400 border-slate-700">
          Question {currentQIndex + 1} of {sessionData.questions.length}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Question Card */}
        <Card className="bg-slate-900/80 backdrop-blur border-slate-800 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
          
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 mr-4 shrink-0">
              🤖
            </div>
            <div>
              <p className="text-lg text-slate-200 leading-relaxed font-medium">
                {currentQ.question}
              </p>
            </div>
          </div>
          
          <div className="ml-14 flex items-center space-x-2 mt-4">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Targeted Area:</span>
            <span className="text-sm text-slate-400">{currentQ.targetedGap}</span>
            <Badge variant="secondary" className="ml-4 bg-slate-800 text-slate-300">
              Multiple answers possible
            </Badge>
          </div>
        </Card>

        {/* Options */}
        {!lastScore ? (
          <Card className="bg-slate-950/50 border-slate-800 p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Select all that apply</h3>
            
            <div className="space-y-3 mb-6">
              {(currentQ.options || []).map((opt: string, idx: number) => {
                const isSelected = selectedOptions.includes(opt);
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleOption(opt)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border ${isSelected ? 'bg-violet-600 border-violet-500 text-white' : 'border-slate-600'}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-slate-300">{opt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={selectedOptions.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Submit Answer
              </Button>
            </div>
          </Card>
        ) : (
          <Card className={`border p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 ${lastScore.isCorrect ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900 border-rose-500/30'}`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${lastScore.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
              {lastScore.isCorrect ? (
                <><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" /> Correct!</>
              ) : (
                <><XCircle className="w-5 h-5 text-rose-400 mr-2" /> Incorrect</>
              )}
            </h3>
            
            {!lastScore.isCorrect && (
              <div className="mb-4">
                <span className="text-sm text-slate-400 block mb-1">Correct Answers:</span>
                <ul className="list-disc pl-5 text-emerald-400 text-sm">
                  {lastScore.correctAnswers.map((ans: string, i: number) => <li key={i}>{ans}</li>)}
                </ul>
              </div>
            )}
            
            <div className="bg-violet-950/30 border border-violet-500/20 rounded-lg p-4 mb-6">
              <p className="text-slate-300"><strong>Explanation:</strong> {lastScore.explanation}</p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700 text-white">
                {currentQIndex + 1 >= sessionData.questions.length ? 'Finish & View Report' : 'Next Question'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
