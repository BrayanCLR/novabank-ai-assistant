import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { AgentService } from '../application/agent.service';
import { AskQuestionDto } from '../application/dto/ask-question.dto';

/**
 * RF-07: API del agente conversacional
 * Requiere ValidationPipe global
 */

interface AskAgentResponse {
  respuesta: string;
}

/**
 * Tipado explícito del estado del agente
 * (evita uso de unknown innecesario)
 */
interface AgentStatusResponse {
  status: string;
  documentsIndexed: number;
  chunksIndexed: number;
  lastIndexedAt: string | null;
  embeddingModel: string;
  generationModel: string;
}

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * Endpoint principal del agente (RAG / LLM / lógica interna)
   */
  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async askAgent(@Body() dto: AskQuestionDto): Promise<AskAgentResponse> {
    const respuesta = await this.agentService.processQuery(
      dto.mensaje,
      dto.sessionId,
    );

    return { respuesta };
  }

  /**
   * Estado del sistema/agente
   *
   * Se añade `await` para asegurar que la promesa sea correctamente esperada.
   */
  @Get('status')
  async getStatus(): Promise<AgentStatusResponse> {
    const {
      status,
      documentsIndexed,
      chunksIndexed,
      lastIndexedAt,
      embeddingModel,
      generationModel,
    } = await this.agentService.getStatus();

    return {
      status,
      documentsIndexed,
      chunksIndexed,
      lastIndexedAt: lastIndexedAt?.toISOString() ?? null,
      embeddingModel,
      generationModel,
    };
  }
}
