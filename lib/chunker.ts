export function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length <= chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        // Start next chunk with overlap from the end of currentChunk
        currentChunk = currentChunk.slice(-overlap) + '\n\n' + paragraph;
      } else {
        // Paragraph itself is larger than chunkSize, need to force split
        // For simplicity, just push it as a single large chunk (or we could split by sentence/words)
        chunks.push(paragraph);
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}
