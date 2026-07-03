/**
 * Divide un texto largo en fragmentos ("chunks") aptos para embeber.
 * Estrategia: agrupa párrafos hasta un tamaño máximo; si un párrafo
 * individual supera el máximo, lo corta por tamaño fijo.
 */
export function chunkText(text: string, maxChars = 800): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      for (let i = 0; i < paragraph.length; i += maxChars) {
        chunks.push(paragraph.slice(i, i + maxChars));
      }
      continue;
    }

    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxChars) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);

  return chunks.length > 0 ? chunks : [text];
}
