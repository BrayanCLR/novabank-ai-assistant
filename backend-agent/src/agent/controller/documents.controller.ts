import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { KnowledgeService } from '../infrastructure/knowledge/knowledge.service';
import { UniversalParser } from '../infrastructure/parsers/universal.parser';

const KB_PATH = path.resolve(process.cwd(), '../knowledge_base');
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FILE_NAME_REGEX = /^[a-zA-Z0-9._-]+$/;

@Controller('knowledge')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly parser: UniversalParser,
  ) {}

  /**
   * Valida el nombre del archivo y garantiza que la ruta permanezca
   * dentro del directorio de la base de conocimiento.
   */
  private resolveSafePath(fileName: string): {
    safeFileName: string;
    filePath: string;
  } {
    if (!FILE_NAME_REGEX.test(fileName)) {
      throw new BadRequestException('Nombre de archivo inválido.');
    }

    const safeFileName = path.basename(fileName);
    const filePath = path.resolve(KB_PATH, safeFileName);

    if (!filePath.startsWith(KB_PATH + path.sep)) {
      throw new BadRequestException('Ruta inválida.');
    }

    return {
      safeFileName,
      filePath,
    };
  }

  @Get('documents')
  async listDocuments() {
    const entries = await fs.promises.readdir(KB_PATH, {
      withFileTypes: true,
    });

    const documents = await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isFile() &&
            this.parser.supportedExtensions.includes(
              path.extname(entry.name).toLowerCase(),
            ),
        )
        .map(async (entry) => {
          const stats = await fs.promises.stat(path.join(KB_PATH, entry.name));

          return {
            fileName: entry.name,
            extension: path.extname(entry.name).toLowerCase(),
            sizeBytes: stats.size,
            uploadedAt: stats.mtime,
          };
        }),
    );

    documents.sort((a, b) => a.fileName.localeCompare(b.fileName));

    return {
      documents,
      total: documents.length,
    };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: KB_PATH,
        filename: (_req, file, callback) => {
          const ext = path.extname(file.originalname).toLowerCase();

          const baseName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_');

          const timestamp = new Date()
            .toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '');

          callback(null, `${baseName}_${timestamp}${ext}`);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }

    const extension = path.extname(file.filename).toLowerCase();

    if (!this.parser.supportedExtensions.includes(extension)) {
      await fs.promises
        .unlink(path.join(KB_PATH, file.filename))
        .catch(() => undefined);

      throw new BadRequestException(
        `Formato no soportado: ${extension}. Permitidos: ${this.parser.supportedExtensions.join(', ')}`,
      );
    }

    this.logger.log(`Documento recibido: ${file.filename}. Reindexando...`);

    await this.knowledgeService.reindex();

    return {
      message: 'Documento cargado e indexado correctamente.',
      fileName: file.filename,
      sizeBytes: file.size,
    };
  }

  @Get('download/:fileName')
  async downloadDocument(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const { safeFileName, filePath } = this.resolveSafePath(fileName);

    let stats: fs.Stats;

    try {
      stats = await fs.promises.stat(filePath);
    } catch {
      throw new NotFoundException('El documento no existe o fue eliminado.');
    }

    if (!stats.isFile()) {
      throw new BadRequestException('El recurso solicitado no es un archivo.');
    }

    res.download(filePath, safeFileName, (err) => {
      if (err) {
        this.logger.error(
          `Error descargando ${safeFileName}`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    });
  }

  @Delete(':fileName')
  async deleteDocument(@Param('fileName') fileName: string) {
    const { safeFileName, filePath } = this.resolveSafePath(fileName);

    let stats: fs.Stats;

    try {
      stats = await fs.promises.stat(filePath);
    } catch {
      throw new NotFoundException('El documento no existe o ya fue eliminado.');
    }

    if (!stats.isFile()) {
      throw new BadRequestException('El recurso solicitado no es un archivo.');
    }

    await fs.promises.unlink(filePath);

    this.logger.log(`Documento eliminado: ${safeFileName}. Reindexando...`);

    try {
      await this.knowledgeService.reindex();
    } catch (error) {
      this.logger.error(
        'Error reindexando la base de conocimiento.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'El archivo fue eliminado, pero ocurrió un error al reindexar la base de conocimiento.',
      );
    }

    return {
      message: 'Documento eliminado correctamente.',
      fileName: safeFileName,
    };
  }
}
