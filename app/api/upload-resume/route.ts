import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { chunkText } from '@/lib/chunker';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text.replace(/\0/g, ''); // Remove null characters if any

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Insert into resumes table
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        content: text
      })
      .select('id')
      .single();

    if (resumeError) {
      console.error('Error inserting resume:', resumeError);
      return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
    }

    const resumeId = resumeData.id;

    // 2. Chunk text and insert chunks
    const chunks = chunkText(text, 500, 50);
    
    // Lazy load getEmbedding
    const { getEmbedding } = await import('@/lib/embeddings');
    
    // 3. Insert chunks and embed immediately for resume
    for (let i = 0; i < chunks.length; i++) {
      const chunk_text = chunks[i];
      const embedding = await getEmbedding(chunk_text);
      
      const { error: chunksError } = await supabase
        .from('resume_chunks')
        .insert({
          resume_id: resumeId,
          chunk_text,
          embedding
        });

      if (chunksError) {
        console.error('Error inserting chunk:', chunksError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      resumeId, 
      chunkCount: chunks.length 
    });
  } catch (error: any) {
    console.error('Error in upload-resume:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
