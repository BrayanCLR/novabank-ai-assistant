'use client';

import { useCallback, useEffect, useState } from 'react';
import { Cpu, Database, RefreshCw, Server, Clock } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

type SystemStatus = { documentsIndexed: number; chunksIndexed: number; lastIndexedAt: string | null; embeddingModel: string; generationModel: string; };

export default function StatusSection() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errored, setErrored] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Verificando conexión...');

  const checkStatus = useCallback(async (signal?: AbortSignal) => {
    setIsChecking(true);
    setErrored(false);
    setStatusMessage('Verificando conexión...');
    const start = Date.now();
    try {
      const res = await fetch(`${API_BASE_URL}/agent/status`, { signal });
      if (!res.ok) throw new Error('offline');
      const json = await res.json();
      if (signal?.aborted) return;
      setData(json);
      setLatencyMs(Date.now() - start);
      setStatusMessage('Conexión estable');
    } catch (error) {
      if ((error as Error & { name?: string }).name === 'AbortError') return;
      setData(null);
      setErrored(true);
      setStatusMessage('Sin conexión con el backend');
    } finally {
      if (!signal?.aborted) setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const loadStatus = async () => {
      await checkStatus(abortController.signal);
    };

    void loadStatus();

    return () => {
      abortController.abort();
    };
  }, [checkStatus]);

  const formatDate = (iso: string | null) => iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '---';

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Monitoreo RAG</h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">Métricas en tiempo real del motor vectorial.</p>
          </div>
          <div className="flex flex-col items-end">
            <button
              onClick={() => {
                void checkStatus();
              }}
              disabled={isChecking}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-orange-500 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 border border-zinc-800"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">SYNC</span>
            </button>
            <p className="text-xs text-zinc-500 mt-2">{statusMessage}</p>
          </div>
        </div>

        {errored ? (
          <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 text-sm text-red-400 font-mono shadow-inner">
            <span className="font-bold text-red-500">FATAL ERROR:</span> Fallo de conexión con el núcleo backend en <span className="text-zinc-300">{API_BASE_URL}</span>. Verifica Docker/NestJS.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Database} label="Documentos" value={data ? String(data.documentsIndexed) : '0'} />
              <StatCard icon={Cpu} label="Vectores" value={data ? String(data.chunksIndexed) : '0'} mono />
              <StatCard icon={Clock} label="Última Indexación" value={data ? formatDate(data.lastIndexedAt) : '---'} small />
              <StatCard icon={Server} label="Latencia API" value={latencyMs !== null ? `${latencyMs}ms` : '---'} mono />
            </div>

            <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 font-mono text-[13px] text-zinc-400 space-y-3 shadow-inner">
              <h3 className="text-white font-sans font-bold text-sm mb-4 tracking-wide">MODELOS DE INTELIGENCIA ACTIVA</h3>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                <span>sys.embedding_model</span>
                <span className="text-orange-500 font-bold bg-orange-500/10 px-2 py-1 rounded">{data?.embeddingModel ?? 'OFFLINE'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>sys.generation_model</span>
                <span className="text-orange-500 font-bold bg-orange-500/10 px-2 py-1 rounded">{data?.generationModel ?? 'OFFLINE'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, mono, small }: { icon: typeof Database; label: string; value: string; mono?: boolean; small?: boolean; }) {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 hover:border-orange-500/30 transition-colors shadow-md">
      <div className="flex items-center gap-2 text-zinc-500 mb-3">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={`font-bold text-white ${mono ? 'font-mono tracking-wider' : ''} ${small ? 'text-sm md:text-base' : 'text-3xl'}`}>
        {value}
      </p>
    </div>
  );
}