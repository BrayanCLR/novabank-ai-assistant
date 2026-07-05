import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export type EmbeddingTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'CRÍTICO: GEMINI_API_KEY no encontrada en variables de entorno',
      );
    }
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = this.configService.get<string>(
      'EMBEDDING_MODEL',
      'gemini-embedding-001',
    );
  }

  getModelName(): string {
    return this.modelName;
  }

  async embed(text: string, taskType: EmbeddingTaskType): Promise<number[]> {
    try {
      const result = await this.client.models.embedContent({
        model: this.modelName,
        contents: text,
        config: { taskType },
      });

      const values = result.embeddings?.[0]?.values;
      if (!values) {
        throw new Error('La API de embeddings no devolvió un vector.');
      }
      return values;
    } catch (error) {
      this.logger.error('Error generando embedding', error as Error);
      throw new InternalServerErrorException(
        'No fue posible generar el embedding del texto.',
      );
    }
  }

  async embedBatch(
    texts: string[],
    taskType: EmbeddingTaskType,
  ): Promise<number[][]> {
    try {
      const result = await this.client.models.embedContent({
        model: this.modelName,
        contents: texts,
        config: { taskType },
      });

      const embeddings = result.embeddings?.map((e) => e.values ?? []);
      if (!embeddings || embeddings.length !== texts.length) {
        throw new Error(
          'La cantidad de embeddings devueltos no coincide con los textos enviados.',
        );
      }
      return embeddings;
    } catch (error) {
      this.logger.error('Error generando embeddings en lote', error as Error);
      throw new InternalServerErrorException(
        'No fue posible generar los embeddings de la base de conocimiento.',
      );
    }
  }
}
