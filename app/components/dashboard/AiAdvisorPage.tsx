'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, MessageSquare, Clock, ChevronRight, Bot, User, AlertCircle } from 'lucide-react'

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "What's driving my cloud costs right now?",
  "Show me my most wasteful resources",
  "Are there any open cost regressions?",
  "What rightsizing opportunities do I have?",
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#F1F5F9] font-semibold">$1</strong>')
    // Inline code
    line = line.replace(/`([^`]+)`/g, '<code class="bg-[#10B981]/10 text-[#6EE7B7] px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')

    if (line.startsWith('| ')) {
      return (
        <div key={i} className="font-mono text-xs text-[#94A3B8] border-b border-[#1E2D4F]/50 py-1"
          dangerouslySetInnerHTML={{ __html: line }} />
      )
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <p key={i} className="pl-3 border-l-2 border-[#10B981]/30 my-1 text-[#94A3B8]"
          dangerouslySetInnerHTML={{ __html: line.replace(/^[-*]\s/, '') }} />
      )
    }
    if (line.startsWith('→ ')) {
      return (
        <p key={i} className="pl-3 border-l-2 border-[#10B981]/30 my-1 text-[#94A3B8] italic"
          dangerouslySetInnerHTML={{ __html: line }} />
      )
    }
    if (line.match(/^\d+\.\s/)) {
      return (
        <p key={i} className="pl-3 my-1 text-[#94A3B8]"
          dangerouslySetInnerHTML={{ __html: line }} />
      )
    }
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1
      const content = line.replace(/^#+\s/, '')
      const sizes = ['text-base', 'text-sm', 'text-xs']
      return (
        <p key={i} className={`${sizes[level - 1] || 'text-xs'} font-bold text-[#F1F5F9] mt-3 first:mt-0`}
          dangerouslySetInnerHTML={{ __html: content }} />
      )
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return (
      <p key={i} className="text-[#94A3B8] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: line }} />
    )
  })
}

// ─── Streaming cursor ─────────────────────────────────────────────────────────

function StreamingCursor() {
  return (
    <motion.span
      className="inline-block w-1.5 h-3.5 bg-[#10B981] rounded-sm ml-0.5 align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AiAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return
    setError(null)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    // Placeholder AI message to stream into
    const aiId = (Date.now() + 1).toString()
    const aiMsg: Message = {
      id: aiId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiMsg])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `HTTP ${res.status}`)
      }

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const snap = accumulated
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: snap } : m))
        )
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      // Remove the empty AI placeholder on error
      setMessages((prev) => prev.filter((m) => m.id !== aiId))
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const startNew = () => {
    if (isStreaming) abortRef.current?.abort()
    setMessages([])
    setError(null)
    setInput('')
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[600px] gap-0 rounded-xl overflow-hidden border border-[#1E2D4F]" style={{ backgroundColor: '#0A0E1A' }}>

      {/* Left sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-[#0F1629] border-r border-[#1E2D4F]">
        <div className="p-4 border-b border-[#1E2D4F]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#10B981]/20 flex items-center justify-center">
              <Sparkles size={12} className="text-[#10B981]" />
            </div>
            <span className="text-sm font-semibold text-[#F1F5F9]">AI Advisor</span>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={startNew}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg hover:bg-[#10B981]/15 transition"
          >
            <MessageSquare size={12} />
            New conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#3D5070] mb-2 px-1">This session</p>
          {messages.filter((m) => m.role === 'user').slice(0, 6).map((m) => (
            <div key={m.id} className="px-3 py-2.5 rounded-lg mb-1 bg-[#1E2D4F]/30">
              <p className="text-xs text-[#94A3B8] truncate leading-tight">{m.content}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={9} className="text-[#3D5070]" />
                <span className="text-[10px] text-[#3D5070]">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isEmpty && (
            <p className="text-[10px] text-[#3D5070] px-1">No messages yet</p>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1E2D4F] bg-[#0F1629] flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F1F5F9]">Cloudlink AI Advisor</p>
            <p className="text-[10px] flex items-center gap-1">
              {isStreaming ? (
                <span className="text-[#10B981] flex items-center gap-1">
                  <motion.span
                    className="w-1.5 h-1.5 bg-[#10B981] rounded-full inline-block"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Thinking…
                </span>
              ) : (
                <span className="text-[#10B981] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full inline-block" />
                  Connected to your live cloud data
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#10B981]/20 bg-gradient-to-br from-[#10B981]/15 to-[#059669]/15">
                <Sparkles size={24} className="text-[#10B981]" />
              </div>
              <h2 className="text-base font-semibold text-[#F1F5F9] mb-1">Ask me anything about your cloud</h2>
              <p className="text-xs text-[#64748B] mb-6 max-w-xs">
                I have live access to your actual spend, resources, regressions, and rightsizing data.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="group flex items-center gap-1.5 rounded-lg border border-[#1E2D4F] bg-[#141C33] px-3 py-2 text-xs font-medium text-[#94A3B8] transition hover:border-[#10B981]/30 hover:bg-[#141C33] hover:text-[#F1F5F9]"
                  >
                    <span>{prompt}</span>
                    <ChevronRight size={10} className="text-[#3D5070] group-hover:text-[#64748B] transition" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669]">
                    <Bot size={13} className="text-white" />
                  </div>
                )}

                <div className={[
                  'max-w-[75%] rounded-xl px-4 py-3 text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'border border-[#10B981]/25 bg-[#10B981]/10 text-[#E2E8F0]'
                    : 'bg-transparent border border-[#1E2D4F] text-[#94A3B8]',
                ].join(' ')}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="space-y-1">
                      {msg.content
                        ? renderMarkdown(msg.content)
                        : <span className="text-[#3D5070] italic">Thinking…</span>
                      }
                      {isStreaming && msg.id === messages[messages.length - 1]?.id && msg.content && (
                        <StreamingCursor />
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-[#3D5070] mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[#1E2D4F] border border-[#2E3D5F] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={13} className="text-[#64748B]" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400"
            >
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-red-400/80 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[#1E2D4F] bg-[#0F1629]">
          {!isEmpty && (
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_PROMPTS.slice(0, 2).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={isStreaming}
                  className="px-2.5 py-1 text-[10px] font-medium text-[#64748B] bg-[#0A0E1A] border border-[#1E2D4F] rounded-lg hover:text-[#94A3B8] hover:border-[#2E3D5F] transition disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your cloud costs, regressions, resources..."
                rows={1}
                disabled={isStreaming}
                className="w-full resize-none rounded-xl border border-[#1E2D4F] bg-[#141C33] px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#3D5070] transition focus:border-[#10B981]/50 focus:outline-none disabled:opacity-60"
                style={{ minHeight: 44, maxHeight: 120 }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
          <p className="text-[10px] text-[#3D5070] mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
