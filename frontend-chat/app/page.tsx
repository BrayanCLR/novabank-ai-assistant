'use client';

import { useEffect, useState } from 'react';
import { Activity, Bot, Database, ShieldAlert, Zap, Menu, X } from 'lucide-react';
import ChatSection from './components/ChatSection';
import KnowledgeSection from './components/KnowledgeSection';
import StatusSection from './components/StatusSection';
import { API_BASE_URL } from './lib/config';

type SectionId = 'chat' | 'knowledge' | 'status';

const NAV_ITEMS: { id: SectionId; label: string; icon: typeof Bot }[] = [
  { id: 'chat', label: 'Centro de Mando', icon: Bot },
  { id: 'knowledge', label: 'Base Vectorial', icon: Database },
  { id: 'status', label: 'Monitoreo RAG', icon: Activity },
];

export default function NovaBankDashboard() {
  const [activeSection, setActiveSection] = useState<SectionId>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-300 overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* OVERLAY PARA MÓVILES (Fondo borroso cuando el menú está abierto) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR OSCURO (Responsive: Off-canvas en móvil, fijo en desktop) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-[#0c0c0e] border-r border-zinc-800/50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between md:justify-start gap-3 p-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600/10 p-2 rounded-xl border border-orange-500/20">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg md:text-xl leading-tight tracking-wide">NOVA<span className="text-orange-500">AI</span></h2>
              <p className="text-orange-500/70 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Internal System</p>
            </div>
          </div>
          
          {/* Botón de cerrar (solo móvil) */}
          <button 
            className="md:hidden text-zinc-500 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveSection(id);
                setIsMobileMenuOpen(false); // Cierra el menú al navegar en móviles
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-xl text-sm md:text-sm font-semibold transition-all duration-200 ${
                activeSection === id
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeSection === id ? 'text-orange-500' : 'text-zinc-600'}`} />
              {label}
            </button>
          ))}
        </nav>

        {/* Tira de Estado Persistente */}
        <SystemStatusStrip />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#09090b] relative background-grid w-full">
        
        {/* TOP HEADER - TÍTULO GIGANTE CENTRAL (Responsive) */}
        <header className="h-20 md:h-24 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/50 flex items-center justify-between md:justify-center px-4 md:px-6 relative z-10 shadow-xl flex-shrink-0">
          
          {/* Botón menú hamburguesa (Solo móvil) */}
          <button 
            className="md:hidden text-zinc-400 hover:text-orange-500 transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-7 h-7" />
          </button>

          {/* Contenedor del Título */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 md:gap-3">
              <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-orange-500 animate-pulse" style={{ animationDuration: '3s' }} />
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter drop-shadow-lg">
                NOVA<span className="text-orange-500">BANK</span>
              </h1>
            </div>
            <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-[0.3em] md:tracking-[0.4em] mt-1 font-semibold">
              Corporate Compliance Core
            </p>
          </div>

          {/* Div fantasma para balancear flexbox en móviles */}
          <div className="w-11 md:hidden"></div>
        </header>

        {/* SECCIÓN ACTIVA (Contenedor Dinámico) */}
        <div className="flex-1 overflow-hidden relative z-0 w-full">
          {activeSection === 'chat' && <ChatSection />}
          {activeSection === 'knowledge' && <KnowledgeSection />}
          {activeSection === 'status' && <StatusSection />}
        </div>
      </main>

      {/* Estilos Globales para Scrollbar y Grid */}
      <style dangerouslySetInnerHTML={{__html: `
        .background-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f97316; }
      `}} />
    </div>
  );
}

// Componente: Tira de Monitoreo Persistente
function SystemStatusStrip() {
  const [status, setStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [stats, setStats] = useState<{ documentsIndexed: number; chunksIndexed: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/agent/status`);
        if (!res.ok) throw new Error('offline');
        const data = await res.json();
        if (isMounted) {
          setStatus('online');
          setStats(data);
        }
      } catch {
        if (isMounted) {
          setStatus('offline');
          setStats(null);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="p-4 border-t border-zinc-800/80 bg-[#0a0a0c] font-mono text-[10px] md:text-[11px] text-zinc-500 flex items-center justify-center gap-2 shadow-inner">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
        status === 'online' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse' : 
        status === 'offline' ? 'bg-red-600' : 'bg-zinc-600'
      }`} />
      <span className="tracking-wider truncate">
        {status === 'online' && stats
          ? `SYS_OK / ${stats.documentsIndexed} DOCS`
          : status === 'offline'
            ? 'ERR_CONNECTION'
            : 'AUTH...'}
      </span>
    </div>
  );
}