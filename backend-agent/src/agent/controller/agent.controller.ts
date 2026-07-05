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
  uptime?: number;
  version?: string;
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
    const respuesta = await this.agentService.processQuery(dto.mensaje);

    return { respuesta };
  }

  /**
   * Estado del sistema/agente
   *
   * Se elimina `await` para evitar:
   * "Unexpected await of a non-Promise value"
   */
  @Get('status')
  async getStatus(): Promise<AgentStatusResponse> {
    return this.agentService.getStatus();
  }
}
