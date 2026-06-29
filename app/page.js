'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [dark, setDark] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') setDark(false)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--mode', dark ? 'dark' : 'light')
  }, [dark])

  const go = (path) => router.push(path)

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

  const card = { background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24, transition: 'all .25s' }

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', transition: 'all .3s' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: S.bg, borderBottom: `1px solid ${S.border}`, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 17, color: S.text }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${S.accent},${S.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 800 }}>K</div>
            KhawarAI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setDark(d => !d)} style={{ width: 36, height: 36, borderRadius: 9, background: S.surface, border: `1px solid ${S.border}`, cursor: 'pointer', color: S.text2, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dark ? '🌙' : '☀️'}
            </button>
            <button onClick={() => go('/login')} style={{ padding: '8px 18px', background: 'transparent', color: S.text, border: `1px solid ${S.border}`, borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Sign in</button>
            <button onClick={() => go('/login')} style={{ padding: '8px 18px', background: S.accent, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Get started →</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '90px 24px 70px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: S.bg }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle,${S.glow},transparent 70%)`, top: -100, left: '60%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: S.glow, border: `1px solid ${S.accent}`, borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'block' }} />
            <span style={{ fontSize: 13, color: S.accent, fontWeight: 500 }}>Powered by Google Gemini AI · Free to use</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: S.text }}>
            Your intelligent<br />
            <span style={{ background: `linear-gradient(135deg,${S.accent},${S.accent2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI assistant</span>
            <br />for everything
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: S.text2, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
            KhawarAI is a multi-mode AI chatbot that helps you code, write, translate, and think — all in one beautiful interface.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => go('/login')} style={{ padding: '13px 28px', background: S.accent, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Start for free 🚀</button>
            <button onClick={() => go('/chat')} style={{ padding: '13px 28px', background: 'transparent', color: S.text, border: `1.5px solid ${S.border}`, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Open Chat →</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56, flexWrap: 'wrap' }}>
            {[['4', 'AI Modes'], ['∞', 'Conversations'], ['100%', 'Free'], ['24/7', 'Always on']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: S.accent }}>{v}</div>
                <div style={{ fontSize: 12, color: S.text3, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODES */}
      <section style={{ padding: '64px 24px', background: S.bg2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: S.accent, letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>AI Modes</p>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, textAlign: 'center', color: S.text, marginBottom: 10 }}>One AI, four superpowers</h2>
          <p style={{ fontSize: 15, color: S.text2, textAlign: 'center', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.7 }}>Switch between modes instantly — each tuned for the best results.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20 }}>
            {[
              { icon: '✨', color: 'rgba(139,92,246,.12)', title: 'General Assistant', desc: 'Ask anything — questions, summaries, research, and everyday tasks handled intelligently.' },
              { icon: '💻', color: 'rgba(6,182,212,.12)', title: 'Code Helper', desc: 'Debug code, write functions, and get expert programming guidance with syntax highlighting.' },
              { icon: '✍️', color: 'rgba(245,158,11,.12)', title: 'Creative Writing', desc: 'Stories, poems, scripts, and essays — unleash creativity with an imaginative AI co-writer.' },
              { icon: '🌐', color: 'rgba(16,185,129,.12)', title: 'Translator', desc: 'Accurate translations between English, Urdu, and Hindi with natural phrasing.' },
            ].map((m) => (
              <div key={m.title} onClick={() => go('/login')} style={{ ...card, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{m.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 6 }}>{m.title}</h3>
                <p style={{ fontSize: 13, color: S.text2, lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '64px 24px', background: S.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: S.accent, letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, textAlign: 'center', color: S.text, marginBottom: 10 }}>Up and running in seconds</h2>
          <p style={{ fontSize: 15, color: S.text2, textAlign: 'center', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.7 }}>No complicated setup — just sign up and start chatting.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
            {[
              { n: 1, title: 'Create account', desc: 'Sign up with your email in seconds. No credit card needed.' },
              { n: 2, title: 'Pick AI mode', desc: 'Choose from General, Code, Creative, or Translator — switch anytime.' },
              { n: 3, title: 'Start chatting', desc: 'Get real-time streaming AI responses. Chat history saved automatically.' },
            ].map((s) => (
              <div key={s.n} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg,${S.accent},${S.accent2})`, color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{s.n}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: S.text2, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '64px 24px', background: S.bg2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: S.accent, letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>Features</p>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, textAlign: 'center', color: S.text, marginBottom: 48 }}>Everything you need</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              { icon: '⚡', bg: 'rgba(139,92,246,.12)', title: 'Real-time streaming', desc: 'Responses stream live as generated — no waiting for long answers.' },
              { icon: '💾', bg: 'rgba(6,182,212,.12)', title: 'Chat history', desc: 'All conversations saved securely. Pick up right where you left off.' },
              { icon: '🌙', bg: 'rgba(245,158,11,.12)', title: 'Dark & light mode', desc: 'Easy on your eyes day or night with a beautiful theme toggle.' },
              { icon: '📱', bg: 'rgba(16,185,129,.12)', title: 'Mobile responsive', desc: 'Works perfectly on any device — desktop, tablet, or phone.' },
              { icon: '🔐', bg: 'rgba(239,68,68,.12)', title: 'Secure auth', desc: 'Account and conversations protected with Supabase authentication.' },
              { icon: '🎯', bg: 'rgba(139,92,246,.12)', title: 'Code highlighting', desc: 'Beautiful syntax highlighting for 100+ languages in responses.' },
            ].map((f) => (
              <div key={f.title} style={{ ...card, display: 'flex', gap: 16, alignItems: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 5 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: S.text2, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: S.bg, textAlign: 'center' }}>
        <div style={{ background: `linear-gradient(135deg,${S.glow},rgba(6,182,212,.06))`, border: `1px solid ${S.border}`, borderRadius: 24, padding: '60px 32px', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: S.text, marginBottom: 14 }}>Ready to chat smarter?</h2>
          <p style={{ fontSize: 15, color: S.text2, marginBottom: 32, lineHeight: 1.7 }}>Join KhawarAI today — 100% free, no credit card needed.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => go('/login')} style={{ padding: '13px 28px', background: S.accent, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Get started free 🚀</button>
            <button onClick={() => go('/chat')} style={{ padding: '13px 28px', background: 'transparent', color: S.text, border: `1.5px solid ${S.border}`, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Open Chat →</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: S.surface, borderTop: `1px solid ${S.border}`, padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${S.accent},${S.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>K</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: S.text }}>KhawarAI</span>
          </div>
          <span style={{ fontSize: 13, color: S.text3 }}>© 2025 Khawar Rafique · Built with Next.js & Google Gemini</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Chat', 'About', 'GitHub'].map(l => (
              <a key={l} onClick={() => go(l === 'Chat' ? '/chat' : '/login')} style={{ fontSize: 13, color: S.text3, cursor: 'pointer', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}