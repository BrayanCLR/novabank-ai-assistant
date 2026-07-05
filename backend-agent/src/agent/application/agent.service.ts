import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GeminiService } from '../infrastructure/gemini/gemini.service';
import { KnowledgeService } from '../infrastructure/knowledge/knowledge.service';
import { buildNovaBankPrompt } from '../infrastructure/prompts/corporate.prompt';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  async processQuery(userMessage: string): Promise<string> {
    this.logger.log('1. Búsqueda semántica: recuperando chunks relevantes...');

    const context = await this.knowledgeService.getRelevantContext(userMessage);

    if (!context?.trim()) {
      this.logger.warn(
        'No se encontró contexto relevante en la base de conocimiento; se continúa con una respuesta de respaldo.',
      );
    }

    this.logger.log('2. Construyendo el prompt corporativo...');
    const prompt = buildNovaBankPrompt(context, userMessage);
    const fallbackPrompt = `
Si la información solicitada no aparece claramente en la documentación proporcionada, no respondas con un cierre automático tipo "no dispongo de información".
En su lugar, ofrece una respuesta breve, prudente y orientadora, indicando que la documentación actual no contiene una política específica y que la consulta debe validarse con el canal oficial o con un documento adicional para el RAG.

${prompt}
`;

    this.logger.log('3. Enviando consulta al modelo Gemini...');
    try {
      const response = await this.geminiService.ask(fallbackPrompt);
      this.logger.log('4. Respuesta generada correctamente.');
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
