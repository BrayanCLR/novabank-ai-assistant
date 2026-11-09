CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE
  IF NOT EXISTS knowledge_vectors (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(500) NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding VECTOR (768) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW ()
  );

CREATE TABLE
  IF NOT EXISTS chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'agent')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW ()
  );

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_sessions (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_kv_file ON knowledge_vectors (file_name);

CREATE INDEX IF NOT EXISTS idx_kv_embedding ON knowledge_vectors USING hnsw (embedding vector_cosine_ops);

COMMIT;