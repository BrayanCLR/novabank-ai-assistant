import { Injectable, Logger } from '@nestjs/common';
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
    this.logger.log('1. Recuperando contexto corporativo de NovaBank...');

    const context = await this.knowledgeService.getContext();

    if (!context?.trim()) {
      this.logger.error(
        'La base de conocimiento está vacía o no pudo cargarse.',
      );

      throw new Error(
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

      throw new Error(
        'No fue posible procesar la consulta corporativa en este momento.',
      );
    }
  }
}
