import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import oracledb from 'oracledb';

type OraclePoolLike = {
  close: (timeout?: number) => Promise<unknown>;
  getConnection: () => Promise<unknown>;
};

type OracleConnectionLike = {
  execute: (...args: unknown[]) => Promise<unknown>;
  commit: () => Promise<unknown>;
  close: () => Promise<unknown>;
};

type OraclePoolOptions = {
  user: string;
  password: string;
  connectString: string;
  poolMin: number;
  poolMax: number;
  poolIncrement: number;
  configDir?: string;
  walletLocation?: string;
  walletPassword?: string;
};

type OracleModuleLike = {
  createPool: (options: OraclePoolOptions) => Promise<OraclePoolLike>;
};

/**
 * Administra el pool de conexiones a Oracle Database 23ai.
 * "Thin mode" (por defecto en el driver): JavaScript puro, sin
 * necesidad de instalar Oracle Instant Client en el sistema.
 */
@Injectable()
export class OracleConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OracleConnectionService.name);
  private pool: OraclePoolLike | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const user = this.configService.get<string>('ORACLE_USER', 'novabank');
    const password = this.configService.get<string>('ORACLE_PASSWORD');
    const connectString = this.configService.get<string>(
      'ORACLE_CONNECT_STRING',
      'localhost:1521/FREEPDB1',
    );

    // Nuevas: solo existen en producción (Autonomous Database).
    // En local, estas quedan undefined y el wallet simplemente no se usa.
    const walletLocation = this.configService.get<string>(
      'ORACLE_WALLET_LOCATION',
    );
    const walletPassword = this.configService.get<string>(
      'ORACLE_WALLET_PASSWORD',
    );

    if (!password) {
      throw new Error(
        'CRÍTICO: ORACLE_PASSWORD no está configurada en el .env',
      );
    }

    // Sin esto, cada fila vuelve como array posicional
    // (['NovaBank.txt', 0, 'texto']) en vez de objeto con nombres de
    // columna ({FILE_NAME: 'NovaBank.txt', CHUNK_INDEX: 0, ...}).
    // Es la causa exacta del bug: row.FILE_NAME en un array no existe.
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.fetchAsString = [oracledb.CLOB];

    const createPool = (oracledb as unknown as OracleModuleLike).createPool;
    this.pool = await createPool({
      user,
      password,
      connectString,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
      ...(walletLocation && {
        configDir: walletLocation,
        walletLocation,
        walletPassword,
      }),
    });

    this.logger.log(`Pool de conexiones Oracle creado (${connectString})`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close(10);
        this.logger.log('Pool de conexiones Oracle cerrado.');
      } catch (error) {
        this.logger.warn(
          `No se pudo cerrar el pool de Oracle de forma limpia: ${String(error)}`,
        );
      }
    }
  }

  async getConnection(): Promise<OracleConnectionLike> {
    if (!this.pool) {
      throw new Error('El pool de conexiones Oracle no está inicializado.');
    }

    return (await this.pool.getConnection()) as OracleConnectionLike;
  }
}
