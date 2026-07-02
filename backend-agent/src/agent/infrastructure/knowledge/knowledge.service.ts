import { Injectable, Logger } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { UniversalParser } from '../parsers/universal.parser';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private cachedContext: string | null = null;

  constructor(private readonly parser: UniversalParser) {}

  async getContext(): Promise<string> {
    if (this.cachedContext) {
      return this.cachedContext;
    }

    this.logger.log(
      'Inicializando lectura de la Base de Conocimiento de NovaBank...',
    );

    try {
      const kbPath = path.resolve(process.cwd(), '../knowledge_base');

      const files = await fsPromises.readdir(kbPath, {
        withFileTypes: true,
      });

      const validFiles = files
        .filter(
          (file) =>
            file.isFile() &&
            this.parser.supportedExtensions.includes(
              path.extname(file.name).toLowerCase(),
            ),
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      const contents = await Promise.all(
        validFiles.map(async (file) => {
          const filePath = path.join(kbPath, file.name);

          try {
            const parsed = await this.parser.parse(filePath);

            if (!parsed.text?.trim()) {
              this.logger.warn(
                `El documento ${file.name} no contiene texto extraíble.`,
              );

              return '';
            }

            this.logger.debug(
              `${file.name} -> ${parsed.text.length} caracteres cargados`,
            );

            return `
====================================================
DOCUMENTO: ${file.name}
TIPO: ${parsed.metadata?.extension ?? 'unknown'}
====================================================

${parsed.text}

`;
          } catch (error) {
            this.logger.error(
              `Error procesando el documento ${file.name}`,
              error,
            );

            return '';
          }
        }),
      );

      this.cachedContext = contents
        .filter((content) => content.trim().length > 0)
        .join('\n');

      this.logger.log(
        `Base de conocimiento cargada con éxito: ${validFiles.length} documentos procesados.`,
      );

      this.logger.log(
        `Contexto corporativo generado: ${this.cachedContext.length} caracteres.`,
      );

      return this.cachedContext;
    } catch (error) {
      this.logger.error('Error montando la base de conocimiento', error);

      throw new Error('No se pudo cargar el contexto corporativo de NovaBank.');
    }
  }

  clearCache(): void {
    this.cachedContext = null;
    this.logger.log('Caché de la base de conocimiento invalidada.');
  }
}
