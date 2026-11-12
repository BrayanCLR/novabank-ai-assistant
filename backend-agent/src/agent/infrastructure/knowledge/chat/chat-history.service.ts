import { Injectable, Logger } from '@nestjs/common';
import { PostgresConnectionService } from '../../database/postgres-connection.service';

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

  constructor(private readonly postgresConnection: PostgresConnectionService) {}

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

    try {
      await this.postgresConnection.query(
        `INSERT INTO chat_sessions (session_id, role, content)
         VALUES ($1, $2, $3)`,
        [normalizedSessionId, normalizedRole, normalizedContent],
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo guardar el historial para la sesión ${normalizedSessionId}: ${String(error)}`,
      );
    }
  }

  async getHistory(
    sessionId: string,
    limit: number = 6,
  ): Promise<{ role: string; content: string }[]> {
    const normalizedSessionId = sessionId?.trim() || 'default';
    const safeLimit = Math.max(1, Math.min(Math.floor(limit || 6), 50));

    try {
      const result = (await this.postgresConnection.query(
        `SELECT role, content
         FROM (
           SELECT role, content, created_at
           FROM chat_sessions
           WHERE session_id = $1
           ORDER BY created_at DESC
           LIMIT $2
         ) AS recent_messages
         ORDER BY created_at ASC`,
        [normalizedSessionId, safeLimit],
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
}
