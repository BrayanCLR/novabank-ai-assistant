import { Injectable, Logger } from '@nestjs/common';
import { PostgresConnectionService } from '../database/postgres-connection.service';

export interface EmbeddedChunk {
  text: string;
  embedding: number[];
  fileName: string;
  chunkIndex: number;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(private readonly postgresConnection: PostgresConnectionService) {}

  async index(chunks: EmbeddedChunk[]): Promise<void> {
    const client = await this.postgresConnection.getPool().connect();
    try {
      // Reindexado completo: borrar todo y reinsertar. A esta escala
      // (decenas de chunks) es más simple y seguro que hacer un diff.
      await client.query('BEGIN');
      await client.query(`DELETE FROM knowledge_vectors`);

      for (const chunk of chunks) {
        const embedding = JSON.stringify(chunk.embedding);

        await client.query(
          `INSERT INTO knowledge_vectors (file_name, chunk_index, chunk_text, embedding)
           VALUES ($1, $2, $3, $4)`,
          [chunk.fileName, chunk.chunkIndex, chunk.text, embedding],
        );
      }

      await client.query('COMMIT');
      this.logger.log(
        `Índice vectorial reconstruido en PostgresSQL con ${chunks.length} chunk(s).`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Error al reconstruir el índice vectorial: ${message}`);

      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }

  async isIndexed(): Promise<boolean> {
    const total = await this.count();
    return total > 0;
  }

  async search(
    queryEmbedding: number[],
    topK: number,
  ): Promise<EmbeddedChunk[]> {
    try {
      const result = (await this.postgresConnection.query(
        `SELECT file_name, chunk_index, chunk_text
         FROM knowledge_vectors
         ORDER BY embedding <=> $1 ASC
         LIMIT $2`,
        [JSON.stringify(queryEmbedding), topK],
      )) as {
        rows?: Array<{
          file_name?: string;
          chunk_index?: number;
          chunk_text?: string;
        }>;
      };

      const rows = Array.isArray(result.rows) ? result.rows : [];

      return rows.map((row) => ({
        fileName: row.file_name ?? '',
        chunkIndex: row.chunk_index ?? 0,
        text: row.chunk_text ?? '',
        embedding: [], // no hace falta devolverlo: ya se usó dentro del SQL para ordenar
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error obteniendo los vectores embeddings por query: ${message}`,
      );
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = (await this.postgresConnection.query(
        `SELECT COUNT(*) AS "COUNT" FROM knowledge_vectors`,
      )) as { rows?: Array<{ COUNT?: number }> };
      const rows = Array.isArray(result.rows) ? result.rows : [];
      return Number(rows[0]?.COUNT ?? 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error obteniendo el conteo de vectores: ${message}`);
      throw error;
    }
  }

  async getUniqueFileNames(): Promise<string[]> {
    try {
      const result = (await this.postgresConnection.query(
        `SELECT DISTINCT file_name AS "FILE_NAME" FROM knowledge_vectors`,
      )) as { rows?: Array<{ FILE_NAME?: string }> };
      const rows = Array.isArray(result.rows) ? result.rows : [];
      return rows
        .map((r) => r.FILE_NAME)
        .filter(
          (name): name is string => typeof name === 'string' && name.length > 0,
        );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error obteniendo los nombres de archivos únicos de vectores: ${message}`,
      );
      throw error;
    }
  }
}
