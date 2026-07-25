import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(12_000),
  })).min(1).max(40),
})

const SYSTEM_PROMPT = [
  '你是青芽学习健康中心的 AI 助手。',
  '请使用简洁、清晰、温和的中文回答，优先给出可执行的学习与健康建议。',
  '涉及健康问题时说明建议仅供参考；遇到严重或持续症状时，建议用户及时寻求专业医疗帮助。',
].join('')

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      { error: '尚未配置 DeepSeek API Key，请在 .env.local 中填写 DEEPSEEK_API_KEY。' },
      { status: 503 },
    )
  }

  let input: z.infer<typeof chatRequestSchema>
  try {
    input = chatRequestSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: '对话内容格式无效，请刷新页面后重试。' }, { status: 400 })
  }

  const baseUrl = (process.env.DEEPSEEK_BASE_URL?.trim() || 'https://api.deepseek.com').replace(/\/$/, '')
  const model = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat'

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...input.messages,
        ],
        stream: true,
        temperature: 0.7,
      }),
      signal: request.signal,
    })

    if (!upstream.ok) {
      const payload = await upstream.json().catch(() => null) as { error?: { message?: string } } | null
      const message = payload?.error?.message || `DeepSeek 服务请求失败（${upstream.status}）`
      return NextResponse.json({ error: message }, { status: upstream.status })
    }

    if (!upstream.body) {
      return NextResponse.json({ error: 'DeepSeek 服务未返回可读取的响应。' }, { status: 502 })
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: '请求已取消。' }, { status: 499 })
    }
    return NextResponse.json({ error: '暂时无法连接 DeepSeek 服务，请稍后重试。' }, { status: 502 })
  }
}
