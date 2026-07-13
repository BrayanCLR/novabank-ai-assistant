'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MessageCircle,
  Moon,
  Sun,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Activity,
  Lock,
  Zap,
  Bot,
  Database,
  ShieldAlert
} from 'lucide-react';
import { content, locales, type Locale } from './lib/landing-content';

type Theme = 'dark' | 'light';

const FEATURE_ICONS = [Wallet, TrendingUp, Lock, Activity];

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [locale, setLocale] = useState<Locale>('es');

  const t = useMemo(() => content[locale], [locale]);

  // Observer Pro: Usa data-attributes y se desconecta tras revelar para ahorrar CPU
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [locale, theme]);

  return (
    // Wrapper del tema: Al cambiar el estado, Tailwind aplica la variante 'dark:' automáticamente
    <div className={theme}>
      <div className="relative min-h-screen overflow-hidden bg-white text-zinc-900 transition-colors duration-300 dark:bg-[#0A0A0B] dark:text-[#F5F5F4]">
        
        {/* Background Grid Nativo */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-50 bg-[linear-gradient(to_right,var(--color-zinc-200)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-zinc-200)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(circle_at_50%_0%,black,transparent_70%)] dark:bg-[linear-gradient(to_right,#232326_1px,transparent_1px),linear-gradient(to_bottom,#232326_1px,transparent_1px)]" />

        {/* HEADER */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4 dark:border-[#1C1C1F]/70 dark:bg-[#0A0A0B]/80">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <Zap size={15} className="text-orange-500" strokeWidth={2.5} />
            </span>
            NovaBank <span className="text-orange-500">AI</span>
          </div>

          <nav className="hidden gap-7 text-sm font-medium text-zinc-500 md:flex dark:text-[#9B9B9F]">
            <a href="#about" className="transition-colors hover:text-zinc-900 dark:hover:text-[#F5F5F4]">{t.nav.about}</a>
            <a href="#how" className="transition-colors hover:text-zinc-900 dark:hover:text-[#F5F5F4]">{t.nav.how}</a>
            <a href="#features" className="transition-colors hover:text-zinc-900 dark:hover:text-[#F5F5F4]">{t.nav.features}</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Selector de Idioma */}
            <div className="flex overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-[#232326] dark:bg-[#141416]">
              {locales.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLocale(code)}
                  data-active={locale === code}
                  className="px-2 py-1.5 text-[11px] font-semibold transition-all data-[active=true]:bg-orange-500 data-[active=true]:text-[#210D00] data-[active=false]:text-zinc-500 hover:data-[active=false]:bg-zinc-200 md:px-3 md:text-xs dark:data-[active=false]:text-[#9B9B9F] dark:hover:data-[active=false]:bg-[#232326]"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Toggle Theme */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Cambiar tema"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-[#232326] dark:bg-[#141416] dark:text-[#F5F5F4] dark:hover:bg-[#232326]"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              href="/chat"
              className="hidden whitespace-nowrap rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-[#210D00] shadow-[0_4px_14px_rgba(249,115,22,0.15)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 md:inline-flex"
            >
              {t.nav.cta}
            </Link>
          </div>
        </header>

        <main className="relative z-10">
          {/* HERO SECTION */}
          <section className="reveal-on-scroll px-4 pb-10 pt-16 text-center opacity-0 transition-all duration-700 ease-[cubic-bezier(0.5,0,0,1)] data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 md:pb-16 md:pt-24">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 font-mono text-[13px] tracking-wider text-orange-500 dark:bg-orange-500/5">
              <ShieldCheck size={14} />
              {t.hero.eyebrow}
            </div>
            
            <h1 className="mx-auto mb-6 max-w-180 text-[clamp(32px,8vw,56px)] font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-zinc-100">
              {t.hero.headline}
            </h1>
            
            <p className="mx-auto mb-9 max-w-130 text-[17px] leading-relaxed text-zinc-600 md:text-lg dark:text-[#9B9B9F]">
              {t.hero.subhead}
            </p>
            
            <div className="mx-auto mb-6 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row md:gap-4">
              <Link
                href="/chat"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-base font-semibold text-[#210D00] shadow-[0_8px_20px_rgba(249,115,22,0.15)] transition-transform hover:scale-[1.02] sm:w-auto"
              >
                {t.hero.ctaPrimary} <ArrowRight size={18} />
              </Link>
              <a
                href="#how"
                className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-7 py-3.5 text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 sm:w-auto dark:border-[#232326] dark:bg-[#141416] dark:text-[#F5F5F4] dark:hover:bg-[#1c1c1f]"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 font-mono text-[13px] text-zinc-500 dark:text-[#6b6b70]">
              <Lock size={12} /> {t.hero.trust}
            </div>
          </section>

          {/* DASHBOARD MOCKUP SECTION */}
          <section className="reveal-on-scroll flex justify-center px-4 pb-16 opacity-0 delay-100 transition-all duration-700 ease-[cubic-bezier(0.5,0,0,1)] data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 md:pb-20">
            <div className="flex h-150 w-full max-w-220 flex-col overflow-hidden rounded-2xl border border-zinc-800/50 bg-[#09090b] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)] md:h-130 md:flex-row">
              
              {/* Sidebar Realista */}
              <div className="flex w-full shrink-0 flex-row items-center justify-between border-b border-zinc-800/50 bg-[#0c0c0e] md:w-60 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r">
                <div className="flex items-center gap-3 border-zinc-800/50 p-3 md:border-b md:p-5">
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2">
                    <Zap size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <div className="text-base font-bold tracking-wide text-white">NOVA<span className="text-orange-500">AI</span></div>
                    <div className="text-[9px] font-bold tracking-[0.15em] text-orange-500/70">INTERNAL SYSTEM</div>
                  </div>
                </div>

                <div className="hidden flex-1 flex-col gap-2 p-4 md:flex">
                  <div className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-[13px] font-semibold text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <Bot size={18} /> Centro de Mando
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-zinc-500 hover:text-zinc-300">
                    <Database size={18} /> Base de Conocimiento
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-zinc-500 hover:text-zinc-300">
                    <Activity size={18} /> Monitoreo RAG
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2.5 bg-transparent px-4 font-mono text-[11px] text-zinc-500 md:border-t md:border-zinc-800/50 md:bg-[#0a0a0c] md:p-4">
                  <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  SYS_OK / 248 DOCS
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="relative flex flex-1 flex-col bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[30px_30px]">
                <div className="z-10 flex h-20 shrink-0 flex-col items-center justify-center border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert size={22} className="text-orange-500" />
                    <div className="text-2xl font-extrabold tracking-tight text-white">NOVA<span className="text-orange-500">BANK</span></div>
                  </div>
                  <div className="mt-1 text-[9px] font-semibold tracking-[0.3em] text-zinc-500">FINANCIAL INTELLIGENCE PLATFORM</div>
                </div>

                {/* Chat Feed */}
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pb-8 md:gap-6 md:p-8">
                  
                  {/* Agent Welcome Message */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800/50 bg-zinc-900">
                      <Bot size={18} className="text-orange-500" />
                    </div>
                    <div className="max-w-[95%] rounded-[6px_20px_20px_20px] border border-zinc-800/50 bg-[#121215] p-3 text-[13px] leading-relaxed text-zinc-300 md:max-w-[80%] md:p-4 md:text-sm">
                      Bienvenido al Centro de Mando de NovaBank. Soy tu agente RAG de Compliance. ¿En qué te puedo ayudar hoy?
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="max-w-[95%] rounded-[20px_20px_6px_20px] bg-orange-500 p-3 text-[13px] font-medium text-[#210D00] shadow-[0_4px_15px_rgba(249,115,22,0.2)] md:max-w-[80%] md:p-4 md:text-sm">
                      {t.hero.mockupQuestion}
                    </div>
                  </div>

                  {/* Agent Response */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800/50 bg-zinc-900">
                      <Bot size={18} className="text-orange-500" />
                    </div>
                    <div className="max-w-[95%] rounded-[6px_20px_20px_20px] border border-zinc-800/50 bg-[#121215] p-3 text-[13px] leading-relaxed text-zinc-300 md:max-w-[85%] md:p-4 md:text-sm">
                      {t.hero.mockupAnswer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section id="about" className="reveal-on-scroll mx-auto max-w-240 px-4 py-10 opacity-0 transition-all duration-700 ease-[cubic-bezier(0.5,0,0,1)] data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 md:py-20">
            <div className="mb-3 text-center font-mono text-[13px] font-semibold text-orange-500">
              {t.about.eyebrow}
            </div>
            <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight md:mb-12 md:text-4xl">
              {t.about.title}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
              <div className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-[0_10px_30px_-10px_rgba(249,115,22,0.15)] dark:border-[#232326] dark:bg-[#141416]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-[#1c1c1f]">
                  <ShieldCheck size={24} className="text-orange-500" />
                </div>
                <div className="mb-3 text-xl font-bold">{t.about.novabankTitle}</div>
                <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-[#9B9B9F]">{t.about.novabankBody}</p>
              </div>
              <div className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-[0_10px_30px_-10px_rgba(249,115,22,0.15)] dark:border-[#232326] dark:bg-[#141416]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-[#1c1c1f]">
                  <MessageCircle size={24} className="text-orange-500" />
                </div>
                <div className="mb-3 text-xl font-bold">{t.about.novabankAiTitle}</div>
                <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-[#9B9B9F]">{t.about.novabankAiBody}</p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section id="how" className="reveal-on-scroll mx-auto max-w-5xl px-4 py-10 opacity-0 delay-100 transition-all duration-700 ease-[cubic-bezier(0.5,0,0,1)] data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 md:py-20">
            <div className="mb-3 text-center font-mono text-[13px] font-semibold text-orange-500">
              {t.how.eyebrow}
            </div>
            <h2 className="mb-12 text-center text-3xl font-extrabold tracking-tight md:mb-14 md:text-4xl">
              {t.how.title}
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
              {t.how.steps.map((step, i) => (
                <div key={step.title} className="relative pt-4">
                  <div className="absolute -left-2 -top-6 -z-10 font-mono text-[64px] font-extrabold opacity-30 text-zinc-200 dark:text-[#232326]">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="mb-2.5 text-lg font-bold">{step.title}</div>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-[#9B9B9F]">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section id="features" className="reveal-on-scroll mx-auto max-w-240 px-4 py-10 pb-20 opacity-0 delay-200 transition-all duration-700 ease-[cubic-bezier(0.5,0,0,1)] data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 md:py-20 md:pb-24">
            <div className="mb-3 text-center font-mono text-[13px] font-semibold text-orange-500">
              {t.features.eyebrow}
            </div>
            <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight md:mb-12 md:text-4xl">
              {t.features.title}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {t.features.items.map((item, i) => {
                const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-[0_10px_30px_-10px_rgba(249,115,22,0.15)] dark:border-[#232326] dark:bg-[#141416]"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-[#1c1c1f]">
                      <Icon size={20} className="text-orange-500" />
                    </div>
                    <div className="mb-2 text-base font-bold">{item.title}</div>
                    <p className="text-[13.5px] leading-relaxed text-zinc-600 dark:text-[#9B9B9F]">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="relative z-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200/70 bg-white px-6 py-8 text-center text-[13px] text-zinc-500 md:flex-row md:text-left dark:border-[#1C1C1F]/70 dark:bg-[#0A0A0B] dark:text-[#6b6b70]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>{t.footer.rights}</span>
          </div>
          <span className="font-mono">{t.footer.credit}</span>
        </footer>
      </div>
    </div>
  );
}