import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AIChat } from '@/components/AIChat'
import { useAuth } from '@/hooks/use-auth'
import { searchDocuments } from '@/services/search'
import { CommentSystem } from '@/components/CommentSystem'

type SharedItem = {
  id: string
  previewUrl: string
  name: string
  type: 'image' | 'pdf'
  comments: number
  likes: number
  lastAccessed: string
}

export function SharedPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<SharedItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Replace with Supabase real-time query
    const mockData: SharedItem[] = [
      {
        id: '1',
        previewUrl: '/family-photo.jpg',
        name: '1960 Family Reunion',
        type: 'image',
        comments: 4,
        likes: 12,
        lastAccessed: '2025-02-22'
      }
    ]
    setItems(mockData)
  }, [])

  const handleAIQuery = async (itemId: string | null) => {
    if (!itemId) return { context: '', defaultQuestion: '' }
    
    const item = items.find(i => i.id === itemId)
    if (!item) return { context: '', defaultQuestion: '' }

    const results = await searchDocuments({
      query: item.name,
      userId: user?.id
    })

    return {
      context: results.map(r => r.description).join('\n') || 'No context available',
      defaultQuestion: `Tell me about ${item.name}`
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-warm-800">Family Shared Hub</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-warm-100 rounded-md mb-2 overflow-hidden">
              <img
                src={item.previewUrl}
                alt={item.name}
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-warm-800">{item.name}</h3>
                <p className="text-sm text-warm-500">
                  {item.comments} comments • {item.likes} likes
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItem(item.id)}
              >
                Ask AI
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-warm-500">Last viewed {item.lastAccessed}</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-warm-600 text-warm-50">
                    {item.type === 'image' ? 'IMG' : 'PDF'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CommentSystem documentId={item.id} />
          </Card>
        ))}
      </div>

      <AIChat
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        contextProvider={() => handleAIQuery(selectedItem)}
      />
    </div>
  )
}
