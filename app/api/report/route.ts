import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { groq } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const { sessionId, qaLog: clientQaLog } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    if (sessionId === '${sessionData.sessionId}') {
      return NextResponse.json({ 
        error: 'PLEASE REFRESH YOUR BROWSER. Your browser is still using an old cached version of the app. Hit F5 or Ctrl+R to completely refresh the page, then try again!' 
      }, { status: 400 });
    }

    let qaLog = clientQaLog;

    if (!qaLog || qaLog.length === 0) {
      const supabase = createAdminClient();

      // 1. Fetch session data (fallback if not provided by client)
      const { data: session, error: fetchError } = await supabase
        .from('interview_sessions')
        .select('qa_log')
        .eq('id', sessionId)
        .single();

      if (!fetchError && session) {
        qaLog = session.qa_log || [];
      }
    }
    if (qaLog.length === 0) {
      return NextResponse.json({ error: 'No answers recorded yet' }, { status: 400 });
    }

    // 2. Compute accuracy
    let correctCount = 0;
    
    qaLog.forEach((log: Record<string, unknown>) => {
      if (log.isCorrect) correctCount++;
    });

    const totalCount = qaLog.length;
    // Score out of 5 (assuming 5 questions)
    const overallScore = (correctCount / totalCount) * 5;

    // 3. Generate summary using Groq
    const systemPrompt = `You are an expert tech recruiter analyzing a mock interview session.
    Summarize the candidate's performance in exactly 3 sentences based on their MCQ accuracy.
    Focus on their demonstrated knowledge areas and gaps.`;

    const qaLogText = qaLog.map((log: Record<string, unknown>, idx: number) => `
      Q${idx+1}: ${log.question}
      Candidate Selected: ${log.selectedOptions?.join(', ')}
      Correct Answer: ${log.correctAnswers?.join(', ')}
      Result: ${log.isCorrect ? 'Correct' : 'Incorrect'}
    `).join('\n\n');

    const userPrompt = `
      Accuracy: ${correctCount}/${totalCount} (${((correctCount/totalCount)*100).toFixed(0)}%)
      
      Q&A Log:
      ${qaLogText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const summary = chatCompletion.choices[0].message.content || 'No summary generated.';

    return NextResponse.json({ 
      success: true,
      report: {
        overallScore: Number(overallScore.toFixed(2)),
        correctCount,
        totalCount,
        summary,
        qaLog: qaLog
      }
    });
  } catch (error: unknown) {
    console.error('Error in report route:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal Server Error' }, { status: 500 });
  }
}
