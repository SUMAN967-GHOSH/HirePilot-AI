import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getEmbedding } from '@/lib/embeddings';

export async function POST(req: Request) {
  try {
    const { resumeId, jdId } = await req.json();

    if (!resumeId && !jdId) {
      return NextResponse.json({ error: 'Must provide either resumeId or jdId' }, { status: 400 });
    }

    const supabase = createAdminClient();
    let embeddedCount = 0;

    if (resumeId) {
      // Fetch all chunks for this resume that don't have embeddings
      const { data: chunks, error: fetchError } = await supabase
        .from('resume_chunks')
        .select('id, chunk_text')
        .eq('resume_id', resumeId)
        .is('embedding', null);

      if (fetchError) throw fetchError;

      if (chunks && chunks.length > 0) {
        // We'll process them sequentially to not overload the local Xenova model
        // (Could batch with Promise.all if needed, but sequential is safer for local memory)
        for (const chunk of chunks) {
          const embedding = await getEmbedding(chunk.chunk_text);
          
          await supabase
            .from('resume_chunks')
            .update({ embedding })
            .eq('id', chunk.id);
            
          embeddedCount++;
        }
      }
    }

    if (jdId) {
      // Fetch all chunks for this JD that don't have embeddings
      const { data: chunks, error: fetchError } = await supabase
        .from('jd_chunks')
        .select('id, chunk_text')
        .eq('jd_id', jdId)
        .is('embedding', null);

      if (fetchError) throw fetchError;

      if (chunks && chunks.length > 0) {
        for (const chunk of chunks) {
          const embedding = await getEmbedding(chunk.chunk_text);
          
          await supabase
            .from('jd_chunks')
            .update({ embedding })
            .eq('id', chunk.id);
            
          embeddedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, embeddedCount });
  } catch (error: any) {
    console.error('Error in embed route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
