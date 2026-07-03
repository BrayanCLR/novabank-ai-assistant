import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentController } from './controller/agent.controller';
import { AgentService } from './application/agent.service';
import { EmbeddingService } from './infrastructure/gemini/embedding.service';
import { GeminiService } from './infrastructure/gemini/gemini.service';
import { KnowledgeService } from './infrastructure/knowledge/knowledge.service';
import { VectorStoreService } from './infrastructure/knowledge/vector-store.service';
import { UniversalParser } from './infrastructure/parsers/universal.parser';

@Module({
  imports: [ConfigModule],
  controllers: [AgentController],
  providers: [
    AgentService,
    GeminiService,
    EmbeddingService,
    KnowledgeService,
    VectorStoreService,
    UniversalParser,
  ],
})
export class AgentModule {}
