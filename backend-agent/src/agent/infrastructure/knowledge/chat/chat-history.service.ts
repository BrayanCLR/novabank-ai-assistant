import { Injectable, Logger } from '@nestjs/common';
import { OracleConnectionService } from '../../database/oracle-connection.service';

interface HistoryRowLike {
  role?: string;
  content?: string;
  ROLE?: string;
  CONTENT?: string;
  [key: string]: unknown;
}

@Injectable()
export class ChatHistoryService {
  private readonly logger = new Logger(ChatHistoryService.name);

  constructor(private readonly oracleConnection: OracleConnectionService) {}

  async saveMessage(
    sessionId: string,
    role: 'user' | 'agent',
    content: string,
  ): Promise<void> {
    const normalizedSessionId = sessionId?.trim() || 'default';
    const normalizedRole = role === 'agent' ? 'agent' : 'user';
    const normalizedContent = content?.trim() || '';

    if (!normalizedContent) {
      return;
    }

    const connection = await this.oracleConnection.getConnection();
    try {
      await connection.execute(
        `INSERT INTO chat_sessions (session_id, role, content)
         VALUES (:sessionId, :role, :content)`,
        {
          sessionId: normalizedSessionId,
          role: normalizedRole,
          content: normalizedContent,
        },
      );
      await connection.commit();
    } catch (error) {
      this.logger.warn(
        `No se pudo guardar el historial para la sesión ${normalizedSessionId}: ${String(error)}`,
      );
    } finally {
      await this.closeConnection(connection);
    }
  }

  async getHistory(
    sessionId: string,
    limit: number = 6,
  ): Promise<{ role: string; content: string }[]> {
    const normalizedSessionId = sessionId?.trim() || 'default';
    const safeLimit = Math.max(1, Math.min(Math.floor(limit || 6), 50));
    const connection = await this.oracleConnection.getConnection();

    try {
      const result = (await connection.execute(
        `SELECT role, content
         FROM (
           SELECT role, content, created_at
           FROM chat_sessions
           WHERE session_id = :sessionId
           ORDER BY created_at DESC
           FETCH FIRST ${safeLimit} ROWS ONLY
         )
         ORDER BY created_at ASC`,
        { sessionId: normalizedSessionId },
      )) as { rows?: unknown[] };

      const rows = Array.isArray(result?.rows) ? result.rows : [];
      return rows
        .map((row) => this.normalizeRow(row))
        .filter((row) => row.content.length > 0);
    } catch (error) {
      this.logger.warn(
        `No se pudo leer el historial para la sesión ${normalizedSessionId}: ${String(error)}`,
      );
      return [];
    } finally {
      await this.closeConnection(connection);
    }
  }

  private normalizeRow(row: unknown): { role: string; content: string } {
    if (Array.isArray(row)) {
      return {
        role: this.getStringValue(row[0], 'user'),
        content: this.getStringValue(row[1], ''),
      };
    }

    if (row && typeof row === 'object') {
      const record = row as HistoryRowLike;
      const roleValue = this.getStringValue(record.ROLE ?? record.role, 'user');
      const contentValue = this.getStringValue(
        record.CONTENT ?? record.content,
        '',
      );
      return {
        role: roleValue,
        content: contentValue,
      };
    }

    return { role: 'user', content: '' };
  }

  private getStringValue(value: unknown, fallback: string): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return fallback;
  }

  private async closeConnection(connection: {
    close: () => Promise<unknown>;
  }): Promise<void> {
    try {
      await connection.close();
    } catch (error) {
      this.logger.warn(
        `No se pudo cerrar la conexión de Oracle: ${String(error)}`,
      );
    }
  }
}
