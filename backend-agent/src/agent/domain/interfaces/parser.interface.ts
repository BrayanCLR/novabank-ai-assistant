/**
 * Resultado estructurado de un archivo parseado.
 * Diseñado para pipelines de IA, RAG y agentes.
 */
export interface ParsedFileResult {
  /**
   * Texto plano extraído del archivo
   */
  text: string;

  /**
   * Metadatos opcionales del archivo procesado
   */
  metadata?: {
    fileName?: string;
    extension?: string;
    sizeBytes?: number;

    /**
     * Número de páginas (si aplica: PDF, DOCX, PPTX)
     */
    pages?: number;

    /**
     * Parser que procesó el archivo (debug / observabilidad)
     */
    parser?: string;

    /**
     * Idioma detectado (si lo agregas después)
     */
    language?: string;

    /**
     * Tokens estimados (útil para LLMs como Gemini/OpenAI)
     */
    estimatedTokens?: number;
  };
}

/**
 * Contrato que debe cumplir cualquier parser del sistema.
 * Permite intercambiar implementaciones sin romper el AgentService.
 */
export interface IFileParser {
  /**
   * Extensiones soportadas por este parser
   */
  supportedExtensions: string[];

  /**
   * Extrae texto estructurado desde un archivo
   */
  parse(filePath: string): Promise<ParsedFileResult>;
}
