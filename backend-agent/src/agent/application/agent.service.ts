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
      this.logger.error(
        'No se encontró contexto relevante en la base de conocimiento.',
      );
      throw new InternalServerErrorException(
        'No se pudo acceder a la base de conocimiento corporativa.',
      );
    }

    this.logger.log('2. Construyendo el prompt corporativo...');
    const prompt = buildNovaBankPrompt(context, userMessage);

    this.logger.log('3. Enviando consulta al modelo Gemini...');
    try {
      const response = await this.geminiService.ask(prompt);
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

  getStatus() {
    const knowledge = this.knowledgeService.getStatus();
    return {
      status: 'ok' as const,
      ...knowledge,
      generationModel: this.geminiService.getModelName(),
    };
  }
}
