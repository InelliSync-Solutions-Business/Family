import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send } from 'lucide-react'
import { chatCompletion } from '@/lib/openai'
import { searchDocuments } from '@/services/search'
import { Message } from '@/types/api'

interface AIChatProps {
  context?: string // Could be a document ID or specific content
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIChat({ context, open, onOpenChange }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get relevant context first
      const contextResults = await searchDocuments(input)
      
      const context = contextResults
        .map(r => r.description)
        .join('\n\n')
        .slice(0, 2000) // Limit context length

      // Add the context as a preliminary assistant message
      const messagesWithContext: Message[] = [
        ...messages,
        { role: 'assistant' as const, content: `Here's some relevant context that might help: ${context}` },
        { role: 'user' as const, content: input }
      ]

      const response = await chatCompletion(messagesWithContext)

      setMessages(prev => [...prev, { role: 'assistant' as const, content: response.message }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant' as const, 
        content: 'I apologize, but I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed bottom-4 right-4 w-full max-w-md rounded-lg bg-white p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-serif text-lg text-warm-800">
              Family Archive AI
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button 
                className="h-6 w-6 rounded-full p-0"
                onClick={() => onOpenChange(false)}
              >
                ×
              </Button>
            </Dialog.Close>
          </div>

          <ScrollArea className="h-96 rounded-md border p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-warm-600 text-white'
                        : 'bg-warm-100 text-warm-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-warm-100 text-warm-800 rounded-lg p-3">
                    <Loader2 className="animate-spin h-5 w-5" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }} 
            className="flex gap-2"
          >
            <Input
              type="text"
              value={input}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Ask about family history..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => {
                const formElement = document.querySelector('form');
                if (formElement) {
                  formElement.requestSubmit();
                }
              }}
              disabled={isLoading}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
