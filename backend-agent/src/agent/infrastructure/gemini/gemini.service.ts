import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

/**
 * RF-05: genera respuestas usando Google Gemini.
 * Migrado de @google/generative-ai (muerto desde nov-2025) a @google/genai,
 * el SDK unificado y soportado actualmente. Mismo método público ask(prompt)
 * que ya tenías, así que agent.service.ts no necesita ningún cambio.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client?: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    // Prefer explicit GEMINI_API_KEY but allow GOOGLE_API_KEY as a fallback
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ??
      process.env.GOOGLE_API_KEY ??
      undefined;

    this.modelName = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-2.5-flash',
    );

    if (!apiKey) {
      // Do not throw in constructor to avoid crashing the whole app at startup.
      // Service will report unavailable when called.
      this.client = undefined;
      this.logger.warn(
        'GEMINI_API_KEY no encontrada; GeminiService deshabilitado (modo seguro).',
      );
      return;
    }

    this.client = new GoogleGenAI({ apiKey });
    this.logger.log(
      'GeminiService inicializado y conectado a la API de Google',
    );
  }

  async ask(prompt: string): Promise<string> {
    try {
      this.logger.log('Enviando consulta al LLM...');
      if (!this.client) {
        throw new ServiceUnavailableException(
          'Modelo de IA no disponible. Revisa la configuración de GEMINI_API_KEY.',
        );
      }

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      return response.text ?? '';
    } catch (error) {
      // Log stack if available for easier debugging in prod
      this.logger.error(
        'Error de comunicación con Gemini',
        (error as Error).stack ?? String(error),
      );
      if (error instanceof ServiceUnavailableException) throw error;
      throw new InternalServerErrorException(
        'No fue posible comunicarse con el modelo de IA en este momento.',
      );
    }
  }
}
