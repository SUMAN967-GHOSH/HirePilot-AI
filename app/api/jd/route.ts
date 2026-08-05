import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { chunkText } from '@/lib/chunker';
import { getEmbedding } from '@/lib/embeddings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, url, company, role } = body;

    if (!text && !url) {
      return NextResponse.json({ error: 'Must provide either text or url' }, { status: 400 });
    }

    let jdText = text || '';

    // If URL is provided, fetch via Jina Reader
    if (url && !text) {
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
      const response = await fetch(jinaUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch JD from URL');
      }
      jdText = await response.text();
    }

    if (!jdText || jdText.trim() === '') {
      return NextResponse.json({ error: 'Could not extract text for JD' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Insert into job_descriptions table
    const { data: jdData, error: jdError } = await supabase
      .from('job_descriptions')
      .insert({
        company: company || 'Unknown',
        role: role || 'Unknown',
        jd_text: jdText
      })
      .select('id')
      .single();

    if (jdError) throw jdError;

    const jdId = jdData.id;

    // 2. Chunk text
    const chunks = chunkText(jdText, 500, 50);
    
    // 3. Insert chunks and embed immediately for JD since it's smaller
    for (let i = 0; i < chunks.length; i++) {
      const chunk_text = chunks[i];
      const embedding = await getEmbedding(chunk_text);
      
      const { error: chunkError } = await supabase
        .from('jd_chunks')
        .insert({
          jd_id: jdId,
          chunk_text,
          embedding
        });

      if (chunkError) {
        console.error('Error inserting JD chunk:', chunkError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      jdId, 
      chunkCount: chunks.length 
    });
  } catch (error: unknown) {
    console.error('Error in jd route:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal Server Error' }, { status: 500 });
  }
}
