import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class PostgresConnectionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PostgresConnectionService.name);
  private pool: Pool | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const user = this.configService.get<string>('POSTGRES_USER', 'dev_admin');
    const password = this.configService.get<string>('POSTGRES_PASSWORD');
    const host = this.configService.get<string>('POSTGRES_HOST', 'postgres');
    const port = this.configService.get<number>('POSTGRES_PORT', 5432);
    const database = this.configService.get<string>('POSTGRES_DB', 'novabank');

    if (!user || !password || !host || !port || !database) {
      throw new Error(' Faltan Configuraciones de Base de Datos');
    }

    this.pool = new Pool({
      host,
      port: Number(port),
      database,
      user,
      password,
      max: 10, // Número máximo de conexiones en el pool
    });
    try {
      await this.pool.query('SELECT 1'); // Prueba
      this.logger.log(
        `Conexión exitosa a la base de datos (${host}:${port}/${database})`,
      );
    } catch (error) {
      this.logger.error(
        `Error al conectar a la base de datos: ${String(error)}`,
      );
      throw error; // Lanza el error si no se puede conectar
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Conexión a la base de datos cerrada');
    }
  }

  getPool(): Pool {
    if (this.pool) return this.pool;
    throw new Error('No se ha inicializado el pool de conexiones');
  }

  async query(text: string, params?: unknown[]): Promise<QueryResult> {
    return await this.getPool().query(text, params);
  }
}
