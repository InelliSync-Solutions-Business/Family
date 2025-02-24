import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type Comment = {
  id: string
  content: string
  user_id: string
  created_at: string
  reactions: Record<string, number>
}

type Props = {
  documentId: string
}

export function CommentSystem({ documentId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `document_id=eq.${documentId}`
      }, (payload: RealtimePostgresChangesPayload<Comment>) => {
        if (payload.eventType === 'INSERT') {
          setComments(prev => [...prev, payload.new])
        }
        if (payload.eventType === 'UPDATE') {
          setComments(prev => 
            prev.map(comment => comment.id === payload.new.id ? payload.new : comment)
          )
        }
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [documentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    const { error } = await supabase
      .from('comments')
      .insert([{
        document_id: documentId,
        user_id: user.id,
        content: newComment.trim()
      }])

    if (!error) setNewComment('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your memory..."
        />
        <Button type="submit">Comment</Button>
      </form>

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <Avatar>
              <AvatarFallback className="bg-warm-600 text-warm-50">
                {comment.user_id.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-warm-800">{comment.content}</p>
              <time className="text-sm text-warm-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
