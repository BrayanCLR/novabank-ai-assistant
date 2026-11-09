import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly modelName: string;
  private readonly embeddingTimeoutMs: number;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'OLLAMA_BASE_URL',
      'http://ollama.brayan.co:11434/',
    );

    if (!this.baseUrl) {
      throw new Error(
        'CRÍTICO: OLLAMA_BASE_URL no encontrada en variables de entorno',
      );
    }

    this.embeddingTimeoutMs = this.configService.get<number>(
      'EMBEDDING_TIMEOUT_MS',
      10000,
    );

    this.modelName = this.configService.get<string>(
      'EMBEDDING_MODEL',
      'nomic-embed-text',
    );
  }

  getModelName(): string {
    return this.modelName;
  }

  private withTimeout<T>(
    operation: Promise<T>,
    operationName: string,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error(
            `${operationName} tardó más de ${this.embeddingTimeoutMs}ms.`,
          ),
        );
      }, this.embeddingTimeoutMs);

      operation
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error instanceof Error ? error : new Error(String(error)));
        });
    });
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.withTimeout(
        fetch(`${this.baseUrl.replace(/\/+$/, '')}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: this.modelName, prompt: text }),
        }),
        'Generación de embedding',
      );

      if (!response.ok) {
        throw new Error('La API de embeddings no devolvió un vector.');
      }

      const payload = (await response.json()) as unknown;

      if (
        !payload ||
        typeof payload !== 'object' ||
        !('embedding' in payload) ||
        !Array.isArray(payload.embedding) ||
        !payload.embedding.every((value) => typeof value === 'number') ||
        payload.embedding.length !== 768
      ) {
        throw new Error('La API de embeddings no devolvió un vector válido.');
      }

      return payload.embedding;
    } catch (error) {
      this.logger.error('Error generando embedding', error as Error);
      throw new InternalServerErrorException(
        'No fue posible generar el embedding del texto.',
      );
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.withTimeout(
        Promise.all(texts.map((text) => this.embed(text))),
        'Generación de embeddings en lote',
      );

      const embeddings = response;
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
