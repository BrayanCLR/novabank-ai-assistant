import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GeminiService } from '../infrastructure/gemini/gemini.service';
import { KnowledgeService } from '../infrastructure/knowledge/knowledge.service';
import { ChatHistoryService } from '../infrastructure/knowledge/chat/chat-history.service';
import {
  NOVA_BANK_SYSTEM_INSTRUCTION,
  buildRagMessage,
} from '../infrastructure/prompts/corporate.prompt';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly knowledgeService: KnowledgeService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  async processQuery(userMessage: string, sessionId?: string): Promise<string> {
    const normalizedSessionId = sessionId?.trim() || 'default';
    this.logger.log(
      `1. Iniciando procesamiento para la sesión: ${normalizedSessionId}`,
    );

    // A. Guardamos la nueva pregunta del usuario en Oracle antes de procesar
    await this.chatHistoryService.saveMessage(
      normalizedSessionId,
      'user',
      userMessage,
    );

    // B. Recuperamos la memoria a corto plazo de Oracle (ej. los últimos 7 mensajes)
    const rawHistory = await this.chatHistoryService.getHistory(
      normalizedSessionId,
      7,
    );
    const priorHistory = rawHistory.slice(0, -1);
    this.logger.log(
      `2. Memoria recuperada: ${priorHistory.length} turnos previos extraídos de la base de datos.`,
    );

    // C. Búsqueda semántica (RAG): se enriquece con el último intercambio
    // para que preguntas cortas o de seguimiento ("seguro?", "¿y en pesos?")
    // hereden el tema de la conversación en vez de buscarse solas y a ciegas.
    const lastExchange = priorHistory
      .slice(-2)
      .map((h) => h.content)
      .join(' ');
    const retrievalQuery = lastExchange
      ? `${lastExchange} ${userMessage}`
      : userMessage;

    const context =
      await this.knowledgeService.getRelevantContext(retrievalQuery);
    if (!context?.trim()) {
      this.logger.warn(
        'No se encontró contexto relevante en la base de conocimiento; se continúa con parámetros estándar.',
      );
    }

    // D. Construimos el mensaje actual combinando los documentos recuperados
    // y la pregunta ORIGINAL (no la enriquecida — Gemini debe ver tu
    // pregunta tal cual la escribiste, solo la búsqueda usa la versión ampliada)
    const currentMessageWithRag = buildRagMessage(context, userMessage);

    this.logger.log(
      '3. Enviando consulta al modelo GenAI con memoria y contexto RAG...',
    );
    try {
      const response = await this.geminiService.generateConversationalResponse(
        NOVA_BANK_SYSTEM_INSTRUCTION,
        priorHistory,
        currentMessageWithRag,
      );

      await this.chatHistoryService.saveMessage(
        normalizedSessionId,
        'agent',
        response,
      );

      this.logger.log('4. Respuesta generada y guardada correctamente.');
      return response;
    } catch (error) {
      this.logger.error('Error obteniendo respuesta del modelo Gemini.', error);

      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'No fue posible procesar la consulta corporativa en este momento.',
      );
    }
  }

  async getStatus() {
    const knowledge = await this.knowledgeService.getStatus();
    return {
      status: 'ok' as const,
      ...knowledge,
      generationModel: this.geminiService.getModelName(),
    };
  }
}
