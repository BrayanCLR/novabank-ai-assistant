import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { EmbeddingService } from '../gemini/embedding.service';
import { UniversalParser } from '../parsers/universal.parser';
import { chunkText } from './chunking.util';
import { EmbeddedChunk, VectorStoreService } from './vector-store.service';

@Injectable()
export class KnowledgeService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeService.name);
  private indexingPromise: Promise<void> | null = null;
  private lastIndexedAt: Date | null = null;
  private readonly TOP_K = 6;
  private readonly MAX_CHUNK_CHARS = 800;

  constructor(
    private readonly parser: UniversalParser,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureIndex();
  }

  private async ensureIndex(): Promise<void> {
    if (this.vectorStore.isIndexed()) return;
    if (!this.indexingPromise) {
      this.indexingPromise = this.buildIndex();
    }
    await this.indexingPromise;
  }

  private async buildIndex(): Promise<void> {
    this.logger.log(
      'Construyendo índice vectorial de la Base de Conocimiento...',
    );

    this.lastIndexedAt = new Date();

    const kbPath = path.resolve(process.cwd(), '../knowledge_base');
    const files = await fsPromises.readdir(kbPath, { withFileTypes: true });

    const validFiles = files
      .filter(
        (file) =>
          file.isFile() &&
          this.parser.supportedExtensions.includes(
            path.extname(file.name).toLowerCase(),
          ),
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    const allChunks: { text: string; fileName: string; chunkIndex: number }[] =
      [];

    for (const file of validFiles) {
      const filePath = path.join(kbPath, file.name);
      try {
        const parsed = await this.parser.parse(filePath);

        if (!parsed.text?.trim()) {
          this.logger.warn(
            `${file.name} no contiene texto extraíble, se omite.`,
          );
          continue;
        }

        const pieces = chunkText(parsed.text, this.MAX_CHUNK_CHARS);
        pieces.forEach((piece, index) => {
          allChunks.push({
            text: piece,
            fileName: file.name,
            chunkIndex: index,
          });
        });

        this.logger.debug(`${file.name} -> ${pieces.length} chunk(s)`);
      } catch (error) {
        this.logger.error(
          `Error procesando ${file.name} durante la indexación`,
          error as Error,
        );
      }
    }

    if (allChunks.length === 0) {
      this.logger.warn(
        'No se generó ningún chunk. El agente responderá sin contexto.',
      );
      return;
    }

    this.logger.log(
      `Generando embeddings para ${allChunks.length} chunk(s)...`,
    );

    const embeddings = await this.embeddingService.embedBatch(
      allChunks.map((c) => c.text),
      'RETRIEVAL_DOCUMENT',
    );

    const embeddedChunks: EmbeddedChunk[] = allChunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i],
    }));

    this.vectorStore.index(embeddedChunks);
  }

  async getRelevantContext(query: string): Promise<string> {
    await this.ensureIndex();

    if (!this.vectorStore.isIndexed()) {
      return '';
    }

    const queryEmbedding = await this.embeddingService.embed(
      query,
      'RETRIEVAL_QUERY',
    );
    const relevantChunks = this.vectorStore.search(queryEmbedding, this.TOP_K);

    this.logger.debug(
      `Chunks recuperados: ` +
        relevantChunks.map((c) => `${c.fileName}#${c.chunkIndex}`).join(', '),
    );

    return relevantChunks
      .map(
        (c) =>
          `\n--- Documento: ${c.fileName} (fragmento ${c.chunkIndex + 1}) ---\n${c.text}\n`,
      )
      .join('\n')
      .trim();
  }

  async reindex(): Promise<void> {
    this.indexingPromise = null;
    this.vectorStore.index([]);
    await this.ensureIndex();
  }

  getStatus() {
    return {
      documentsIndexed: this.vectorStore.getUniqueFileNames().length,
      chunksIndexed: this.vectorStore.count(),
      lastIndexedAt: this.lastIndexedAt,
      embeddingModel: this.embeddingService.getModelName(),
    };
  }
}
