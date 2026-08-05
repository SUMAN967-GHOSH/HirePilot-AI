import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getEmbedding } from '@/lib/embeddings';
import { groq, tools } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const { jdId, bulletText } = await req.json();

    if (!jdId || !bulletText) {
      return NextResponse.json({ error: 'Must provide jdId and bulletText' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Embed the bullet point text
    const bulletEmbedding = await getEmbedding(bulletText);

    // Fetch all JD chunks with embeddings
    const { data: jdChunks, error: jdError } = await supabase
      .from('jd_chunks')
      .select('id, chunk_text, embedding')
      .eq('jd_id', jdId)
      .not('embedding', 'is', null);

    if (jdError) throw jdError;
    if (!jdChunks || jdChunks.length === 0) {
      return NextResponse.json({ error: 'JD chunks or embeddings not found' }, { status: 404 });
    }

    const { cosineSimilarity } = await import('@/lib/embeddings');

    // 2. Find top 3 most relevant JD chunks
    const matches = jdChunks.map(jdChunk => {
      const jdVector = typeof jdChunk.embedding === 'string' ? JSON.parse(jdChunk.embedding) : jdChunk.embedding;
      return {
        chunk_text: jdChunk.chunk_text,
        similarity: cosineSimilarity(bulletEmbedding, jdVector)
      };
    });

    matches.sort((a, b) => b.similarity - a.similarity);
    const topMatches = matches.slice(0, 3);

    // 3. Prompt Groq with the context
    const jdContext = topMatches && topMatches.length > 0 
      ? topMatches.map((m: unknown) => m.chunk_text).join('\n')
      : 'No specific relevant JD context found.';

    const systemPrompt = `You are an expert resume writer. Rewrite the provided resume bullet point to better align with the language and requirements of the target job description. 
    
    CRITICAL RULES:
    1. Only use facts present in the original bullet point.
    2. Do NOT invent new experience, metrics, or skills.
    3. Emphasize aspects that align with the provided Job Description context.
    4. Call the rewriteBullet function with the result.`;

    const userPrompt = `
      Job Description Context:
      ${jdContext}

      Original Resume Bullet:
      ${bulletText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      tools: tools,
      tool_choice: { type: 'function', function: { name: 'rewriteBullet' } }
    });

    const toolCall = chatCompletion.choices[0].message.tool_calls?.[0];
    let result = null;
    
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      throw new Error('LLM failed to call rewriteBullet tool');
    }

    return NextResponse.json({ 
      success: true,
      original: result.original || bulletText,
      rewritten: result.rewritten,
      reasoning: result.reasoning
    });
  } catch (error: unknown) {
    console.error('Error in rewrite route:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal Server Error' }, { status: 500 });
  }
}
