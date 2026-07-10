import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import * as path from 'path';

import { KnowledgeService } from '../infrastructure/knowledge/knowledge.service';
import { UniversalParser } from '../infrastructure/parsers/universal.parser';
import { ObjectStorageService } from '../infrastructure/storage/object-storage.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FILE_NAME_REGEX = /^[a-zA-Z0-9._-]+$/;

@Controller('knowledge')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly parser: UniversalParser,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

  /**
   * Ya no resolvemos una ruta local (no hay disco que atravesar en
   * Object Storage), pero seguimos validando el formato del nombre
   * para no aceptar nombres de objeto con caracteres inesperados.
   */
  private validateFileName(fileName: string): string {
    const safeFileName = path.basename(fileName);
    if (!FILE_NAME_REGEX.test(safeFileName)) {
      throw new BadRequestException('Nombre de archivo inválido.');
    }
    return safeFileName;
  }

  @Get('documents')
  async listDocuments() {
    const objects = await this.objectStorageService.list();

    const documents = objects
      .filter((obj) =>
        this.parser.supportedExtensions.includes(
          path.extname(obj.name).toLowerCase(),
        ),
      )
      .map((obj) => ({
        fileName: obj.name,
        extension: path.extname(obj.name).toLowerCase(),
        sizeBytes: obj.sizeBytes,
        uploadedAt: obj.timeModified,
      }))
      .sort((a, b) => a.fileName.localeCompare(b.fileName));

    return {
      documents,
      total: documents.length,
    };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }

    const ext = path.extname(file.originalname).toLowerCase();

    if (!this.parser.supportedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Formato no soportado: ${ext}. Permitidos: ${this.parser.supportedExtensions.join(', ')}`,
      );
    }

    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');

    const objectName = `${baseName}_${timestamp}${ext}`;

    await this.objectStorageService.upload(
      objectName,
      file.buffer,
      file.mimetype,
    );

    this.logger.log(
      `Documento subido a Object Storage: ${objectName}. Reindexando...`,
    );

    await this.knowledgeService.reindex();

    return {
      message: 'Documento cargado e indexado correctamente.',
      fileName: objectName,
      sizeBytes: file.size,
    };
  }

  @Get('download/:fileName')
  async downloadDocument(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const safeFileName = this.validateFileName(fileName);
    const buffer = await this.objectStorageService.download(safeFileName);

    res.set({
      'Content-Disposition': `attachment; filename="${safeFileName}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Delete(':fileName')
  async deleteDocument(@Param('fileName') fileName: string) {
    const safeFileName = this.validateFileName(fileName);

    await this.objectStorageService.delete(safeFileName);

    this.logger.log(
      `Documento eliminado de Object Storage: ${safeFileName}. Reindexando...`,
    );

    await this.knowledgeService.reindex();

    return {
      message: 'Documento eliminado correctamente.',
      fileName: safeFileName,
    };
  }
}
