'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

type Message = { role: 'user' | 'agent'; content: string };

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: 'Bienvenido al Centro de Mando de NovaBank. Soy tu agente RAG de Compliance. ¿En qué te puedo ayudar hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setMessages((prev) => [...prev, { role: 'agent', content: `⚠️ ${message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Historial de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                msg.role === 'user' ? 'bg-orange-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-orange-500'
              }`}
            >
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div
              className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-md ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-black font-medium rounded-tr-none'
                  : 'bg-[#121215] border border-zinc-800/80 text-zinc-300 rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-orange-500 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input de Chat */}
      <div className="p-4 md:p-6 bg-[#0c0c0e]/80 backdrop-blur-xl border-t border-zinc-800/50">
        <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: ¿Cuáles son las políticas KYC o los límites transaccionales?"
            className="flex-1 py-4 pl-6 pr-16 bg-[#18181b] border border-zinc-800 rounded-2xl focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all text-zinc-200 placeholder-zinc-600 shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black w-14 rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:shadow-none"
          >
            <Send className="w-6 h-6 ml-1" />
          </button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 mt-3 font-medium uppercase tracking-widest">
          NovaBank AI puede cometer errores. Verifica con el área legal.
        </p>
      </div>
    </div>
  );
}