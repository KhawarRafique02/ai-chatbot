'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bot, Moon, Sun, ArrowRight, Sparkles, Code2, Pencil, Languages,
  Zap, Database, Smartphone, Lock, PlayCircle, Mail
} from 'lucide-react'

export default function HomePage() {
  const [dark, setDark] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') setDark(false)
  }, [])

  const go = (path) => router.push(path)
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const S = {
    bg: dark ? '#0A0A0F' : '#F8FAFC',
    bg2: dark ? '#111118' : '#F1F5F9',
    surface: dark ? '#1a1a27' : '#ffffff',
    border: dark ? '#1e1e2e' : '#E2E8F0',
    text: dark ? '#f1f5f9' : '#0F172A',
    text2: dark ? '#94a3b8' : '#475569',
    text3: dark ? '#475569' : '#94a3b8',
    accent: dark ? '#8B5CF6' : '#7C3AED',
    accent2: '#06B6D4',
    glow: dark ? 'rgba(139,92,246,0.15)' : 'rgba(124,58,237,0.08)',
  }

  const card = { background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 18, transition: 'border-color .2s' }
  const btnBase = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', transition: 'all .15s' }

  const MODES = [
    { Icon: Sparkles, color: S.accent, bg: 'rgba(139,92,246,.14)', title: 'General assistant', desc: 'Ask anything — questions, research, summaries, and everyday tasks.' },
    { Icon: Code2, color: '#06B6D4', bg: 'rgba(6,182,212,.14)', title: 'Code helper', desc: 'Debug, write functions, and get expert programming guidance.' },
    { Icon: Pencil, color: '#F59E0B', bg: 'rgba(245,158,11,.14)', title: 'Creative writing', desc: 'Stories, poems, and scripts with an imaginative AI co-writer.' },
    { Icon: Languages, color: '#10B981', bg: 'rgba(16,185,129,.14)', title: 'Translator', desc: 'Accurate translations between English, Urdu, and Hindi.' },
  ]

  const FEATURES = [
    { Icon: Zap, color: S.accent, bg: 'rgba(139,92,246,.14)', title: 'Real-time streaming', desc: 'Responses stream live, no waiting for long answers.' },
    { Icon: Database, color: '#06B6D4', bg: 'rgba(6,182,212,.14)', title: 'Chat history', desc: 'Conversations saved securely, pick up anytime.' },
    { Icon: dark ? Moon : Sun, color: '#F59E0B', bg: 'rgba(245,158,11,.14)', title: 'Dark and light mode', desc: 'Easy on your eyes, day or night.' },
    { Icon: Smartphone, color: '#10B981', bg: 'rgba(16,185,129,.14)', title: 'Mobile responsive', desc: 'Works perfectly on any device or screen size.' },
    { Icon: Lock, color: '#EF4444', bg: 'rgba(239,68,68,.14)', title: 'Secure auth', desc: 'Account and chats protected with Supabase.' },
    { Icon: Code2, color: S.accent, bg: 'rgba(139,92,246,.14)', title: 'Code highlighting', desc: 'Beautiful syntax highlighting for 100+ languages.' },
  ]

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', transition: 'all .3s' }}>

      <style>{`
        .hero-title { font-size: 28px; }
        .hero-desc { font-size: 14px; max-width: 380px; }
        .hero-btn-wrap { flex-direction: column; max-width: 280px; margin: 0 auto; }
        .stats-grid { grid-template-columns: repeat(4,1fr); gap: 8px; max-width: 420px; }
        .modes-grid { grid-template-columns: 1fr; }
        .steps-grid { grid-template-columns: 1fr; }
        .feat-grid { grid-template-columns: 1fr; }
        .sec-title-cls { font-size: 22px; }
        @media (min-width: 640px) {
          .hero-title { font-size: 38px !important; max-width: 560px; }
          .hero-desc { font-size: 15px !important; max-width: 460px; }
          .hero-btn-wrap { flex-direction: row !important; max-width: none !important; }
          .modes-grid { grid-template-columns: repeat(2,1fr) !important; }
          .steps-grid { grid-template-columns: repeat(3,1fr) !important; }
          .feat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sec-title-cls { font-size: 28px !important; }
          .stats-grid { gap: 24px !important; }
        }
        @media (min-width: 900px) {
          .hero-title { font-size: 46px !important; max-width: 640px; }
          .modes-grid { grid-template-columns: repeat(4,1fr) !important; }
          .feat-grid { grid-template-columns: repeat(3,1fr) !important; }
          .sec-title-cls { font-size: 32px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: S.bg, borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, color: S.text }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${S.accent},${S.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>K</div>
            KhawarAI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setDark(d => !d)} style={{ width: 32, height: 32, borderRadius: 8, background: S.surface, border: `1px solid ${S.border}`, cursor: 'pointer', color: S.text2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dark ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button onClick={() => go('/login')} style={{ ...btnBase, padding: '7px 12px', fontSize: 13, background: 'transparent', color: S.text, border: `1px solid ${S.border}` }}>Sign in</button>
            <button onClick={() => go('/login')} style={{ ...btnBase, padding: '7px 12px', fontSize: 13, background: S.accent, color: '#fff' }}>Get started<ArrowRight size={13} /></button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '48px 16px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle,${S.glow},transparent 70%)`, top: -80, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: S.glow, border: `1px solid ${S.accent}`, borderRadius: 100, padding: '5px 14px', marginBottom: 24, fontSize: 12, color: S.accent, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
            Powered by Google Gemini AI · Free to use
          </div>
          <h1 className="hero-title" style={{ fontWeight: 800, lineHeight: 1.2, marginBottom: 14, color: S.text, marginLeft: 'auto', marginRight: 'auto' }}>
            Your intelligent
            <span style={{ display: 'block', background: `linear-gradient(135deg,${S.accent},${S.accent2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI assistant</span>
            for everything
          </h1>
          <p className="hero-desc" style={{ color: S.text2, margin: '0 auto 26px', lineHeight: 1.65 }}>
            KhawarAI helps you code, write, translate, and think — all in one beautiful, fast interface.
          </p>
          <div className="hero-btn-wrap" style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => go('/login')} style={{ ...btnBase, padding: '13px 26px', fontSize: 14, borderRadius: 11, background: S.accent, color: '#fff', width: '100%' }}>
              <Zap size={16} />Start for free
            </button>
            <button onClick={() => scrollTo('how')} style={{ ...btnBase, padding: '13px 26px', fontSize: 14, borderRadius: 11, background: 'transparent', color: S.text, border: `1.5px solid ${S.border}`, width: '100%' }}>
              <PlayCircle size={16} />See how it works
            </button>
          </div>
          <div className="stats-grid" style={{ display: 'grid', marginTop: 36, marginLeft: 'auto', marginRight: 'auto' }}>
            {[['4', 'AI modes'], ['∞', 'Chats'], ['100%', 'Free'], ['24/7', 'Online']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: S.accent }}>{v}</div>
                <div style={{ fontSize: 10, color: S.text3, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODES */}
      <section style={{ padding: '44px 16px', background: S.bg2 }} id="modes">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: S.accent, letterSpacing: '.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>AI modes</p>
          <h2 className="sec-title-cls" style={{ fontWeight: 800, textAlign: 'center', color: S.text, marginBottom: 8 }}>One AI, four superpowers</h2>
          <p style={{ fontSize: 13, color: S.text2, textAlign: 'center', maxWidth: 340, margin: '0 auto 32px', lineHeight: 1.6 }}>Switch modes instantly — each one tuned for the best results.</p>
          <div className="modes-grid" style={{ display: 'grid', gap: 14 }}>
            {MODES.map(({ Icon, color, bg, title, desc }) => (
              <div key={title} onClick={() => go('/login')} style={{ ...card, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = S.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 5 }}>{title}</h3>
                <p style={{ fontSize: 12.5, color: S.text2, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '44px 16px' }} id="how">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: S.accent, letterSpacing: '.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>How it works</p>
          <h2 className="sec-title-cls" style={{ fontWeight: 800, textAlign: 'center', color: S.text, marginBottom: 8 }}>Up and running in seconds</h2>
          <p style={{ fontSize: 13, color: S.text2, textAlign: 'center', maxWidth: 340, margin: '0 auto 32px', lineHeight: 1.6 }}>No complicated setup, just sign up and start chatting.</p>
          <div className="steps-grid" style={{ display: 'grid', gap: 20 }}>
            {[
              { n: 1, title: 'Create your account', desc: 'Sign up with email in seconds. No card needed.' },
              { n: 2, title: 'Pick your AI mode', desc: 'Choose General, Code, Creative, or Translator anytime.' },
              { n: 3, title: 'Start chatting', desc: 'Get streaming AI replies. Your history saves automatically.' },
            ].map((s) => (
              <div key={s.n} style={{ textAlign: 'center', padding: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${S.accent},${S.accent2})`, color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{s.n}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 12.5, color: S.text2, lineHeight: 1.55, maxWidth: 260, margin: '0 auto' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '44px 16px', background: S.bg2 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: S.accent, letterSpacing: '.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>Features</p>
          <h2 className="sec-title-cls" style={{ fontWeight: 800, textAlign: 'center', color: S.text, marginBottom: 32 }}>Everything you need</h2>
          <div className="feat-grid" style={{ display: 'grid', gap: 12 }}>
            {FEATURES.map(({ Icon, color, bg, title, desc }) => (
              <div key={title} style={{ ...card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>
                  <Icon size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 4 }}>{title}</h3>
                  <p style={{ fontSize: 12, color: S.text2, lineHeight: 1.55 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '44px 16px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ background: `linear-gradient(135deg,${S.glow},rgba(6,182,212,.06))`, border: `1px solid ${S.border}`, borderRadius: 18, padding: '36px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, marginBottom: 10 }}>Ready to chat smarter?</h2>
            <p style={{ fontSize: 13, color: S.text2, marginBottom: 22, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 22px' }}>Join KhawarAI today, 100% free, no credit card needed.</p>
            <button onClick={() => go('/login')} style={{ ...btnBase, padding: '13px 26px', fontSize: 14, borderRadius: 11, background: S.accent, color: '#fff' }}>
              <Zap size={16} />Get started free
            </button>
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section style={{ padding: '44px 16px' }} id="support">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: S.accent, letterSpacing: '.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>Support</p>
          <h2 className="sec-title-cls" style={{ fontWeight: 800, textAlign: 'center', color: S.text, marginBottom: 8 }}>Need a hand?</h2>
          <p style={{ fontSize: 13, color: S.text2, textAlign: 'center', maxWidth: 340, margin: '0 auto 32px', lineHeight: 1.6 }}>Running into an issue? Reach out directly and I'll help you sort it out.</p>
          <div style={{ ...card, textAlign: 'center', maxWidth: 440, margin: '0 auto', padding: 22 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: S.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: S.accent }}>
              <Mail size={20} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 6 }}>Contact support</h3>
            <p style={{ fontSize: 12.5, color: S.text2, lineHeight: 1.6, marginBottom: 16 }}>For bugs, questions, or feedback, email me directly and I'll get back to you as soon as I can.</p>
            <a href="mailto:khawar232767@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 9, padding: '9px 14px', fontSize: 12.5, color: S.text, fontFamily: 'monospace', textDecoration: 'none' }}>
              <Mail size={14} />khawar232767@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: S.surface, borderTop: `1px solid ${S.border}`, padding: '24px 16px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg,${S.accent},${S.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>K</div>
            <span style={{ fontWeight: 700, fontSize: 13, color: S.text }}>KhawarAI</span>
          </div>
          <span style={{ fontSize: 11.5, color: S.text3 }}>© 2025 Khawar Rafique · Built with Next.js and Google Gemini</span>
          <div style={{ display: 'flex', gap: 18 }}>
            <a onClick={() => go('/chat')} style={{ fontSize: 12, color: S.text3, cursor: 'pointer', textDecoration: 'none' }}>Chat</a>
            <a onClick={() => scrollTo('support')} style={{ fontSize: 12, color: S.text3, cursor: 'pointer', textDecoration: 'none' }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}