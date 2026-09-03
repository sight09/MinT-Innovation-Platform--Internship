'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, X, Send, Sparkles, RotateCcw,
  ChevronDown, Bot, User, ExternalLink, Loader2,
} from 'lucide-react'

interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ title: string; excerpt: string; sourceType: string }>
  createdAt: string
}

const SUGGESTED_PROMPTS = [
  'What does MInT do?',
  'How do I register my startup?',
  'What does the Ethiopian startup proclamation say?',
  'How can I prepare for investors?',
  'How can I improve my readiness score?',
]

// Simple markdown to HTML renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
    .replace(/`(.+?)`/g, '<code class="md-code">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="md-link" target="_blank">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="md-quote">$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to the MInT Innovation Assistant!**

I can help you with:
- Ethiopian startup proclamation and regulations
- MInT programs and resources
- Improving your startup readiness
- Preparing for mentor evaluations and investors
- Platform navigation and features

*How can I assist you today?*`,
        sources: [],
        createdAt: new Date().toISOString(),
      }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return

    const userMsg: AiMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
          mode: 'chat',
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to get response')

      setConversationId(data.conversationId)
      setMessages(prev => [...prev, data.message])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ I encountered an error processing your request. Please try again.',
        createdAt: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function clearConversation() {
    setMessages([])
    setConversationId(undefined)
    setShowSuggestions(true)
  }

  return (
    <>
      <style>{`
        .md-h1 { font-size: 1.25rem; font-weight: 700; margin: 8px 0 4px; }
        .md-h2 { font-size: 1.1rem; font-weight: 700; margin: 8px 0 4px; color: #006B6B; }
        .md-h3 { font-size: 1rem; font-weight: 600; margin: 6px 0 2px; }
        .md-code { background: rgba(0,107,107,0.08); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 0.85em; color: #006B6B; }
        .md-link { color: #006B6B; text-decoration: underline; }
        .md-quote { border-left: 3px solid rgba(212,137,26,0.4); padding-left: 8px; color: #607D9A; font-style: italic; margin: 4px 0; }
        .chat-message-content ul { padding-left: 16px; }
        .chat-message-content li { margin: 2px 0; }
        .chat-message-content strong { color: #0F5567; font-weight: 700; }
        .chat-message-content em { color: #607D9A; }
        .chat-message-content p { margin: 4px 0; color: #2C4A6B; }
        .chat-message-content table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 0.8rem; }
        .chat-message-content th, .chat-message-content td { border: 1px solid #D8E4EE; padding: 4px 8px; text-align: left; }
        .chat-message-content th { background: rgba(0,107,107,0.08); color: #006B6B; }
      `}</style>

      {/* Floating Action Button */}
      <motion.button
        className="chat-fab"
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
        id="ai-chat-fab"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} color="white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles size={22} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && messages.length === 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, width: 12, height: 12,
            background: '#4ADE80', borderRadius: '50%',
            border: '2px solid var(--surface-base)',
          }} />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--surface-border)',
              background: 'linear-gradient(135deg, #0F5567 0%, #006B6B 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #006B6B, #0F5567)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={16} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>
                    MInT Innovation Assistant
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#4DD9E0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                    AI-Powered · RAG-Enhanced
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {messages.length > 1 && (
                  <button onClick={clearConversation} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} title="Clear conversation">
                    <RotateCcw size={14} />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: 8, alignItems: 'flex-start',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'user'
                      ? 'rgba(245,166,35,0.2)'
                      : 'linear-gradient(135deg, #1B4F9B, #2563EB)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 2,
                  }}>
                    {msg.role === 'user' ? <User size={12} color="#FBBF24" /> : <Bot size={12} color="white" />}
                  </div>

                  {/* Bubble */}
                  <div style={{
                    maxWidth: '82%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(13,43,78,0.12), rgba(0,107,107,0.10))'
                      : 'var(--surface-card)',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '8px 12px',
                    border: '1px solid var(--surface-border)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    color: 'var(--text-primary)',
                  }}>
                    <div
                      className="chat-message-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--surface-border)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={10} />
                          Sources
                        </div>
                        {msg.sources.map((src, i) => (
                          <div key={i} style={{
                            background: 'rgba(0,107,107,0.08)',
                            border: '1px solid rgba(0,107,107,0.20)',
                            borderRadius: 6, padding: '4px 8px',
                            marginTop: 4, fontSize: '0.7rem',
                          }}>
                            <div style={{ color: '#006B6B', fontWeight: 600 }}>{src.title}</div>
                            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{src.excerpt}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1B4F9B, #2563EB)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bot size={12} color="white" />
                  </div>
                  <div style={{
                    background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
                    borderRadius: '4px 16px 16px 16px', padding: '10px 14px',
                    display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <motion.span key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#006B6B', display: 'block',
                      }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested prompts */}
              {showSuggestions && messages.length <= 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      style={{
                        background: 'rgba(0,107,107,0.08)',
                        border: '1px solid rgba(0,107,107,0.20)',
                        borderRadius: 20, padding: '4px 10px',
                        fontSize: '0.7rem', color: '#006B6B',
                        cursor: 'pointer', transition: 'all 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,107,107,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,107,107,0.08)')}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--surface-border)',
              background: 'var(--surface-elevated)',
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about MInT, startups, proclamation..."
                  rows={1}
                  style={{
                    flex: 1, background: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 10, padding: '8px 12px',
                    color: 'var(--text-primary)', fontSize: '0.8125rem',
                    resize: 'none', outline: 'none', fontFamily: 'inherit',
                    lineHeight: 1.4, maxHeight: 80, overflowY: 'auto',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#006B6B')}
                  onBlur={e => (e.target.style.borderColor = 'var(--surface-border)')}
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="btn btn-primary"
                  style={{ padding: '8px 12px', borderRadius: 10, flexShrink: 0 }}
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                AI-assisted · Not official legal advice · Powered by MInT RAG
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
