import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

/**
 * UniversalParser espera una ruta de archivo en disco, pero Object
 * Storage nos da buffers en memoria. En vez de reescribir el parser
 * para aceptar buffers (arriesgando romper su lógica ya probada con
 * los 9 formatos), escribimos el buffer a un archivo temporal, lo
 * parseamos con la lógica existente sin cambios, y lo borramos al
 * terminar (incluso si algo falla, gracias al finally).
 */
export async function withTempFile<T>(
  buffer: Buffer,
  extension: string,
  callback: (filePath: string) => Promise<T>,
): Promise<T> {
  const tempPath = path.join(os.tmpdir(), `${randomUUID()}${extension}`);
  await fs.writeFile(tempPath, buffer);
  try {
    return await callback(tempPath);
  } finally {
    await fs.unlink(tempPath).catch(() => undefined);
  }
}
