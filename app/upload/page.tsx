'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepProgress } from '@/components/shared/StepProgress';
import { ResumeDropzone } from '@/components/upload/ResumeDropzone';
import { JDInputPanel } from '@/components/upload/JDInputPanel';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');

  const handleAnalyze = async () => {
    if (!file || (!jdText && !jdUrl)) {
      alert('Please provide both a resume and a job description.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Upload Resume
      setProgressText('Uploading and parsing resume...');
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) throw new Error(uploadData.error);
      const resumeId = uploadData.resumeId;

      // 2. Upload JD
      setProgressText('Analyzing job description...');
      const jdRes = await fetch('/api/jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: jdText, url: jdUrl, company, role })
      });
      const jdData = await jdRes.json();
      
      if (!jdData.success) throw new Error(jdData.error);
      const jdId = jdData.jdId;

      // 3. Trigger Embedding
      setProgressText('Generating semantic embeddings...');
      await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, jdId })
      });

      // 4. Calculate Match Score
      setProgressText('Calculating match score...');
      const matchRes = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, jdId })
      });
      const matchData = await matchRes.json();
      
      if (!matchData.success) throw new Error(matchData.error);

      // Store in session storage for the next page
      sessionStorage.setItem('hirepilot_session', JSON.stringify({
        resumeId,
        jdId,
        matchData
      }));

      router.push('/dashboard');
    } catch (err: unknown) {
      alert('Error during processing: ' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
    }
  };

  return (
    <main className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-center mt-4">
        <StepProgress currentStep={1} />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <ResumeDropzone file={file} onFileSelect={setFile} />
        <JDInputPanel 
          jdText={jdText} setJdText={setJdText}
          jdUrl={jdUrl} setJdUrl={setJdUrl}
          company={company} setCompany={setCompany}
          role={role} setRole={setRole}
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        {isProcessing && (
          <div className="flex items-center space-x-3 mb-4 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">{progressText}</span>
          </div>
        )}
        <Button 
          onClick={handleAnalyze} 
          disabled={isProcessing || !file || (!jdText && !jdUrl)}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[240px] h-12 text-lg shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] disabled:opacity-50 disabled:shadow-none"
        >
          {isProcessing ? 'Processing...' : 'Analyze Match'}
          {!isProcessing && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </div>
    </main>
  );
}
