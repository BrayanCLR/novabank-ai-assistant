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

const THEME_TOKENS: Record<Theme, Record<string, string>> = {
  dark: {
    bg: '#0A0A0B',
    surface: '#141416',
    surfaceAlt: '#0d0d0e',
    border: '#232326',
    navBorder: 'rgba(28, 28, 31, 0.7)',
    text: '#F5F5F4',
    muted: '#9B9B9F',
    mutedSoft: '#6b6b70',
    iconBg: '#1c1c1f',
    glass: 'rgba(10, 10, 11, 0.8)',
    accentGlow: 'rgba(249, 115, 22, 0.15)',
  },
  light: {
    bg: '#FFFFFF',
    surface: '#F7F7F8',
    surfaceAlt: '#F1F1F2',
    border: '#E5E5E7',
    navBorder: 'rgba(234, 234, 236, 0.7)',
    text: '#0A0A0B',
    muted: '#5B5B60',
    mutedSoft: '#8A8A8F',
    iconBg: '#EDEDEE',
    glass: 'rgba(255, 255, 255, 0.8)',
    accentGlow: 'rgba(249, 115, 22, 0.08)',
  },
};

// Naranja exacto del chat (Tailwind orange-500)
const ORANGE = '#f97316';
const ORANGE_TEXT_ON = '#210D00';

