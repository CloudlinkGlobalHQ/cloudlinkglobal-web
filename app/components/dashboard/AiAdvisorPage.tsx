/* eslint-disable react-hooks/purity */
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, MessageSquare, Clock, ChevronRight, Bot, User } from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "What caused last week's Lambda spike?",
  "Which services are trending up?",
  "Show my top 5 wasteful resources",
  "What if I stopped these 3 EC2s?",
]

const PAST_CONVERSATIONS = [
  {
    id: '1',
    title: 'Lambda cost spike analysis',
    preview: 'The spike on Mar 14 was caused by...',
    time: '2h ago',
  },
  {
    id: '2',
    title: 'EC2 rightsizing recommendations',
    preview: 'Based on your usage patterns, I recommend...',
    time: '1d ago',
  },
  {
    id: '3',
    title: 'Monthly savings opportunity review',
    preview: 'You have $4,200 in unrealized savings...',
    time: '3d ago',
  },
]

const AI_RESPONSES: Record<string, string> = {
  "What caused last week's Lambda spike?": `**Lambda Spike — Week of Mar 17–21**

I detected a **+340% cost increase** in your \`us-east-1\` Lambda functions between Mar 17–21, totalling an additional **$2,840** above baseline.

**Root cause analysis:**

1. **\`payments-processor\` function** — Invocation count jumped from ~12k/day to ~51k/day. This correlates with deploy \`a3f9b2\` on Mar 17 at 14:32 UTC. The new code introduced a retry loop that was calling itself recursively on timeout errors.

2. **\`data-sync-worker\` function** — Duration increased from avg 820ms to 4.2s per invocation. A new DynamoDB scan pattern in the same deploy was doing full table scans instead of indexed queries.

**Impact:** $2,840 above baseline over 5 days (~$17,000/mo annualized if not fixed)

**Recommended actions:**
- Roll back or patch deploy \`a3f9b2\` retry logic
- Add DynamoDB GSI on the \`tenant_id\` field
- Set concurrency limit on \`payments-processor\` as a safety net

Want me to create a Cloudlink action to apply the concurrency limit automatically?`,

  "Which services are trending up?": `**Services Trending Up — Last 30 Days**

Based on your cost data, here are the services with accelerating spend:

| Service | 30d Trend | MoM Change | Projected Impact |
|---------|-----------|------------|-----------------|
| EC2 | ↑ Strong | +18% | +$11,200/mo |
| Lambda | ↑ Moderate | +34% | +$6,400/mo |
| RDS | ↑ Mild | +8% | +$2,200/mo |
| Data Transfer | ↑ Mild | +12% | +$1,100/mo |

**Key observations:**

- **EC2** growth is driven by 3 new \`m5.2xlarge\` instances in your \`prod-us-east\` cluster, added Mar 10. These have <20% average CPU utilization — classic over-provisioning.

- **Lambda** spike (see previous analysis) is now resolving after the deploy patch on Mar 22.

- **RDS** growth appears legitimate — it tracks closely with your user growth metrics. I'd recommend scheduling a read replica for query offloading if this continues.

**Action:** I can set up budget alerts for EC2 and Lambda with a 15% threshold. Should I?`,

  "Show my top 5 wasteful resources": `**Top 5 Wasteful Resources — Current**

Here are your highest-waste resources ranked by recoverable spend:

**1. \`prod-ml-training-01\` (EC2 \`p3.8xlarge\`)**
Running 24/7 · avg 3% GPU utilization · $4,320/mo
→ *Recommendation: AutoStop outside business hours. Save ~$3,100/mo*

**2. \`analytics-rds-replica-2\` (RDS \`db.r5.2xlarge\`)**
Zero queries in 14 days · $1,840/mo
→ *Recommendation: Snapshot and terminate. Save $1,840/mo*

**3. \`staging-api-cluster\` (EKS, 6 nodes)**
<5% traffic, running 24/7 · $1,200/mo
→ *Recommendation: Scale down to 2 nodes overnight. Save ~$800/mo*

**4. \`data-pipeline-dev\` (EC2 \`c5.4xlarge\`)**
Only used Tue/Thu · $680/mo
→ *Recommendation: Schedule via AutoStop. Save ~$490/mo*

**5. \`cloudfront-legacy-dist\` (CloudFront)**
Serving 0 requests for 30+ days · $340/mo
→ *Recommendation: Disable or delete. Save $340/mo*

**Total recoverable: ~$6,570/mo** ($78,840/yr)

Want me to create AutoStop rules for items 1, 3, and 4 automatically?`,

  "What if I stopped these 3 EC2s?": `**Scenario Analysis — Stop 3 EC2 Instances**

I'll model the impact of stopping \`prod-ml-training-01\`, \`staging-api-01\`, and \`dev-env-payments\`:

**Cost savings:**
- Immediate savings: **$187/day** ($5,610/mo)
- Annualized: **$67,340/yr**

**Risk assessment:**

| Instance | Risk | Notes |
|----------|------|-------|
| \`prod-ml-training-01\` | 🟡 Medium | Training jobs would queue. Restart time ~4min |
| \`staging-api-01\` | 🟢 Low | No production traffic. Staging team notified |
| \`dev-env-payments\` | 🟢 Low | Dev hours only. AutoStop already recommended |

**Recommended approach:**

Instead of a hard stop, I'd suggest using **Cloudlink AutoStop** to intelligently stop these only when idle:

- \`prod-ml-training-01\`: Stop when no GPU activity for 30min
- \`staging-api-01\`: Stop outside 9am–7pm Mon–Fri
- \`dev-env-payments\`: Stop when no SSH sessions active

This would capture **~82% of the savings** ($4,600/mo) with near-zero operational risk.

**Want me to create these 3 AutoStop rules now?**`,
}

