import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { resumeId, jdId } = await req.json();

    if (!resumeId || !jdId) {
      return NextResponse.json({ error: 'Must provide both resumeId and jdId' }, { status: 400 });
    }

    // Call our own generate-questions endpoint
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const generateUrl = new URL('/api/generate-questions', `${proto}://${host}`);

    const qResponse = await fetch(generateUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeId, jdId })
    });

    if (!qResponse.ok) {
      throw new Error('Failed to generate questions');
    }

    const { questions } = await qResponse.json();

    if (!questions || questions.length === 0) {
      throw new Error('No questions generated');
    }

    const supabase = createAdminClient();

    // Create a new interview session
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        resume_id: resumeId,
        jd_id: jdId,
        qa_log: [],
        rubric_scores: []
      })
      .select('id')
      .single();

    if (sessionError) throw sessionError;

    return NextResponse.json({ 
      success: true,
      sessionId: sessionData.id,
      questions
    });
  } catch (error: unknown) {
    console.error('Error in interview start route:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal Server Error' }, { status: 500 });
  }
}
