'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Bot, Plus, Send, Trash2, LogOut, Menu, X,
  Copy, Check, ChevronDown, Loader2, Moon, Sun,
  Code2, Pencil, Languages, Sparkles, MessageSquare
} from 'lucide-react'

const MODES = [
  { id: 'general',    label: 'General',    icon: Sparkles,     color: '#8B5CF6', desc: 'General AI assistant' },
  { id: 'code',       label: 'Code',       icon: Code2,        color: '#06B6D4', desc: 'Code & debugging help' },
  { id: 'creative',   label: 'Creative',   icon: Pencil,       color: '#F59E0B', desc: 'Writing & creative' },
  { id: 'translator', label: 'Translate',  icon: Languages,    color: '#10B981', desc: 'English ↔ Urdu/Hindi' },
]

function getTheme(dark) {
  return dark ? {
    bg: '#0d0d14', bg2: '#0a0a11', surface: '#111118', surface2: '#1a1a27',
    border: '#1e1e2e', text: '#f1f5f9', text2: '#94a3b8', text3: '#64748b', text4: '#475569',
    accent: '#8B5CF6', accentHover: '#7C3AED', userBubble: '#8B5CF6', userText: '#ffffff',
    aiBubbleBg: '#111118',
  } : {
    bg: '#F8FAFC', bg2: '#F1F5F9', surface: '#ffffff', surface2: '#F1F5F9',
    border: '#E2E8F0', text: '#0F172A', text2: '#475569', text3: '#64748b', text4: '#94a3b8',
    accent: '#7C3AED', accentHover: '#6D28D9', userBubble: '#7C3AED', userText: '#ffffff',
    aiBubbleBg: '#ffffff',
  }
}

function CopyBtn({ text, T }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{
      position: 'absolute', top: 8, right: 8,
      background: T.surface2, border: 'none', borderRadius: 6,
      padding: '4px 8px', color: T.text2, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
    }}>
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  )
}

