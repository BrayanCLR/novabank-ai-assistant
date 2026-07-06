import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Content } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client?: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ??
      process.env.GOOGLE_API_KEY;

    this.modelName = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-2.5-flash',
    );

    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY no encontrada; GeminiService deshabilitado (modo seguro).',
      );
      this.client = undefined;
      return;
    }

    this.client = new GoogleGenAI({ apiKey });

    this.logger.log('GeminiService inicializado (Google GenAI SDK)');
  }

  getModelName(): string {
    return this.modelName;
  }

  /**
   * 🔹 MODO SIMPLE (compatibilidad con tu agent actual)
   */
  async ask(prompt: string): Promise<string> {
    try {
      if (!this.client) {
        throw new ServiceUnavailableException('Modelo de IA no disponible.');
      }

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      return response.text ?? '';
    } catch (error) {
      this.logger.error(
        'Error en ask() Gemini',
        (error as Error).stack ?? String(error),
      );

      if (error instanceof ServiceUnavailableException) throw error;

      throw new InternalServerErrorException(
        'No fue posible comunicarse con el modelo de IA.',
      );
    }
  }

  /**
   * 🔹 MODO CHAT (RAG + memoria)
   */
  async generateConversationalResponse(
    systemInstruction: string,
    history: { role: string; content: string }[],
    currentMessage: string,
  ): Promise<string> {
    try {
      if (!this.client) {
        throw new ServiceUnavailableException('Modelo de IA no disponible.');
      }

      const formattedHistory: Content[] = history.map((msg) => ({
        role: msg.role === 'agent' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = this.client.chats.create({
        model: this.modelName,
        config: {
          systemInstruction,
        },
        history: formattedHistory,
      });

      const response = await chat.sendMessage({
        message: currentMessage,
      });

      return response.text ?? '';
    } catch (error) {
      this.logger.error(
        'Error en chat Gemini',
        (error as Error).stack ?? String(error),
      );

      if (error instanceof ServiceUnavailableException) throw error;

      throw new InternalServerErrorException(
        'No fue posible comunicarse con el modelo de IA.',
      );
    }
  }
}
