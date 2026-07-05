-- Se ejecuta automáticamente la PRIMERA vez que se crea el contenedor
ALTER SESSION SET CONTAINER = FREEPDB1;

CREATE USER novabank IDENTIFIED BY "NovaBank_2026_Segura!";
GRANT DB_DEVELOPER_ROLE TO novabank;
GRANT UNLIMITED TABLESPACE TO novabank;

ALTER SESSION SET CURRENT_SCHEMA = novabank;

CREATE TABLE knowledge_vectors (
  id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file_name    VARCHAR2(500) NOT NULL,
  chunk_index  NUMBER NOT NULL,
  chunk_text   CLOB NOT NULL,
  embedding    VECTOR(768, FLOAT32) NOT NULL,
  created_at   TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE TABLE chat_sessions (
  id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id  VARCHAR2(100) NOT NULL,
  role        VARCHAR2(10) NOT NULL CHECK (role IN ('user','agent')),
  content     CLOB NOT NULL,
  created_at  TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE INDEX idx_chat_session ON chat_sessions(session_id, created_at);

COMMIT;