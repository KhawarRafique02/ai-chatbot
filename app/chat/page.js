'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Bot, Plus, Send, Trash2, LogOut, Menu, X,
  Copy, Check, ChevronDown, Loader2,
  Code2, Pencil, Languages, Sparkles, MessageSquare
} from 'lucide-react'

// ── Modes ──────────────────────────────────────────────────────────────────
const MODES = [
  { id: 'general',    label: 'General',    icon: Sparkles,     color: '#8B5CF6', desc: 'General AI assistant' },
  { id: 'code',       label: 'Code',       icon: Code2,        color: '#06B6D4', desc: 'Code & debugging help' },
  { id: 'creative',   label: 'Creative',   icon: Pencil,       color: '#F59E0B', desc: 'Writing & creative' },
  { id: 'translator', label: 'Translate',  icon: Languages,    color: '#10B981', desc: 'English ↔ Urdu/Hindi' },
]

// ── Copy Button ─────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{
      position: 'absolute', top: 8, right: 8,
      background: '#2d2d3d', border: 'none', borderRadius: 6,
      padding: '4px 8px', color: '#94a3b8', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
    }}>
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  )
}

// ── Markdown Renderer ───────────────────────────────────────────────────────
function MdContent({ content }) {
  return (
    <div className="prose">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const code  = String(children).replace(/\n$/, '')
            if (!inline && match) {
              return (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    background: '#1e1e2e', borderRadius: '10px 10px 0 0',
                    padding: '6px 14px', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', borderBottom: '1px solid #2d2d3d',
                  }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{match[1]}</span>
                    <CopyBtn text={code} />
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
            return <code className={className} {...props}>{children}</code>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ── Typing Indicator ────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '8px 0' }}>
      {[0,1,2].map(i => (
        <span key={i} className="typing-dot" style={{
          width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6', display: 'block',
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  )
}

// ── Main Chat Page ──────────────────────────────────────────────────────────
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
  const [sidebarOpen, setSidebar]   = useState(true)
  const [modeOpen, setModeOpen]     = useState(false)

  const currentMode = MODES.find(m => m.id === mode)

  // ── Auth check ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/')
      else setUser(data.session.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.replace('/')
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // ── Load conversations ──
  useEffect(() => {
    if (!user) return
    loadConversations()
  }, [user])

  // ── Scroll to bottom ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  // ── Auto-resize textarea ──
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
    inputRef.current?.focus()
  }

  const newChat = () => {
    setActiveConv(null)
    setMessages([])
    setInput('')
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
    router.replace('/')
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading || streaming) return
    setInput('')
    setLoading(true)

    // Create conversation if needed
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

    // Save user message
    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, role: 'user', content: text })
      .select()
      .single()

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(false)
    setStreaming(true)

    // Placeholder for streaming
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

      // Replace placeholder with real message
      await loadMessages(convId)
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

  // ── Styles ──
  const S = {
    sidebar: {
      width: sidebarOpen ? 260 : 0,
      minWidth: sidebarOpen ? 260 : 0,
      background: '#0a0a11',
      borderRight: '1px solid #1e1e2e',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.25s ease, min-width 0.25s ease',
    },
    convBtn: (active) => ({
      width: '100%', textAlign: 'left', padding: '10px 12px',
      borderRadius: 8, cursor: 'pointer', border: 'none',
      background: active ? '#1a1a27' : 'transparent',
      color: active ? '#f1f5f9' : '#94a3b8',
      fontSize: 13, transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', gap: 8,
    }),
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#0d0d14' }}>

      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar}>
        <div style={{ padding: '12px 12px 8px', flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Bot size={17} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>KhawarAI</span>
          </div>

          {/* New Chat */}
          <button onClick={newChat} style={{
            width: '100%', padding: '9px 14px', borderRadius: 9,
            background: '#8B5CF6', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#7C3AED'}
            onMouseLeave={e => e.currentTarget.style.background = '#8B5CF6'}
          >
            <Plus size={15} /> New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {conversations.length === 0 && (
            <p style={{ fontSize: 12, color: '#334155', textAlign: 'center', padding: '20px 8px' }}>
              No conversations yet
            </p>
          )}
          {conversations.map(conv => (
            <div key={conv.id}
              style={{ position: 'relative', marginBottom: 2 }}
              onMouseEnter={e => e.currentTarget.querySelector('.del-btn').style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.querySelector('.del-btn').style.opacity = '0'}
            >
              <button onClick={() => selectConversation(conv)}
                style={S.convBtn(activeConv?.id === conv.id)}>
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
                  color: '#ef4444', opacity: 0, transition: 'opacity 0.15s', padding: 4,
                }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* User & logout */}
        <div style={{ padding: '8px 12px 14px', borderTop: '1px solid #1e1e2e', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <button onClick={signOut} title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid #1e1e2e',
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#0d0d14', flexShrink: 0,
        }}>
          <button onClick={() => setSidebar(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6, borderRadius: 8 }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Mode selector */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setModeOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#1a1a27', border: '1px solid #2d2d3d',
                borderRadius: 9, padding: '7px 12px', cursor: 'pointer',
                color: '#f1f5f9', fontSize: 13, fontWeight: 600,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#8B5CF6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2d2d3d'}
            >
              <currentMode.icon size={14} color={currentMode.color} />
              {currentMode.label}
              <ChevronDown size={13} color="#64748b" style={{ transition: 'transform 0.2s', transform: modeOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {modeOpen && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, zIndex: 100,
                background: '#111118', border: '1px solid #2d2d3d', borderRadius: 12,
                padding: 6, minWidth: 200, boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              }}>
                {MODES.map(m => (
                  <button key={m.id}
                    onClick={() => { setMode(m.id); setModeOpen(false) }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '9px 12px',
                      background: mode === m.id ? '#1a1a27' : 'none',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a1a27'}
                    onMouseLeave={e => e.currentTarget.style.background = mode === m.id ? '#1a1a27' : 'none'}
                  >
                    <m.icon size={15} color={m.color} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: '#334155' }}>Powered by Gemini</span>
        </div>

        {/* Messages */}
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
                <h2 style={{ fontWeight: 800, fontSize: 20, color: '#f1f5f9', marginBottom: 6 }}>
                  Hi, I'm KhawarAI!
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', maxWidth: 360 }}>
                  Your intelligent AI assistant. Ask me anything — code help, creative writing, translation, or general questions.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, maxWidth: 500, width: '100%' }}>
                {[
                  { text: 'Write a React component for a card UI', mode: 'code' },
                  { text: 'Translate "Hello, how are you?" to Urdu', mode: 'translator' },
                  { text: 'Write a short story about a robot', mode: 'creative' },
                  { text: 'Explain how Supabase works', mode: 'general' },
                ].map((s, i) => (
                  <button key={i}
                    onClick={() => { setInput(s.text); setMode(s.mode); textareaRef.current?.focus() }}
                    style={{
                      padding: '10px 14px', background: '#111118', border: '1px solid #1e1e2e',
                      borderRadius: 10, fontSize: 13, color: '#94a3b8', cursor: 'pointer',
                      textAlign: 'left', lineHeight: 1.4, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#f1f5f9' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8' }}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px' }}>
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className="msg-enter" style={{
                  display: 'flex', gap: 12, marginBottom: 24,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                    }}>
                      <Bot size={16} color="#fff" />
                    </div>
                  )}

                  <div style={{ maxWidth: msg.role === 'user' ? '75%' : '100%' }}>
                    {msg.role === 'user' ? (
                      <div style={{
                        background: '#8B5CF6', color: '#fff',
                        padding: '10px 16px', borderRadius: '16px 16px 4px 16px',
                        fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      }}>
                        {msg.content}
                      </div>
                    ) : (
                      <div style={{
                        background: '#111118', border: '1px solid #1e1e2e',
                        padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
                        fontSize: 14,
                      }}>
                        {msg.id === 'streaming' && msg.content === '' ? (
                          <TypingIndicator />
                        ) : (
                          <>
                            <MdContent content={msg.content} />
                            {msg.id === 'streaming' && <span className="cursor" style={{ color: '#8B5CF6' }}>▌</span>}
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

        {/* Input area */}
        <div style={{
          padding: '12px 16px 16px', borderTop: '1px solid #1e1e2e',
          background: '#0d0d14', flexShrink: 0,
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-end',
              background: '#111118', border: '1px solid #2d2d3d',
              borderRadius: 14, padding: '10px 12px',
              transition: 'border-color 0.2s',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = '#8B5CF6'}
              onBlurCapture={e => e.currentTarget.style.borderColor = '#2d2d3d'}
            >
              <textarea
                ref={e => { textareaRef.current = e; inputRef.current = e }}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={`Message KhawarAI (${currentMode.label} mode)...`}
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#f1f5f9', fontSize: 14, resize: 'none', lineHeight: 1.6,
                  maxHeight: 160, overflowY: 'auto', padding: '2px 0',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading || streaming}
                style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: (!input.trim() || loading || streaming) ? '#1a1a27' : '#8B5CF6',
                  border: 'none', cursor: (!input.trim() || loading || streaming) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s', color: '#fff',
                }}
              >
                {loading || streaming
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={15} />
                }
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#1e293b', marginTop: 8 }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
