import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module'; // 👈 1. Importamos el módulo

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AgentModule, // 👈 2. Lo conectamos al motor principal de la app
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
