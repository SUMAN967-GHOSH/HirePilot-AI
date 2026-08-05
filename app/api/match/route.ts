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
    
    let totalSimilarity = 0;
    const matchResults = [];

    // 2. For each JD chunk, find the best matching resume chunk
    for (const jdChunk of jdChunks) {
      // Manual vector search
      let bestMatch = null;
      let highestSim = -1;

      let jdVector = typeof jdChunk.embedding === 'string' ? JSON.parse(jdChunk.embedding) : jdChunk.embedding;

      for (const resumeChunk of resumeChunks) {
        let resumeVector = typeof resumeChunk.embedding === 'string' ? JSON.parse(resumeChunk.embedding) : resumeChunk.embedding;
        const sim = cosineSimilarity(jdVector, resumeVector);
        if (sim > highestSim) {
          highestSim = sim;
          bestMatch = resumeChunk;
        }
      }

      const similarity = highestSim > -1 ? highestSim : 0;
      totalSimilarity += similarity;

      matchResults.push({
        jdChunk: jdChunk.chunk_text,
        resumeChunk: bestMatch ? bestMatch.chunk_text : null,
        similarity
      });
    }

    // Sort to find gaps (lowest similarity)
    matchResults.sort((a, b) => a.similarity - b.similarity);
    const gaps = matchResults.slice(0, 3).map(m => m.jdChunk);
    
    // Sort to find strong matches
    const topMatches = [...matchResults].sort((a, b) => b.similarity - a.similarity).slice(0, 3);
    
    // Raw average similarity score (0 to 1)
    const averageSimilarity = totalSimilarity / jdChunks.length;
    
    // Convert to 0-100 scale, perhaps slightly curved so it looks reasonable
    // Since cosine similarity for text is often high, we might map 0.5-1.0 to 0-100
    // But let's just use raw percentage and let the LLM analyze it
    const rawScore = Math.max(0, Math.min(100, Math.round(averageSimilarity * 100)));

    // 3. Optional: Call LLM to summarize the match (Phase 3 overlapping functionality, 
    // but the plan says match score is returned here, and dashboard shows it)
    // The plan: `computeMatchScore` tool returns structured match assessment
    // Let's call Groq to give a structured explanation based on the top matches and gaps
    
    const prompt = `
      Analyze the fit between a candidate's resume and a job description.
      Raw Match Score: ${rawScore}%
      
      Top Resume Strengths (High match with JD):
      ${topMatches.map(m => `- JD: ${m.jdChunk}\n  Resume: ${m.resumeChunk}`).join('\n\n')}
      
      Key Gaps (Low match with JD):
      ${gaps.map(g => `- ${g}`).join('\n')}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert technical recruiter analyzing a resume against a job description. Call the computeMatchScore function to output your results.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      tools: tools,
      tool_choice: { type: 'function', function: { name: 'computeMatchScore' } }
    });

    const toolCall = chatCompletion.choices[0].message.tool_calls?.[0];
    let matchAssessment = null;
    
    if (toolCall) {
      matchAssessment = JSON.parse(toolCall.function.arguments);
    }

    return NextResponse.json({ 
      success: true,
      rawScore,
      gaps,
      topMatches,
      assessment: matchAssessment
    });
  } catch (error: unknown) {
    console.error('Error in match route:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal Server Error' }, { status: 500 });
  }
}
