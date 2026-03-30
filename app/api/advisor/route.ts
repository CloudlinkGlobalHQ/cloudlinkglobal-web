import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@clerk/nextjs/server'

export const runtime = 'nodejs'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const BACKEND = process.env.CLOUDLINK_API_URL || 'https://cloudlink-agents-production.up.railway.app'

async function fetchContext(token: string) {
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const safe = async (path: string) => {
    try {
      const r = await fetch(`${BACKEND}${path}`, { headers: h, next: { revalidate: 0 } })
      if (!r.ok) return null
      return r.json()
    } catch {
      return null
    }
  }

  const [stats, resources, regressions, costSummary, autostopSavings, rightsizing] = await Promise.all([
    safe('/stats'),
    safe('/resources'),
    safe('/regressions?status=open'),
    safe('/cost-summary'),
    safe('/autostop/savings'),
    safe('/rightsizing?cpu_threshold=20'),
  ])

  return { stats, resources, regressions, costSummary, autostopSavings, rightsizing }
}

function buildSystemPrompt(ctx: Awaited<ReturnType<typeof fetchContext>>) {
  const lines: string[] = [
    'You are the Cloudlink AI Advisor — a concise, expert cloud cost analyst embedded in the Cloudlink dashboard.',
    'You have real-time access to this user\'s actual cloud data. Answer questions directly and specifically.',
    'Be concise, use markdown formatting (bold for emphasis, backticks for resource names, bullet lists).',
    'Never make up numbers — only reference figures from the data provided below.',
    'If the data doesn\'t contain enough information to answer, say so honestly.',
    '',
    '--- LIVE CLOUD DATA ---',
  ]

  if (ctx.stats) {
    lines.push(`\nACCOUNT STATS: ${JSON.stringify(ctx.stats, null, 2)}`)
  }

  if (ctx.costSummary) {
    lines.push(`\nCOST SUMMARY: ${JSON.stringify(ctx.costSummary, null, 2)}`)
  }

  if (ctx.regressions && Array.isArray(ctx.regressions)) {
    const open = ctx.regressions.slice(0, 10)
    if (open.length > 0) {
      lines.push(`\nOPEN COST REGRESSIONS (${open.length}): ${JSON.stringify(open, null, 2)}`)
    } else {
      lines.push('\nOPEN COST REGRESSIONS: None currently detected.')
    }
  }

  if (ctx.resources && Array.isArray(ctx.resources)) {
    const wasteful = ctx.resources
      .filter((r: Record<string, unknown>) => r.estimated_monthly_waste && (r.estimated_monthly_waste as number) > 0)
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((b.estimated_monthly_waste as number) || 0) - ((a.estimated_monthly_waste as number) || 0))
      .slice(0, 15)
    if (wasteful.length > 0) {
      lines.push(`\nTOP WASTEFUL RESOURCES: ${JSON.stringify(wasteful, null, 2)}`)
    }
    lines.push(`\nTOTAL RESOURCES SCANNED: ${ctx.resources.length}`)
  }

  if (ctx.autostopSavings) {
    lines.push(`\nAUTOSTOP SAVINGS TO DATE: ${JSON.stringify(ctx.autostopSavings, null, 2)}`)
  }

  if (ctx.rightsizing && Array.isArray(ctx.rightsizing)) {
    const top = ctx.rightsizing.slice(0, 8)
    if (top.length > 0) {
      lines.push(`\nRIGHTSIZING OPPORTUNITIES: ${JSON.stringify(top, null, 2)}`)
    }
  }

  lines.push('\n--- END DATA ---')
  lines.push('\nRespond in markdown. Be specific, reference actual resource names and dollar figures from the data above.')

  return lines.join('\n')
}

export async function POST(req: NextRequest) {
  // Get Clerk auth token
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('AI Advisor not configured (missing ANTHROPIC_API_KEY)', { status: 503 })
  }

  const body = await req.json()
  const { messages = [] } = body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  }

  if (!messages.length) {
    return new Response('No messages provided', { status: 400 })
  }

  // Fetch live cloud context
  const ctx = await fetchContext(token)
  const systemPrompt = buildSystemPrompt(ctx)

  // Create streaming response
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  ;(async () => {
    try {
      const anthropicStream = await client.messages.stream({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      for await (const chunk of anthropicStream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          await writer.write(encoder.encode(chunk.delta.text))
        }
      }
    } catch (err) {
      let msg = 'Something went wrong. Please try again.'
      if (err instanceof Error) {
        const raw = err.message
        if (raw.includes('credit balance is too low') || raw.includes('insufficient_quota') || raw.includes('billing')) {
          msg = 'The AI Advisor is temporarily unavailable — the Anthropic account needs credits. Please top up at console.anthropic.com/billing.'
        } else if (raw.includes('invalid_api_key') || raw.includes('authentication')) {
          msg = 'AI Advisor configuration error — invalid API key.'
        } else if (raw.includes('rate_limit')) {
          msg = 'Too many requests — please wait a moment and try again.'
        } else if (raw.includes('overloaded')) {
          msg = 'The AI is currently overloaded. Please try again in a few seconds.'
        }
      }
      await writer.write(encoder.encode(msg))
    } finally {
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
