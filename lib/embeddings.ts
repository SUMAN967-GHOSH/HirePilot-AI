// Singleton pattern — model loads once per Node process
let pipeline: any = null;

export async function getEmbedding(text: string): Promise<number[]> {
  if (!pipeline) {
    const { pipeline: p } = await import('@xenova/transformers');
    pipeline = await p('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await pipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
