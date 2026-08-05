import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { groq, tools } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const { resumeId, jdId } = await req.json();

    if (!resumeId || !jdId) {
      return NextResponse.json({ error: 'Must provide both resumeId and jdId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch all JD chunks with embeddings
    const { data: jdChunks, error: jdError } = await supabase
      .from('jd_chunks')
      .select('id, chunk_text, embedding')
      .eq('jd_id', jdId)
      .not('embedding', 'is', null);

    if (jdError) throw jdError;
    if (!jdChunks || jdChunks.length === 0) {
      return NextResponse.json({ error: 'JD chunks or embeddings not found' }, { status: 404 });
    }

    // Fetch all Resume chunks
    const { data: resumeChunks, error: resumeError } = await supabase
      .from('resume_chunks')
      .select('id, chunk_text, embedding')
      .eq('resume_id', resumeId)
      .not('embedding', 'is', null);

    if (resumeError) throw resumeError;
    if (!resumeChunks || resumeChunks.length === 0) {
      return NextResponse.json({ error: 'Resume chunks or embeddings not found' }, { status: 404 });
    }

    const { cosineSimilarity } = await import('@/lib/embeddings');
    const matchResults = [];

    // 2. For each JD chunk, find the best matching resume chunk
    for (const jdChunk of jdChunks) {
      let bestMatch = null;
      let highestSim = -1;

      const jdVector = typeof jdChunk.embedding === 'string' ? JSON.parse(jdChunk.embedding) : jdChunk.embedding;

      for (const resumeChunk of resumeChunks) {
        const resumeVector = typeof resumeChunk.embedding === 'string' ? JSON.parse(resumeChunk.embedding) : resumeChunk.embedding;
        const sim = cosineSimilarity(jdVector, resumeVector);
        if (sim > highestSim) {
          highestSim = sim;
          bestMatch = resumeChunk;
        }
      }
      
      matchResults.push({
        jdChunk: jdChunk.chunk_text,
        resumeChunk: bestMatch ? bestMatch.chunk_text : null,
        similarity: highestSim > -1 ? highestSim : 0
      });
    }

    // Sort to find gaps (lowest similarity) and strengths (highest similarity)
    matchResults.sort((a, b) => a.similarity - b.similarity);
    
    // Bottom 5 are the biggest gaps
    const gaps = matchResults.slice(0, 5);
    
    // Top 5 are the strongest matches
    const strengths = matchResults.slice(-5).reverse();
    
    // 3. Prompt LLM to generate questions
    const systemPrompt = `You are an expert technical recruiter. Generate exactly 5 Multiple Choice Questions (MCQs) for the candidate.
    Include a mix of:
    - Aptitude / Logical reasoning
    - Basic tech stack questions based on the job description
    - Targeted questions probing the candidate's resume gaps.
    
    IMPORTANT: These are MCQs where MULTIPLE options can be correct. Provide 4-5 options per question.
    Call the generateInterviewQuestions function to output your results.`;

    const userPrompt = `
      Candidate's WEAKEST areas (Gaps compared to JD):
      ${gaps.map(g => `- JD Requirement: ${g.jdChunk}\n  Closest Resume Context: ${g.resumeChunk || 'None'}`).join('\n\n')}

      Candidate's STRONG areas:
      ${strengths.map(s => `- ${s.resumeChunk}`).join('\n')}

      Generate 5 MCQs. Make them challenging. For each question, explain what gap or skill it targets, provide the options, the exact correct answers, and an explanation.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      tools: tools,
      tool_choice: { type: 'function', function: { name: 'generateInterviewQuestions' } }
    });

    const toolCall = chatCompletion.choices[0].message.tool_calls?.[0];
    let result = null;
    
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      throw new Error('LLM failed to call generateInterviewQuestions tool');
    }

    return NextResponse.json({ 
      success: true,
      questions: result.questions
    });
  } catch (error: unknown) {
    console.error('Error in generate-questions route:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal Server Error' }, { status: 500 });
  }
}
