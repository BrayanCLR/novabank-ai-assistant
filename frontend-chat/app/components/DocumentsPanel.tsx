'use client';

import { useCallback, useEffect, useState } from 'react';

type KnowledgeDocument = {
  fileName: string;
  extension: string;
  sizeBytes: number;
  uploadedAt: string;
};

type DocumentsPanelProps = {
  apiBaseUrl: string;
  onClose: () => void;
};

export default function DocumentsPanel({ apiBaseUrl, onClose }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados para manejo de UI y errores
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estado para el modal de confirmación de eliminación (Zona de Peligro)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/knowledge/documents`);
      if (!res.ok) throw new Error('No se pudo obtener la lista de documentos.');
      const data = await res.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoadingList(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    // Avoid calling setState synchronously inside the effect body which can
    // trigger cascading renders. Schedule the fetch asynchronously.
    const t = setTimeout(() => {
      fetchDocuments();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${apiBaseUrl}/knowledge/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al subir el documento.');

      setSuccessMessage(`"${data.fileName}" indexado correctamente.`);
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${apiBaseUrl}/knowledge/${encodeURIComponent(documentToDelete)}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message ?? 'Error crítico al eliminar el documento.');
      }

      setSuccessMessage(`Documento eliminado. Base de conocimiento reindexada.`);
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al eliminar');
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null); // Cierra el modal
    }
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative">
        
        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
        {documentToDelete && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar documento crítico?</h3>
            <p className="text-slate-600 mb-6">
              Estás a punto de eliminar <strong>{documentToDelete}</strong>. <br/>
              Esta acción borrará el archivo y lo removerá del cerebro de la IA permanentemente.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDocumentToDelete(null)}
                disabled={isDeleting}
                className="px-6 py-2 rounded-lg font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
              >
                {isDeleting ? 'Procesando...' : 'Sí, eliminar de NovaBank'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-900 p-5 flex items-center justify-between shadow-md z-10">
          <div>
            <h2 className="text-white font-bold text-lg">Centro de Conocimiento Corporativo</h2>
            <p className="text-slate-400 text-xs">Gestión de recursos RAG</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none transition-colors">
            &times;
          </button>
        </div>

        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-2 block">
              Inyectar nuevo conocimiento (Soporta múltiples formatos)
            </span>
            <input
              type="file"
              onChange={handleUpload}
              disabled={isUploading}
              accept=".pdf,.docx,.xlsx,.pptx,.csv,.json,.txt,.html,.md"
              className="block w-full text-sm text-slate-600 border border-slate-300 rounded-lg cursor-pointer file:bg-blue-600 file:text-white file:font-medium file:border-0 file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          
          {isUploading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm mt-3 font-medium">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Subiendo, extrayendo texto y generando Embeddings Vectoriales...
            </div>
          )}
          {error && <p className="text-red-600 text-sm mt-3 font-medium bg-red-50 p-2 rounded-md">⚠️ {error}</p>}
          {successMessage && <p className="text-emerald-600 text-sm mt-3 font-medium bg-emerald-50 p-2 rounded-md">✓ {successMessage}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-white">
          <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-2">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Índice Vectorial Activo
            </p>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
              {documents.length} Archivos
            </span>
          </div>

          {isLoadingList ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li
                  key={doc.fileName}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-3 transition-colors duration-200 shadow-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Icono de Archivo Genérico */}
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 truncate" title={doc.fileName}>
                        {doc.fileName}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {formatSize(doc.sizeBytes)} • {doc.extension.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2 mt-3 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <a 
                      href={`${apiBaseUrl}/knowledge/download/${encodeURIComponent(doc.fileName)}`}
                      download
                      title="Descargar respaldo"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </a>
                    <button 
                      onClick={() => setDocumentToDelete(doc.fileName)}
                      title="Eliminar e indexar"
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  La base de conocimiento está vacía. Sube un documento para comenzar.
                </div>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}