import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as common from 'oci-common';
import * as objectstorage from 'oci-objectstorage';

export interface StoredObject {
  name: string;
  sizeBytes: number;
  timeModified: Date;
}

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private client: objectstorage.ObjectStorageClient | null = null;
  private namespace: string | null = null;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'OCI_BUCKET_NAME',
      'novabank-documents',
    );
  }

  private async getClient(): Promise<objectstorage.ObjectStorageClient> {
    if (this.client) return this.client;

    const provider =
      await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();

    this.client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });

    return this.client;
  }

  private async getNamespace(): Promise<string> {
    if (this.namespace) return this.namespace;

    const client = await this.getClient();
    const response = await client.getNamespace({});
    this.namespace = response.value;
    return this.namespace;
  }

  async list(): Promise<StoredObject[]> {
    try {
      const client = await this.getClient();
      const namespaceName = await this.getNamespace();

      const response = await client.listObjects({
        namespaceName,
        bucketName: this.bucketName,
        fields: 'name,size,timeModified',
      });

      return (response.listObjects.objects ?? []).map((obj) => ({
        name: obj.name,
        sizeBytes: obj.size ?? 0,
        timeModified: obj.timeModified
          ? new Date(obj.timeModified)
          : new Date(),
      }));
    } catch (error) {
      this.logger.error(
        'Error listando objetos de Object Storage',
        error as Error,
      );
      throw new InternalServerErrorException(
        'No fue posible listar los documentos.',
      );
    }
  }

  async upload(
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    try {
      const client = await this.getClient();
      const namespaceName = await this.getNamespace();

      await client.putObject({
        namespaceName,
        bucketName: this.bucketName,
        objectName,
        putObjectBody: buffer,
        contentLength: buffer.length,
        contentType,
      });
    } catch (error) {
      this.logger.error(
        `Error subiendo ${objectName} a Object Storage`,
        error as Error,
      );
      throw new InternalServerErrorException(
        'No fue posible subir el documento a Object Storage.',
      );
    }
  }

  async download(objectName: string): Promise<Buffer> {
    try {
      const client = await this.getClient();
      const namespaceName = await this.getNamespace();

      const response = await client.getObject({
        namespaceName,
        bucketName: this.bucketName,
        objectName,
      });

      const chunks: Uint8Array[] = [];

      for await (const chunk of response.value) {
        chunks.push(Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(
        `Error descargando ${objectName} de Object Storage`,
        error as Error,
      );

      throw new InternalServerErrorException(
        'No fue posible descargar el documento.',
      );
    }
  }

  async delete(objectName: string): Promise<void> {
    try {
      const client = await this.getClient();
      const namespaceName = await this.getNamespace();

      await client.deleteObject({
        namespaceName,
        bucketName: this.bucketName,
        objectName,
      });
    } catch (error) {
      this.logger.error(
        `Error eliminando ${objectName} de Object Storage`,
        error as Error,
      );
      throw new InternalServerErrorException(
        'No fue posible eliminar el documento.',
      );
    }
  }
}
