'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, CheckCircle, AlertCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  action?: string | null
  success?: boolean
  timestamp: Date
}

interface AgentChatProps {
  siteId: string
  primaryColor?: string
  businessName?: string
}

const SUGGESTIONS = [
  'Show me my current services',
  'Change my haircut price to $75',
  'Add a new service: Deep Conditioning $45 45min',
  'Update my headline to "Portland\'s Best Barbers"',
  'Remove the blowout service',
]

export default function AgentChat({
  siteId,
  primaryColor = '#1A1A2E',
  businessName = 'your site',
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your AI site assistant. I can update **${businessName}** for you in seconds.\n\nTry saying:\n• "Change my oil change price to $150"\n• "Add a new service: Wheel Alignment $95"\n• "Update my headline to..."\n• "Show me my services"`,
      action: null,
      success: true,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setShowSuggestions(false)

    try {
      // Build history for context (exclude welcome message)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, site_id: siteId, history }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Agent failed')

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        action: data.action,
        success: data.success,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Something went wrong: ${err.message}. Please try again.`,
        action: null,
        success: false,
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Render markdown-lite: **bold** and newlines
  function renderContent(text: string, role: 'user' | 'assistant') {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <span key={i} className="block">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className={role === 'user' ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>{part.slice(2, -2)}</strong>
              : <span key={j}>{part}</span>
          )}
        </span>
      )
    })
  }

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden" style={{ height: '520px' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">AI Site Assistant</p>
          <p className="text-white/60 text-xs">Type in plain English to update your site</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-white/60 text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === 'user'
                ? 'bg-gray-300'
                : 'bg-gray-800'
            }`}>
              {msg.role === 'user'
                ? <User size={12} className="text-gray-600" />
                : <Bot size={12} className="text-white" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-white rounded-tr-sm'
                  : msg.success === false
                    ? 'bg-red-50 border border-red-100 text-red-700 rounded-tl-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
              }`}
              style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}>
                {renderContent(msg.content, msg.role)}
              </div>

              {/* Action badge */}
              {msg.action && (
                <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  msg.success
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {msg.success
                    ? <CheckCircle size={10} />
                    : <AlertCircle size={10} />
                  }
                  {msg.action.replace(/_/g, ' ')}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">Suggestions</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {SUGGESTIONS.slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition border border-gray-200 whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Change oil change to $150..."
            disabled={loading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition disabled:opacity-50 text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            {loading
              ? <Loader2 size={16} className="text-white animate-spin" />
              : <Send size={15} className="text-white" />
            }
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-1.5 text-center">
          Changes apply to your live site instantly
        </p>
      </div>
    </div>
  )
}