const DEFAULT_AI_RESPONSE = `I've analyzed your cloud infrastructure and here's what I found:

Your current cloud spend is **$142,840/month** with a 30-day trend showing moderate growth. Based on your resource utilization patterns, I've identified several optimization opportunities totaling approximately **$18,200/month** in potential savings.

The most impactful areas are:
- **EC2 over-provisioning** in your \`prod\` cluster (~$4,200/mo)
- **Idle RDS replicas** that can be safely terminated (~$1,840/mo)
- **Lambda function inefficiencies** causing recursive invocations (~$2,840/mo)

Would you like me to drill down into any of these areas, or would you prefer a full optimization report?`

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'ai'
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
    line = line.replace(/`([^`]+)`/g, '<code class="bg-[#4F6EF7]/10 text-[#4F6EF7] px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')

    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-semibold text-[#F1F5F9] mt-3 first:mt-0" dangerouslySetInnerHTML={{ __html: line }} />
    }
    if (line.startsWith('| ')) {
      return (
        <div key={i} className="font-mono text-xs text-[#94A3B8] border-b border-[#1E2D4F]/50 py-1"
          dangerouslySetInnerHTML={{ __html: line }} />
      )
    }
    if (line.startsWith('- ') || line.startsWith('→ ')) {
      return (
        <p key={i} className="pl-3 border-l-2 border-[#4F6EF7]/30 my-1 text-[#94A3B8]"
          dangerouslySetInnerHTML={{ __html: line }} />
      )
    }
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1
      const text = line.replace(/^#+\s/, '')
      const sizes = ['text-base', 'text-sm', 'text-xs']
      return (
        <p key={i} className={`${sizes[level - 1] || 'text-xs'} font-bold text-[#F1F5F9] mt-3 first:mt-0`}
          dangerouslySetInnerHTML={{ __html: text }} />
      )
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return (
      <p key={i} className="text-[#94A3B8] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: line }} />
    )
  })
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AiAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

   
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = AI_RESPONSES[text.trim()] || DEFAULT_AI_RESPONSE
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 800)
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

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[600px] gap-0 rounded-xl overflow-hidden border border-[#1E2D4F]" style={{ backgroundColor: '#0A0E1A' }}>

      {/* Left sidebar — conversation history */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-[#0F1629] border-r border-[#1E2D4F]">
        <div className="p-4 border-b border-[#1E2D4F]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#4F6EF7]/20 flex items-center justify-center">
              <Sparkles size={12} className="text-[#4F6EF7]" />
            </div>
            <span className="text-sm font-semibold text-[#F1F5F9]">AI Advisor</span>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={() => { setMessages([]); setActiveConv(null) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#4F6EF7] bg-[#4F6EF7]/10 border border-[#4F6EF7]/20 rounded-lg hover:bg-[#4F6EF7]/20 transition"
          >
            <MessageSquare size={12} />
            New conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#3D5070] mb-2 px-1">Recent</p>
          <div className="space-y-1">
            {PAST_CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={[
                  'w-full text-left px-3 py-2.5 rounded-lg transition group',
                  activeConv === conv.id
                    ? 'bg-[#1E2D4F] border border-[#2E3D5F]'
                    : 'hover:bg-[#1E2D4F]/50',
                ].join(' ')}
              >
                <p className="text-xs font-medium text-[#94A3B8] group-hover:text-[#F1F5F9] truncate transition leading-tight">
                  {conv.title}
                </p>
                <p className="text-[10px] text-[#3D5070] mt-0.5 truncate">{conv.preview}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={9} className="text-[#3D5070]" />
                  <span className="text-[10px] text-[#3D5070]">{conv.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1E2D4F] bg-[#0F1629] flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F6EF7] to-[#7C3AED] flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F1F5F9]">Cloudlink AI Advisor</p>
            <p className="text-[10px] text-[#10B981] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full inline-block" />
              Analyzing your cloud data in real-time
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4F6EF7]/20 to-[#7C3AED]/20 border border-[#4F6EF7]/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-[#4F6EF7]" />
              </div>
              <h2 className="text-base font-semibold text-[#F1F5F9] mb-1">Ask me anything about your cloud</h2>
              <p className="text-xs text-[#64748B] mb-6 max-w-xs">
                I have full visibility into your AWS spend, regressions, resources, and optimization opportunities.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-3 py-2 text-xs font-medium text-[#94A3B8] bg-[#141C33] border border-[#1E2D4F] rounded-lg hover:bg-[#1E2D4F] hover:text-[#F1F5F9] hover:border-[#2E3D5F] transition flex items-center gap-1.5 group"
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
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F6EF7] to-[#7C3AED] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} className="text-white" />
                  </div>
                )}

                <div className={[
                  'max-w-[75%] rounded-xl px-4 py-3 text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#4F6EF7]/20 border border-[#4F6EF7]/30 text-[#CBD5E1]'
                    : 'bg-transparent border border-[#1E2D4F] text-[#94A3B8]',
                ].join(' ')}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="space-y-1">{renderMarkdown(msg.content)}</div>
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

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F6EF7] to-[#7C3AED] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={13} className="text-white" />
              </div>
              <div className="bg-transparent border border-[#1E2D4F] rounded-xl px-4 py-3 flex items-center gap-1.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-[#4F6EF7] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, delay, repeat: Infinity }}
                  />
                ))}
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
                  className="px-2.5 py-1 text-[10px] font-medium text-[#64748B] bg-[#0A0E1A] border border-[#1E2D4F] rounded-lg hover:text-[#94A3B8] hover:border-[#2E3D5F] transition"
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
                className="w-full bg-[#141C33] border border-[#1E2D4F] rounded-xl px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#3D5070] focus:outline-none focus:border-[#4F6EF7]/50 transition resize-none"
                style={{ minHeight: 44, maxHeight: 120 }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4F6EF7] text-white hover:bg-[#6B84F8] transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
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
