import { Injectable, Logger } from '@nestjs/common';

export interface EmbeddedChunk {
  text: string;
  embedding: number[];
  fileName: string;
  chunkIndex: number;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private chunks: EmbeddedChunk[] = [];

  index(chunks: EmbeddedChunk[]): void {
    this.chunks = chunks;
    this.logger.log(`Índice vectorial construido con ${chunks.length} chunk(s).`);
  }

  isIndexed(): boolean {
    return this.chunks.length > 0;
  }

  search(queryEmbedding: number[], topK: number): EmbeddedChunk[] {
    const scored = this.chunks.map((chunk) => ({
      chunk,
      score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map((s) => s.chunk);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
