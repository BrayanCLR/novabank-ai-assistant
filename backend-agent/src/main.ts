import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // RF-06: rechaza requests inválidos antes de que lleguen al controller
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Vas a necesitarlo en unos días cuando frontend-chat (Next.js, otro
  // puerto/origen) empiece a llamar a esta API desde el navegador.
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
