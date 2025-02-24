import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ScrollArea } from '../components/ui/scroll-area'
import { Loader2, Send } from 'lucide-react'
import { chatCompletion } from '@/lib/openai'

import { Message } from '@/types/api'

interface AIChatProps {
  context?: string
  contextProvider?: () => Promise<{ context: string; defaultQuestion?: string }>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIChat({ context, contextProvider, open, onOpenChange }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadedContext, setLoadedContext] = useState<string | undefined>(context)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadContext = async () => {
      if (contextProvider && open) {
        const result = await contextProvider()
        setLoadedContext(result?.context)
        if (result?.defaultQuestion) {
          setInput(result.defaultQuestion)
        }
      }
    }
    loadContext()
  }, [contextProvider, open])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatCompletion({
        messages: [...messages, userMessage],
        context: loadedContext
      })

      if (response.success) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response.message }
        ])
      } else {
        throw new Error(response.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed right-4 bottom-4 w-[400px] h-[600px] bg-white rounded-lg shadow-lg p-4 flex flex-col">
          <Dialog.Title className="text-lg font-semibold mb-4">AI Chat Assistant</Dialog.Title>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'assistant'
                        ? 'bg-warm-100 text-warm-900'
                        : 'bg-warm-600 text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
