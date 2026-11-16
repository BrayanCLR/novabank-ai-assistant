import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentController } from './controller/agent.controller';
import { AgentService } from './application/agent.service';
import { EmbeddingService } from './infrastructure/ollama/embedding.service';
import { GeminiService } from './infrastructure/gemini/gemini.service';
import { KnowledgeService } from './infrastructure/knowledge/knowledge.service';
import { VectorStoreService } from './infrastructure/knowledge/vector-store.service';
import { UniversalParser } from './infrastructure/parsers/universal.parser';
import { DocumentsController } from './controller/documents.controller';
import { PostgresConnectionService } from './infrastructure/database/postgres-connection.service';
import { ChatHistoryService } from './infrastructure/knowledge/chat/chat-history.service';
import { LocalStorageService } from './infrastructure/storage/local-storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [AgentController, DocumentsController],
  providers: [
    AgentService,
    GeminiService,
    EmbeddingService,
    KnowledgeService,
    VectorStoreService,
    UniversalParser,
    PostgresConnectionService,
    ChatHistoryService,
    LocalStorageService,
  ],
})
export class AgentModule {}
