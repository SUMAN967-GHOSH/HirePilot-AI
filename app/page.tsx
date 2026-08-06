import Link from 'next/link';
import { ArrowRight, Bot, FileText, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        
        <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-2 border border-border text-sm text-primary font-medium mb-4 shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:bg-muted/80 transition-colors cursor-pointer">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Powered by RAG & Agentic AI</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground pb-2">
          HirePilot AI
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload your resume and a job description. Our AI will analyze your semantic gaps, rewrite weak bullets, and run a targeted mock interview to help you land the role.
        </p>

        <div className="flex items-center justify-center pt-8 pb-12">
          <Link href="/upload">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg rounded-full shadow-[0_0_40px_rgba(var(--primary),0.4)] transition-all hover:scale-105">
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto border-t border-border/50 pt-12">
          <div className="bg-card/50 p-6 rounded-2xl border border-border backdrop-blur hover:border-primary/50 transition-colors">
            <FileText className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-card-foreground mb-2">Smart Matching</h3>
            <p className="text-sm text-muted-foreground">Uses local vector embeddings to find exact semantic gaps between your resume and the JD.</p>
          </div>
          <div className="bg-card/50 p-6 rounded-2xl border border-border backdrop-blur hover:border-primary/50 transition-colors">
            <Target className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-card-foreground mb-2">Tailored Prep</h3>
            <p className="text-sm text-muted-foreground">Generates interview questions explicitly designed to target your weakest match areas.</p>
          </div>
          <div className="bg-card/50 p-6 rounded-2xl border border-border backdrop-blur hover:border-primary/50 transition-colors">
            <Bot className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-card-foreground mb-2">Agentic Feedback</h3>
            <p className="text-sm text-muted-foreground">Scores your answers in real-time across clarity, relevance, and specificity using Llama 3.3.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
