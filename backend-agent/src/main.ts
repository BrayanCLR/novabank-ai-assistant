import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de pipes globales para validación y transformación de datos
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Habilitar CORS (Cross-Origin Resource Sharing) para permitir solicitudes desde diferentes dominios
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