// Colores hardcodeados para el Mockup (para que coincida con el dashboard oscuro real)
const DASH_BG = '#09090b';
const DASH_SIDEBAR = '#0c0c0e';
const DASH_BUBBLE = '#121215';
const DASH_BORDER = 'rgba(39, 39, 42, 0.5)'; // zinc-800/50

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [locale, setLocale] = useState<Locale>('es');

  const t = useMemo(() => content[locale], [locale]);
  const c = THEME_TOKENS[theme];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [locale, theme]);

  return (
    <div style={{ background: c.bg, color: c.text, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        /* ANIMACIONES Y UTILIDADES GLOBALES */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.5, 0, 0, 1), transform 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-1 { transition-delay: 100ms; }
        .delay-2 { transition-delay: 200ms; }
        .delay-3 { transition-delay: 300ms; }
        
        .fintech-card {
          transition: all 0.3s ease;
        }
        .fintech-card:hover {
          transform: translateY(-5px);
          border-color: ${ORANGE}40 !important;
          box-shadow: 0 10px 30px -10px ${c.accentGlow};
        }

        .bg-grid {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            linear-gradient(to right, ${c.border} 1px, transparent 1px),
            linear-gradient(to bottom, ${c.border} 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at 50% 0%, black, transparent 70%);
          -webkit-mask-image: radial-gradient(circle at 50% 0%, black, transparent 70%);
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        .dash-bg-grid {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        /* MEDIA QUERIES RESPONSIVAS PRO (Sobreescritura de estilos en línea en móviles) */
        @media (max-width: 768px) {
          /* Header */
          .resp-header { padding: 12px 16px !important; }
          .resp-nav { display: none !important; }
          .resp-lang-btn { padding: 6px 8px !important; font-size: 11px !important; }
          
          /* Hero */
          .resp-hero { padding: 60px 16px 40px !important; }
          .resp-hero-title { font-size: clamp(32px, 8vw, 42px) !important; }
          .resp-hero-buttons { flex-direction: column !important; gap: 12px !important; width: 100% !important; }
          .resp-hero-buttons > * { width: 100% !important; justify-content: center !important; }
          
          /* Dashboard Mockup */
          .resp-mockup-wrapper { padding: 0 16px 60px !important; }
          .resp-mockup-container { flex-direction: column !important; height: 600px !important; }
          .resp-mockup-sidebar { 
            width: 100% !important; 
            height: auto !important;
            flex-direction: row !important; 
            align-items: center !important; 
            justify-content: space-between !important;
            border-right: none !important; 
            border-bottom: 1px solid ${DASH_BORDER} !important;
          }
          .resp-mockup-logo-area { border-bottom: none !important; padding: 12px 16px !important; }
          .resp-mockup-nav { display: none !important; }
          .resp-mockup-status { border-top: none !important; padding: 0 16px !important; background: transparent !important; }
          .resp-mockup-chat { padding: 16px !important; gap: 16px !important; }
          .resp-mockup-bubble { max-width: 95% !important; padding: 12px 16px !important; font-size: 13px !important; }
          
          /* Secciones (About, How, Features) */
          .resp-section { padding: 40px 16px 60px !important; }
          .resp-grid { grid-template-columns: 1fr !important; }
          
          /* Footer */
          .resp-footer { flex-direction: column !important; gap: 16px !important; text-align: center !important; justify-content: center !important; }
        }
      `}} />

      <div className="bg-grid" />

      {/* HEADER */}
      <header
        className="resp-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: `1px solid ${c.navBorder}`,
          position: 'sticky',
          top: 0,
          background: c.glass,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
          <span
            style={{
              width: 26,
              height: 26,
              background: `${ORANGE}1A`,
              border: `1px solid ${ORANGE}33`,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={15} color={ORANGE} strokeWidth={2.5} />
          </span>
          NovaBank <span style={{ color: ORANGE }}>AI</span>
        </div>

        <nav className="resp-nav" style={{ display: 'flex', gap: 28, fontSize: 14, color: c.muted, fontWeight: 500 }}>
          <a href="#about" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = c.text} onMouseOut={e => e.currentTarget.style.color = c.muted}>{t.nav.about}</a>
          <a href="#how" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = c.text} onMouseOut={e => e.currentTarget.style.color = c.muted}>{t.nav.how}</a>
          <a href="#features" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = c.text} onMouseOut={e => e.currentTarget.style.color = c.muted}>{t.nav.features}</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', border: `1px solid ${c.border}`, borderRadius: 8, overflow: 'hidden', background: c.surface }}>
            {locales.map(({ code, label }) => (
              <button
                key={code}
                className="resp-lang-btn"
                onClick={() => setLocale(code)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: locale === code ? ORANGE : 'transparent',
                  color: locale === code ? ORANGE_TEXT_ON : c.muted,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Cambiar tema"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: c.surface,
              color: c.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            href="/chat"
            className="resp-nav" // Se oculta en móviles muy pequeños para dar prioridad a acciones primarias si es necesario (opcional)
            style={{
              background: ORANGE,
              color: ORANGE_TEXT_ON,
              fontWeight: 600,
              padding: '9px 20px',
              borderRadius: 8,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: `0 4px 14px ${c.accentGlow}`,
              transition: 'transform 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {t.nav.cta}
          </Link>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 10 }}>
        {/* HERO SECTION */}
        <section className="reveal-on-scroll resp-hero" style={{ textAlign: 'center', padding: '100px 24px 64px' }}>
          <div
            style={{
              fontFamily: 'monospace',
              color: ORANGE,
              fontSize: 13,
              letterSpacing: '0.05em',
              marginBottom: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: c.accentGlow,
              padding: '6px 12px',
              borderRadius: 20,
              border: `1px solid ${ORANGE}30`
            }}
          >
            <ShieldCheck size={14} />
            {t.hero.eyebrow}
          </div>
          <h1
            className="resp-hero-title"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 720,
              margin: '0 auto 24px',
              letterSpacing: '-0.02em',
            }}
          >
            {t.hero.headline}
          </h1>
          <p style={{ color: c.muted, fontSize: 18, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.5 }}>
            {t.hero.subhead}
          </p>
          <div className="resp-hero-buttons" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 24, marginInline: 'auto' }}>
            <Link
              href="/chat"
              style={{
                background: ORANGE,
                color: ORANGE_TEXT_ON,
                fontWeight: 600,
                padding: '14px 28px',
                borderRadius: 10,
                fontSize: 16,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 8px 20px ${c.accentGlow}`,
              }}
            >
              {t.hero.ctaPrimary} <ArrowRight size={18} />
            </Link>
            <a
              href="#how"
              style={{
                background: c.surface,
                color: c.text,
                fontWeight: 600,
                padding: '14px 28px',
                borderRadius: 10,
                fontSize: 16,
                border: `1px solid ${c.border}`,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
          <div style={{ fontFamily: 'monospace', color: c.mutedSoft, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Lock size={12} /> {t.hero.trust}
          </div>
        </section>

        {/* DASHBOARD MOCKUP SECTION */}
        <section className="reveal-on-scroll delay-1 resp-mockup-wrapper" style={{ padding: '0 24px 80px', display: 'flex', justifyContent: 'center' }}>
          <div
            className="resp-mockup-container"
            style={{
              width: '100%',
              maxWidth: 880,
              background: DASH_BG,
              border: `1px solid ${c.border}`,
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              boxShadow: `0 24px 50px -12px rgba(0,0,0,0.4)`,
              height: 520, 
            }}
          >
            {/* Sidebar Realista */}
            <div className="resp-mockup-sidebar" style={{ width: 240, background: DASH_SIDEBAR, borderRight: `1px solid ${DASH_BORDER}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              
              {/* Logo Area */}
              <div className="resp-mockup-logo-area" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', borderBottom: `1px solid ${DASH_BORDER}` }}>
                <div style={{ background: `${ORANGE}1A`, padding: '8px', borderRadius: '12px', border: `1px solid ${ORANGE}33` }}>
                  <Zap size={20} color={ORANGE} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '0.02em' }}>NOVA<span style={{ color: ORANGE }}>AI</span></div>
                  <div style={{ color: `${ORANGE}B3`, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em' }}>INTERNAL SYSTEM</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="resp-mockup-nav" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: `${ORANGE}1A`, border: `1px solid ${ORANGE}33`, borderRadius: '12px', color: ORANGE, fontSize: 13, fontWeight: 600, boxShadow: `0 0 15px ${ORANGE}1A` }}>
                  <Bot size={18} /> Centro de Mando
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: '#71717a', fontSize: 13, fontWeight: 600 }}>
                  <Database size={18} /> Base de Conocimiento
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: '#71717a', fontSize: 13, fontWeight: 600 }}>
                  <Activity size={18} /> Monitoreo RAG
                </div>
              </div>

              {/* Status Strip */}
              <div className="resp-mockup-status" style={{ padding: '16px', borderTop: `1px solid ${DASH_BORDER}`, background: '#0a0a0c', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontSize: 11, color: '#71717a', fontFamily: 'monospace' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, boxShadow: `0 0 8px ${ORANGE}CC` }} />
                SYS_OK / 248 DOCS
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="dash-bg-grid" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {/* Dashboard Header */}
              <div style={{ height: '80px', borderBottom: `1px solid ${DASH_BORDER}`, background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldAlert size={22} color={ORANGE} />
                  <div style={{ color: 'white', fontWeight: 800, fontSize: 24, letterSpacing: '-0.05em' }}>NOVA<span style={{ color: ORANGE }}>BANK</span></div>
                </div>
                <div style={{ fontSize: 9, color: '#71717a', letterSpacing: '0.3em', marginTop: 4, fontWeight: 600 }}>FINANCIAL INTELLIGENCE PLATFORM</div>
              </div>

              {/* Chat Feed */}
              <div className="resp-mockup-chat" style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', paddingBottom: 32 }}>
                
                {/* Agent Welcome Message */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#18181b', border: `1px solid ${DASH_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={18} color={ORANGE} />
                  </div>
                  <div className="resp-mockup-bubble" style={{ background: DASH_BUBBLE, border: `1px solid ${DASH_BORDER}`, color: '#d4d4d8', fontSize: 14, padding: '16px 20px', borderRadius: '6px 20px 20px 20px', maxWidth: '80%', lineHeight: 1.5 }}>
                    Bienvenido al Centro de Mando de NovaBank. Soy tu agente RAG de Compliance. ¿En qué te puedo ayudar hoy?
                  </div>
                </div>

                {/* User Message */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div className="resp-mockup-bubble" style={{ background: ORANGE, color: ORANGE_TEXT_ON, fontSize: 14, fontWeight: 500, padding: '16px 20px', borderRadius: '20px 20px 6px 20px', maxWidth: '80%', boxShadow: `0 4px 15px ${ORANGE}33` }}>
                    {t.hero.mockupQuestion}
                  </div>
                </div>

                {/* Agent Response */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#18181b', border: `1px solid ${DASH_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={18} color={ORANGE} />
                  </div>
                  <div className="resp-mockup-bubble" style={{ background: DASH_BUBBLE, border: `1px solid ${DASH_BORDER}`, color: '#d4d4d8', fontSize: 14, padding: '16px 20px', borderRadius: '6px 20px 20px 20px', maxWidth: '85%', lineHeight: 1.6 }}>
                    {t.hero.mockupAnswer}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="reveal-on-scroll resp-section" style={{ padding: '32px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ fontFamily: 'monospace', color: ORANGE, fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
            {t.about.eyebrow}
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.02em' }}>
            {t.about.title}
          </h2>
          <div className="resp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div className="fintech-card" style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 32 }}>
              <div style={{ width: 48, height: 48, background: c.iconBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <ShieldCheck size={24} color={ORANGE} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{t.about.novabankTitle}</div>
              <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.6 }}>{t.about.novabankBody}</p>
            </div>
            <div className="fintech-card" style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 32 }}>
              <div style={{ width: 48, height: 48, background: c.iconBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <MessageCircle size={24} color={ORANGE} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{t.about.novabankAiTitle}</div>
              <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.6 }}>{t.about.novabankAiBody}</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how" className="reveal-on-scroll delay-1 resp-section" style={{ padding: '32px 24px 80px', maxWidth: 1024, margin: '0 auto' }}>
          <div style={{ fontFamily: 'monospace', color: ORANGE, fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
            {t.how.eyebrow}
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 56, letterSpacing: '-0.02em' }}>
            {t.how.title}
          </h2>
          <div className="resp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {t.how.steps.map((step, i) => (
              <div key={step.title} style={{ position: 'relative' }}>
                <div style={{ fontFamily: 'monospace', color: c.border, fontSize: 64, fontWeight: 800, position: 'absolute', top: -35, left: -10, zIndex: -1, opacity: 0.5 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{step.title}</div>
                <p style={{ color: c.muted, fontSize: 14, lineHeight: 1.6 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="reveal-on-scroll delay-2 resp-section" style={{ padding: '32px 24px 96px', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ fontFamily: 'monospace', color: ORANGE, fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
            {t.features.eyebrow}
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.02em' }}>
            {t.features.title}
          </h2>
          <div className="resp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {t.features.items.map((item, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <div
                  key={item.title}
                  className="fintech-card"
                  style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24 }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: c.iconBg,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={20} color={ORANGE} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{item.title}</div>
                  <p style={{ color: c.muted, fontSize: 13.5, lineHeight: 1.6 }}>{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        className="resp-footer"
        style={{
          borderTop: `1px solid ${c.navBorder}`,
          padding: '32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          color: c.mutedSoft,
          position: 'relative',
          zIndex: 10,
          background: c.bg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} />
          <span>{t.footer.rights}</span>
        </div>
        <span style={{ fontFamily: 'monospace' }}>{t.footer.credit}</span>
      </footer>
    </div>
  );
}