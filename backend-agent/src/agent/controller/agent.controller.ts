import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AgentService } from '../application/agent.service';
import { AskQuestionDto } from '../application/dto/ask-question.dto';

/**
 * RF-07: expone la API del agente.
 * Ahora valida con AskQuestionDto (requiere ValidationPipe global en main.ts).
 */
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async askAgent(@Body() dto: AskQuestionDto): Promise<{ respuesta: string }> {
    const respuesta = await this.agentService.processQuery(dto.mensaje);
    return { respuesta };
  }
}