function MdContent({ content, T }) {
  return (
    <div style={{ color: T.text, fontSize: 14, lineHeight: 1.7 }}>
      <ReactMarkdown
        components={{
          p:  ({ children }) => <p style={{ margin: '6px 0', color: T.text }}>{children}</p>,
          li: ({ children }) => <li style={{ margin: '3px 0', color: T.text }}>{children}</li>,
          h1: ({ children }) => <h1 style={{ fontWeight: 700, fontSize: '1.4em', margin: '12px 0 6px', color: T.text }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontWeight: 700, fontSize: '1.2em', margin: '12px 0 6px', color: T.text }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontWeight: 700, fontSize: '1.05em', margin: '12px 0 6px', color: T.text }}>{children}</h3>,
          strong: ({ children }) => <strong style={{ fontWeight: 600, color: T.text }}>{children}</strong>,
          em: ({ children }) => <em style={{ fontStyle: 'italic', color: T.text2 }}>{children}</em>,
          a:  ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: 'underline' }}>{children}</a>,
          blockquote: ({ children }) => <blockquote style={{ borderLeft: `3px solid ${T.accent}`, paddingLeft: 12, margin: '8px 0', color: T.text2 }}>{children}</blockquote>,
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const code  = String(children).replace(/\n$/, '')
            if (!inline && match) {
              return (
                <div style={{ position: 'relative', margin: '10px 0' }}>
                  <div style={{
                    background: T.surface2, borderRadius: '10px 10px 0 0',
                    padding: '6px 14px', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', borderBottom: `1px solid ${T.border}`,
                  }}>
                    <span style={{ fontSize: 12, color: T.text3 }}>{match[1]}</span>
                    <CopyBtn text={code} T={T} />
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, borderRadius: '0 0 10px 10px', fontSize: 13 }}
                    {...props}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              )
            }
            return <code style={{ background: T.surface2, padding: '2px 6px', borderRadius: 4, fontSize: '0.875em', color: T.accent, fontFamily: 'monospace' }} {...props}>{children}</code>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function TypingIndicator({ T }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '8px 0' }}>
      {[0,1,2].map(i => (
        <span key={i} className="typing-dot" style={{
          width: 8, height: 8, borderRadius: '50%', background: T.accent, display: 'block',
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  )
}

export default function ChatPage() {
  const supabase      = createClient()
  const router        = useRouter()
  const bottomRef     = useRef(null)
  const inputRef      = useRef(null)
  const textareaRef   = useRef(null)

  const [user, setUser]             = useState(null)
  const [conversations, setConvs]   = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [mode, setMode]             = useState('general')
  const [loading, setLoading]       = useState(false)
  const [streaming, setStreaming]   = useState(false)
  const [sidebarOpen, setSidebar]   = useState(false)
  const [modeOpen, setModeOpen]     = useState(false)
  const [dark, setDark]             = useState(true)
  const [isMobile, setIsMobile]     = useState(false)
  const [narrow, setNarrow]         = useState(false)

  const T = getTheme(dark)
  const currentMode = MODES.find(m => m.id === mode)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const saved = localStorage.getItem('chat-theme')
    if (saved === 'light') setDark(false)
    const checkSize = () => {
      const mobile = window.innerWidth < 880
      setIsMobile(mobile)
      setNarrow(window.innerWidth < 420)
      setSidebar(!mobile)
    }
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => {
      document.body.style.overflow = ''
      document.body.style.background = ''
      window.removeEventListener('resize', checkSize)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chat-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login')
      else setUser(data.session.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.replace('/login')
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    loadConversations()
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 160) + 'px' }
  }, [input])

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50)
    setConvs(data || [])
  }

  const loadMessages = async (convId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const selectConversation = async (conv) => {
    setActiveConv(conv)
    setMode(conv.mode || 'general')
    await loadMessages(conv.id)
    if (isMobile) setSidebar(false)
    inputRef.current?.focus()
  }

  const newChat = () => {
    setActiveConv(null)
    setMessages([])
    setInput('')
    if (isMobile) setSidebar(false)
    inputRef.current?.focus()
  }

  const deleteConversation = async (e, convId) => {
    e.stopPropagation()
    await supabase.from('conversations').delete().eq('id', convId)
    if (activeConv?.id === convId) newChat()
    await loadConversations()
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading || streaming) return
    setInput('')
    setLoading(true)

    let convId = activeConv?.id
    if (!convId) {
      const { data: conv } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, mode, title: text.slice(0, 60) })
        .select()
        .single()
      convId = conv.id
      setActiveConv(conv)
      setConvs(prev => [conv, ...prev])
    }

    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, role: 'user', content: text })
      .select()
      .single()

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(false)
    setStreaming(true)

    const placeholder = { id: 'streaming', role: 'assistant', content: '' }
    setMessages(prev => [...prev, placeholder])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          mode,
          conversationId: convId,
        }),
      })

      if (!res.ok) throw new Error('API error')

      const reader   = res.body.getReader()
      const decoder  = new TextDecoder()
      let fullText   = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m =>
          m.id === 'streaming' ? { ...m, content: fullText } : m
        ))
      }

      await loadConversations()
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === 'streaming' ? { ...m, content: '⚠️ Error: ' + err.message } : m
      ))
    } finally {
      setStreaming(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: T.bg, position: 'relative' }}>

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebar(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
        }} />
      )}

      <aside style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        background: T.bg2,
        borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        position: isMobile ? 'fixed' : 'relative',
        top: 0, left: 0, bottom: 0, zIndex: 45,
        height: '100%',
      }}>
        <div style={{ padding: '12px 12px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bot size={17} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: T.text }}>KhawarAI</span>
            </div>
            {isMobile && (
              <button onClick={() => setSidebar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text2, padding: 4 }}>
                <X size={18} />
              </button>
            )}
          </div>

          <button onClick={newChat} style={{
            width: '100%', padding: '9px 14px', borderRadius: 9,
            background: T.accent, color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Plus size={15} /> New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {conversations.length === 0 && (
            <p style={{ fontSize: 12, color: T.text4, textAlign: 'center', padding: '20px 8px' }}>
              No conversations yet
            </p>
          )}
          {conversations.map(conv => (
            <div key={conv.id}
              style={{ position: 'relative', marginBottom: 2 }}
              onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
              onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
            >
              <button onClick={() => selectConversation(conv)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  borderRadius: 8, cursor: 'pointer', border: 'none',
                  background: activeConv?.id === conv.id ? T.surface2 : 'transparent',
                  color: activeConv?.id === conv.id ? T.text : T.text2,
                  fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                <MessageSquare size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {conv.title || 'New Chat'}
                </span>
              </button>
              <button className="del-btn"
                onClick={(e) => deleteConversation(e, conv.id)}
                style={{
                  position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#ef4444', opacity: isMobile ? 1 : 0, transition: 'opacity 0.15s', padding: 4,
                }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 12px 14px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, color: T.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <button onClick={signOut} title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text3, padding: 4, borderRadius: 6 }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <div style={{
          padding: '10px 12px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 8,
          background: T.bg, flexShrink: 0,
        }}>
          <button onClick={() => setSidebar(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text3, padding: 6, borderRadius: 8, flexShrink: 0 }}
          >
            <Menu size={18} />
          </button>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setModeOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: T.surface2, border: `1px solid ${T.border}`,
                borderRadius: 9, padding: '7px 10px', cursor: 'pointer',
                color: T.text, fontSize: 13, fontWeight: 600,
              }}
            >
              <currentMode.icon size={14} color={currentMode.color} />
              {!narrow && currentMode.label}
              <ChevronDown size={13} color={T.text3} style={{ transition: 'transform 0.2s', transform: modeOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {modeOpen && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, zIndex: 100,
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
                padding: 6, minWidth: 200, boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
              }}>
                {MODES.map(m => (
                  <button key={m.id}
                    onClick={() => { setMode(m.id); setModeOpen(false) }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '9px 12px',
                      background: mode === m.id ? T.surface2 : 'none',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <m.icon size={15} color={m.color} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: T.text3 }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          <button onClick={() => setDark(d => !d)} title="Toggle theme"
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: T.surface2, border: `1px solid ${T.border}`,
              cursor: 'pointer', color: T.text2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }} onClick={() => setModeOpen(false)}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 24, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={32} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 20, color: T.text, marginBottom: 6 }}>
                  Hi, I'm KhawarAI!
                </h2>
                <p style={{ fontSize: 14, color: T.text2, maxWidth: 360 }}>
                  Your intelligent AI assistant. Ask me anything — code help, creative writing, translation, or general questions.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 10, maxWidth: 500, width: '100%' }}>
                {[
                  { text: 'Write a React component for a card UI', mode: 'code' },
                  { text: 'Translate "Hello, how are you?" to Urdu', mode: 'translator' },
                  { text: 'Write a short story about a robot', mode: 'creative' },
                  { text: 'Explain how Supabase works', mode: 'general' },
                ].map((s, i) => (
                  <button key={i}
                    onClick={() => { setInput(s.text); setMode(s.mode); textareaRef.current?.focus() }}
                    style={{
                      padding: '10px 14px', background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 10, fontSize: 13, color: T.text2, cursor: 'pointer',
                      textAlign: 'left', lineHeight: 1.4,
                    }}>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 14px' }}>
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className="msg-enter" style={{
                  display: 'flex', gap: 10, marginBottom: 22,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                    }}>
                      <Bot size={15} color="#fff" />
                    </div>
                  )}

                  <div style={{ maxWidth: msg.role === 'user' ? '82%' : 'calc(100% - 40px)' }}>
                    {msg.role === 'user' ? (
                      <div style={{
                        background: T.userBubble, color: T.userText,
                        padding: '10px 15px', borderRadius: '16px 16px 4px 16px',
                        fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      }}>
                        {msg.content}
                      </div>
                    ) : (
                      <div style={{
                        background: T.aiBubbleBg, border: `1px solid ${T.border}`,
                        padding: '13px 16px', borderRadius: '4px 16px 16px 16px',
                      }}>
                        {msg.id === 'streaming' && msg.content === '' ? (
                          <TypingIndicator T={T} />
                        ) : (
                          <>
                            <MdContent content={msg.content} T={T} />
                            {msg.id === 'streaming' && <span className="cursor" style={{ color: T.accent }}>▌</span>}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div style={{
          padding: '10px 12px 14px', borderTop: `1px solid ${T.border}`,
          background: T.bg, flexShrink: 0,
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-end',
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: '9px 10px',
            }}>
              <textarea
                ref={e => { textareaRef.current = e; inputRef.current = e }}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Message KhawarAI..."
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: T.text, fontSize: 14, resize: 'none', lineHeight: 1.6,
                  maxHeight: 160, overflowY: 'auto', padding: '2px 4px',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading || streaming}
                style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: (!input.trim() || loading || streaming) ? T.surface2 : T.accent,
                  border: 'none', cursor: (!input.trim() || loading || streaming) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {loading || streaming
                  ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={14} />
                }
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: T.text4, marginTop: 6 }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } } .cursor { animation: blink .8s step-end infinite }`}</style>
    </div>
  )
}