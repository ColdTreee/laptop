'use client'

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bot, Send, Sparkles, Square, Trash2, UserRound, X } from 'lucide-react'
import { MarkdownMessage } from '../ui/MarkdownMessage'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '你好，我是青芽 AI 助手。今天想一起解决什么问题？',
}

const SUGGESTED_PROMPTS = [
  '帮我制定今晚的学习计划',
  '如何缓解长时间用眼疲劳？',
  '帮我复盘今天的学习状态',
]

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content }
}

export function AiChatPopover() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [draft, setDraft] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const chatPanelRef = useRef<HTMLElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesViewportRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!containerRef.current?.contains(target) && !chatPanelRef.current?.contains(target)) setOpen(false)
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key !== 'Tab' || !chatPanelRef.current) return

      const focusable = Array.from(chatPanelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.hasAttribute('hidden'))
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('ai-chat-open')
    window.setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 0)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('ai-chat-open')
    }
  }, [open])

  useEffect(() => {
    const viewport = messagesViewportRef.current
    if (open && viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => () => abortControllerRef.current?.abort(), [])

  const resetConversation = () => {
    abortControllerRef.current?.abort()
    setMessages([WELCOME_MESSAGE])
    setDraft('')
    setError('')
    setIsStreaming(false)
    textareaRef.current?.focus({ preventScroll: true })
  }

  const stopStreaming = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsStreaming(false)
  }

  const sendMessage = async (suggestedPrompt?: string) => {
    const content = (suggestedPrompt ?? draft).trim()
    if (!content || isStreaming) return

    const userMessage = createMessage('user', content)
    const assistantMessage = createMessage('assistant', '')
    const conversation = [...messages, userMessage]
    const controller = new AbortController()

    setDraft('')
    setError('')
    setIsStreaming(true)
    setMessages([...conversation, assistantMessage])
    abortControllerRef.current = controller

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversation.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error || `请求失败（${response.status}）`)
      }
      if (!response.body) throw new Error('服务未返回可读取的响应。')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let answer = ''

      while (true) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value, { stream: !done })
        const eventParts = buffer.split(/\r?\n\r?\n/)
        const events = done ? eventParts : eventParts.slice(0, -1)
        buffer = done ? '' : (eventParts.pop() ?? '')

        for (const event of events) {
          for (const line of event.split(/\r?\n/)) {
            if (!line.startsWith('data:')) continue
            const data = line.slice(5).trim()
            if (!data || data === '[DONE]') continue

            const chunk = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>
            }
            const delta = chunk.choices?.[0]?.delta?.content ?? ''
            if (!delta) continue
            answer += delta
            setMessages((current) => current.map((message) => (
              message.id === assistantMessage.id ? { ...message, content: answer } : message
            )))
          }
        }

        if (done) break
      }

      if (!answer) throw new Error('DeepSeek 未返回有效内容，请重新提问。')
    } catch (caught) {
      if (!(caught instanceof Error && caught.name === 'AbortError')) {
        setMessages((current) => current.filter((message) => (
          message.id !== assistantMessage.id || message.content.length > 0
        )))
        setError(caught instanceof Error ? caught.message : '对话请求失败，请稍后重试。')
      }
    } finally {
      if (abortControllerRef.current === controller) abortControllerRef.current = null
      setIsStreaming(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage()
  }

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="ai-chat-wrap" ref={containerRef}>
      <button
        type="button"
        className={`icon-button ai-entry-button ${open ? 'icon-button-active' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-label="打开 AI 助手"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="AI 助手"
      >
        <Sparkles size={18} />
        <span className="ai-entry-status" aria-hidden="true" />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <>
          <button
            type="button"
            className="ai-chat-backdrop"
            onClick={() => setOpen(false)}
            aria-label="关闭 AI 助手"
            tabIndex={-1}
          />
          <section ref={chatPanelRef} className="ai-chat-popover" role="dialog" aria-modal="true" aria-labelledby="ai-chat-title">
            <header className="ai-chat-header">
              <div className="ai-chat-identity">
                <span className="ai-chat-avatar"><Bot size={18} /></span>
                <div>
                  <h2 id="ai-chat-title">AI 学习助手</h2>
                  <span><i aria-hidden="true" />DeepSeek</span>
                </div>
              </div>
              <div className="ai-chat-header-actions">
                <button type="button" onClick={resetConversation} aria-label="新对话" title="新对话"><Trash2 size={16} /></button>
                <button type="button" onClick={() => setOpen(false)} aria-label="关闭 AI 助手" title="关闭"><X size={17} /></button>
              </div>
            </header>

            <div ref={messagesViewportRef} className="ai-chat-messages" aria-live="polite" aria-busy={isStreaming}>
              {messages.map((message) => (
                <div className={`ai-message ai-message-${message.role}`} key={message.id}>
                  <span className="ai-message-avatar" aria-hidden="true">
                    {message.role === 'assistant' ? <Bot size={14} /> : <UserRound size={14} />}
                  </span>
                  <div className={`ai-message-bubble ${!message.content ? 'ai-message-loading' : ''}`}>
                    {message.content ? <MarkdownMessage content={message.content} /> : <><i /><i /><i /><span className="sr-only">正在生成回答</span></>}
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="ai-suggestions" aria-label="建议问题">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button type="button" key={prompt} onClick={() => void sendMessage(prompt)}>{prompt}</button>
                  ))}
                </div>
              )}

              {error && <div className="ai-chat-error" role="alert">{error}</div>}
            </div>

            <form className="ai-chat-composer" onSubmit={submit}>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                rows={1}
                maxLength={12_000}
                placeholder="输入你的问题..."
                aria-label="发送给 AI 助手的消息"
                disabled={isStreaming}
              />
              {isStreaming ? (
                <button type="button" className="ai-send-button ai-stop-button" onClick={stopStreaming} aria-label="停止生成" title="停止生成"><Square size={13} fill="currentColor" /></button>
              ) : (
                <button type="submit" className="ai-send-button" disabled={!draft.trim()} aria-label="发送消息" title="发送"><Send size={16} /></button>
              )}
            </form>
          </section>
        </>,
        document.body,
      )}
    </div>
  )
}
