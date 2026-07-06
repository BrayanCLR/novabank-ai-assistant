'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Download, FileText, Trash2, UploadCloud } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

type KnowledgeDocument = { fileName: string; extension: string; sizeBytes: number; uploadedAt: string; };

export default function KnowledgeSection() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingList(true); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/documents`, { signal });
      if (!res.ok) throw new Error('No se pudo obtener la lista.');
      const data = await res.json();
      if (signal?.aborted) return;
      setDocuments(data.documents);
    } catch (err) {
      if ((err as Error & { name?: string }).name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setDocuments([]);
    } finally {
      if (!signal?.aborted) setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const loadDocuments = async () => {
      await fetchDocuments(abortController.signal);
    };

    void loadDocuments();

    return () => {
      abortController.abort();
    };
  }, [fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true); setError(null); setSuccessMessage(null);
    const formData = new FormData(); formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al subir.');
      setSuccessMessage(`"${data.fileName}" indexado correctamente.`);
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsUploading(false); e.target.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    setIsDeleting(true); setError(null); setSuccessMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/${encodeURIComponent(documentToDelete)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? 'Error al eliminar.');
      setSuccessMessage('Documento eliminado y base reindexada.');
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al eliminar');
    } finally {
      setIsDeleting(false); setDocumentToDelete(null);
    }
  };

  const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  const getExtensionColor = (extension: string) => {
    const ext = extension.replace('.', '').trim().toLowerCase();

    switch (ext) {
      case 'pdf':
        return 'bg-red-500/20 text-red-400 border-red-500/30';

      case 'doc':
      case 'docx':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';

      case 'xls':
      case 'xlsx':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

      case 'csv':
        return 'bg-lime-500/20 text-lime-400 border-lime-500/30';

      case 'json':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';

      case 'md':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';

      case 'html':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';

      default:
        return 'bg-zinc-700/20 text-zinc-300 border-zinc-600';
    }
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Base Vectorial</h2>
          <span className="bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.1)]">
            {documents.length} ARCHIVOS
          </span>
        </div>
        <p className="text-sm text-zinc-500 mb-8 font-medium">Archivos indexados en el motor semántico de NovaBank.</p>

        {/* Zona de Dropzone */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 bg-[#121215] rounded-2xl p-10 cursor-pointer hover:border-orange-500/50 hover:bg-[#18181b] transition-all duration-300 mb-8 group">
          {isUploading ? (
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
          ) : (
            <UploadCloud className="w-10 h-10 text-zinc-600 group-hover:text-orange-500 transition-colors mb-4" />
          )}
          <span className="text-base font-bold text-zinc-300 group-hover:text-white transition-colors">
            {isUploading ? 'INDEXANDO VECTOR...' : 'CARGAR NUEVO CONOCIMIENTO'}
          </span>
          <span className="text-xs text-zinc-600 mt-2 font-mono uppercase tracking-widest">TIPOS SOPORTADOS:</span>
          <span className="text-xs text-zinc-600 mt-2 font-mono uppercase tracking-widest">TXT, HTML, JSON, DOCX, XLSX, MD, PDF, PPTX, CSV</span>
          <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} accept=".pdf,.docx,.xlsx,.pptx,.csv,.json,.txt,.html,.md" />
        </label>

        {/* Alertas */}
        {error && <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-xl px-4 py-3 mb-6 font-medium shadow-inner">{error}</p>}
        {successMessage && <p className="text-emerald-400 text-sm bg-emerald-950/50 border border-emerald-900/50 rounded-xl px-4 py-3 mb-6 font-medium shadow-inner">{successMessage}</p>}

        {/* Lista de Documentos */}
        {isLoadingList ? (
          <p className="text-zinc-600 text-sm font-mono animate-pulse">CARGANDO ÍNDICE...</p>
        ) : documents.length === 0 ? (
          <p className="text-zinc-600 text-sm font-mono">ÍNDICE VACÍO. REQUIERE INGESTIÓN.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <li key={doc.fileName} className="group flex items-center justify-between bg-[#121215] border border-zinc-800/80 rounded-xl p-4 hover:border-orange-500/40 hover:bg-[#18181b] transition-all duration-200">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                    <FileText className="w-6 h-6 text-zinc-500 group-hover:text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p
                        className="text-sm font-bold text-zinc-200 truncate"
                        title={doc.fileName}
                      >
                        {doc.fileName.replace(/\.[^/.]+$/, '')}
                      </p>

                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getExtensionColor(doc.extension)}`}
                      >
                        {doc.extension.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
                      {formatSize(doc.sizeBytes)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <a href={`${API_BASE_URL}/knowledge/download/${encodeURIComponent(doc.fileName)}`} download title="Descargar" className="p-2 text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </a>
                  <button onClick={() => setDocumentToDelete(doc.fileName)} title="Eliminar" className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>

                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de Eliminación (Dark Theme) */}
      {documentToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0c0e] border border-red-900/50 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Peligro de Pérdida de Datos</h3>
            <p className="text-sm text-zinc-400 mb-8">
              El archivo <span className="font-bold text-zinc-200">{documentToDelete}</span> será destruido permanentemente de la base vectorial.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} disabled={isDeleting} className="w-full px-4 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg">
                {isDeleting ? 'PURGANDO VECTOR...' : 'SÍ, DESTRUIR ARCHIVO'}
              </button>
              <button onClick={() => setDocumentToDelete(null)} disabled={isDeleting} className="w-full px-4 py-3 rounded-xl font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}