'use client';

import { useState, useRef, useEffect } from 'react';
import DocumentsPanel from './components/DocumentsPanel';

type Message = {
  role: 'user' | 'agent';
  content: string;
};

// Antes esto incluía "/agent/ask". Ahora es solo la base, porque
// necesitamos construir varias rutas distintas (/agent/ask,
// /knowledge/documents, /knowledge/upload).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content:
        'Bienvenido al portal corporativo de NovaBank. Soy tu asistente de Inteligencia Artificial para Operaciones, Riesgo y Compliance. ¿En qué te puedo asistir hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDocumentsPanelOpen, setIsDocumentsPanelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/agent/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: userMsg }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message?.[0] ?? 'Error de conexión con el núcleo de NovaBank');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'agent', content: data.respuesta }]);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: `⚠️ [Error de Sistema]: ${message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col h-[85vh]">
        <header className="bg-slate-900 p-5 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              NovaBank <span className="text-blue-400 font-light">AI</span>
            </h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">
              Base de Conocimiento Corporativa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDocumentsPanelOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
            >
              📁 Documentos
            </button>
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 text-xs font-medium">Sistema Operativo</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-4 rounded-xl shadow-sm whitespace-pre-wrap text-[15px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-xl rounded-bl-none shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={sendMessage} className="flex gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: ¿Cuáles son los límites de transferencia o la política KYC?"
              className="flex-1 p-4 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? 'Procesando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>

      {isDocumentsPanelOpen && (
        <DocumentsPanel apiBaseUrl={API_BASE_URL} onClose={() => setIsDocumentsPanelOpen(false)} />
      )}
    </main>
  );
}