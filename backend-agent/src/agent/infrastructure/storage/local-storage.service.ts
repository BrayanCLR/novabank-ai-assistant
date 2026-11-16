import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import path from 'node:path';
import fs from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';

export interface StoredObject {
  name: string;
  sizeBytes: number;
  timeModified: Date;
}

@Injectable()
export class LocalStorageService implements OnModuleInit {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly envPath: string;
  private readonly storagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.logger.log('Servicio de almacenamiento local inicializado');

    this.envPath = this.configService.get<string>('LOCAL_STORAGE_PATH', '');

    this.storagePath =
      this.envPath || path.resolve(process.cwd(), '../knowledge_base');
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`Ruta de almacenamiento: ${this.storagePath}`);

    try {
      const createdPath = await fs.mkdir(this.storagePath, {
        recursive: true,
      });

      this.logger.log(
        createdPath
          ? 'Directorio de almacenamiento creado'
          : 'El directorio ya existe',
      );
    } catch (error) {
      const message = 'Error al crear el directorio de almacenamiento';

      this.logger.error(
        message,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(message, { cause: error });
    }
  }

  async list(): Promise<StoredObject[]> {
    try {
      const files = await fs.readdir(this.storagePath);
      this.logger.log(
        `Archivos en el directorio de almacenamiento: ${files.length}`,
      );

      return Promise.all(
        files.map(async (file) => {
          const stats = await fs.stat(path.join(this.storagePath, file));

          return {
            name: file,
            sizeBytes: stats.size,
            timeModified: stats.mtime,
          };
        }),
      );
    } catch (error) {
      const message = `Error al listar archivos en el directorio de almacenamiento`;

      this.logger.error(
        message,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(message, { cause: error });
    }
  }

  async upload(objectName: string, buffer: Buffer): Promise<void> {
    try {
      await fs.writeFile(path.join(this.storagePath, objectName), buffer);
      this.logger.log(`Archivo ${objectName} subido exitosamente`);
    } catch (error) {
      const message = `Error al subir archivo ${objectName} al directorio de almacenamiento`;

      this.logger.error(
        message,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(message, { cause: error });
    }
  }

  async download(objectName: string): Promise<Buffer> {
    try {
      const buffer = await fs.readFile(path.join(this.storagePath, objectName));

      this.logger.log(`Archivo ${objectName} descarg argado exitosamente`);

      return buffer;
    } catch (error) {
      const message = `Error al descargar archivo ${objectName} del directorio de almacenamiento`;

      this.logger.error(
        message,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(message, { cause: error });
    }
  }

  async delete(objectName: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.storagePath, objectName));

      this.logger.log(`Archivo ${objectName} eliminado exitosamente`);
    } catch (error) {
      const message = `Error al eliminar archivo ${objectName} del directorio de almacenamiento`;

      this.logger.error(
        message,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(message, { cause: error });
    }
  }
}
