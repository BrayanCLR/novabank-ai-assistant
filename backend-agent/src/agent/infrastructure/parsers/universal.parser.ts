import { Injectable, Logger } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import {
  IFileParser,
  ParsedFileResult,
} from '../../domain/interfaces/parser.interface';
import { OfficeParser, OfficeParserConfig } from 'officeparser';

@Injectable()
export class UniversalParser implements IFileParser {
  private readonly logger = new Logger(UniversalParser.name);

  supportedExtensions = [
    '.pdf',
    '.docx',
    '.xlsx',
    '.pptx',
    '.csv',
    '.json',
    '.txt',
    '.html',
    '.md',
  ];

  private readonly officeParserConfig: OfficeParserConfig = {
    newlineDelimiter: '\n',
    ignoreComments: true,
    ignoreHeadersAndFooters: true,
    preserveXmlWhitespace: false,
  };

  async parse(filePath: string): Promise<ParsedFileResult> {
    try {
      const extension = path.extname(filePath).toLowerCase();
      this.logger.debug(`Procesando archivo ${filePath} (ext: ${extension})`);

      let text: string;

      if (this.isPlainTextFile(extension)) {
        this.logger.debug(`Leyendo archivo de texto plano: ${filePath}`);
        text = await fsPromises.readFile(filePath, 'utf8');
      } else {
        const ast = await OfficeParser.parseOffice(
          filePath,
          this.officeParserConfig,
        );

        const result = await ast.to('text');
        text = result.value;
      }
      this.logger.debug(
        `${path.basename(filePath)} -> ${text.length} caracteres`,
      );
      return {
        text: text.trim(),
        metadata: {
          fileName: path.basename(filePath),
          extension,
          parser: 'officeparser',
        },
      };
    } catch (error) {
      this.logger.error(`Error crítico procesando ${filePath}`, error as Error);

      return {
        text: `[Error extrayendo contenido de ${filePath}]`,
        metadata: {
          fileName: path.basename(filePath),
          extension: path.extname(filePath).toLowerCase(),
          parser: 'officeparser',
        },
      };
    }
  }

  private isPlainTextFile(extension: string): boolean {
    return extension === '.txt' || extension === '.json';
  }
}
