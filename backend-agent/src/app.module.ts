import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentModule } from './agent/agent.module'; // 👈 1. Importamos el módulo

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AgentModule],
})
export class AppModule {}
