import { Injectable, Logger } from '@nestjs/common';
import { OracleConnectionService } from '../database/oracle-connection.service';

export interface EmbeddedChunk {
  text: string;
  embedding: number[];
  fileName: string;
  chunkIndex: number;
}

type OracleConnectionLike = {
  execute: (...args: unknown[]) => Promise<unknown>;
  commit: () => Promise<unknown>;
  close: () => Promise<unknown>;
};

/**
 * Antes: array en memoria + similitud coseno calculada a mano.
 * Ahora: Oracle Database 23ai + VECTOR_DISTANCE().
 * El contrato público (los nombres de estos 5 métodos) NO cambió —
 * por eso KnowledgeService casi no necesita tocarse.
 */
@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(private readonly oracleConnection: OracleConnectionService) {}

  private async closeConnection(
    connection: OracleConnectionLike | null | undefined,
  ): Promise<void> {
    if (!connection) {
      return;
    }

    try {
      await connection.close();
    } catch (error) {
      this.logger.warn(
        `No se pudo cerrar la conexión de Oracle de forma limpia: ${String(error)}`,
      );
    }
  }

  async index(chunks: EmbeddedChunk[]): Promise<void> {
    const connection = await this.oracleConnection.getConnection();
    try {
      // Reindexado completo: borrar todo y reinsertar. A esta escala
      // (decenas de chunks) es más simple y seguro que hacer un diff.
      await connection.execute(`DELETE FROM knowledge_vectors`);

      for (const chunk of chunks) {
        await connection.execute(
          `INSERT INTO knowledge_vectors (file_name, chunk_index, chunk_text, embedding)
           VALUES (:fileName, :chunkIndex, :chunkText, :embedding)`,
          {
            fileName: chunk.fileName,
            chunkIndex: chunk.chunkIndex,
            chunkText: chunk.text,
            embedding: new Float32Array(chunk.embedding),
          },
        );
      }

      await connection.commit();
      this.logger.log(
        `Índice vectorial reconstruido en Oracle con ${chunks.length} chunk(s).`,
      );
    } finally {
      await this.closeConnection(connection);
    }
  }

  async isIndexed(): Promise<boolean> {
    const connection = await this.oracleConnection.getConnection();
    try {
      const result = (await connection.execute(
        `SELECT COUNT(*) AS "COUNT" FROM knowledge_vectors`,
      )) as { rows?: Array<{ COUNT?: number }> };
      const rows = Array.isArray(result.rows) ? result.rows : [];
      return (rows[0]?.COUNT ?? 0) > 0;
    } finally {
      await this.closeConnection(connection);
    }
  }

  async search(
    queryEmbedding: number[],
    topK: number,
  ): Promise<EmbeddedChunk[]> {
    const connection = await this.oracleConnection.getConnection();
    try {
      const result = (await connection.execute(
        `SELECT file_name AS "FILE_NAME", chunk_index AS "CHUNK_INDEX", chunk_text AS "CHUNK_TEXT"
         FROM knowledge_vectors
         ORDER BY VECTOR_DISTANCE(embedding, :queryVec, COSINE) ASC
         FETCH FIRST :topK ROWS ONLY`,
        {
          queryVec: new Float32Array(queryEmbedding),
          topK,
        },
      )) as {
        rows?: Array<{
          FILE_NAME?: string;
          CHUNK_INDEX?: number;
          CHUNK_TEXT?: string;
        }>;
      };

      const rows = Array.isArray(result.rows) ? result.rows : [];

      return rows.map((row) => ({
        fileName: row.FILE_NAME ?? '',
        chunkIndex: row.CHUNK_INDEX ?? 0,
        text: row.CHUNK_TEXT ?? '',
        embedding: [], // no hace falta devolverlo: ya se usó dentro del SQL para ordenar
      }));
    } finally {
      await this.closeConnection(connection);
    }
  }

  async count(): Promise<number> {
    const connection = await this.oracleConnection.getConnection();
    try {
      const result = (await connection.execute(
        `SELECT COUNT(*) AS "COUNT" FROM knowledge_vectors`,
      )) as { rows?: Array<{ COUNT?: number }> };
      const rows = Array.isArray(result.rows) ? result.rows : [];
      return rows[0]?.COUNT ?? 0;
    } finally {
      await this.closeConnection(connection);
    }
  }

  async getUniqueFileNames(): Promise<string[]> {
    const connection = await this.oracleConnection.getConnection();
    try {
      const result = (await connection.execute(
        `SELECT DISTINCT file_name AS "FILE_NAME" FROM knowledge_vectors`,
      )) as { rows?: Array<{ FILE_NAME?: string }> };
      const rows = Array.isArray(result.rows) ? result.rows : [];
      return rows
        .map((r) => r.FILE_NAME)
        .filter(
          (name): name is string => typeof name === 'string' && name.length > 0,
        );
    } finally {
      await this.closeConnection(connection);
    }
  }
}
