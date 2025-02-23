import { supabase } from './supabase'

export async function toggleReaction(documentId: string, userId: string, emoji: string) {
  const { data, error } = await supabase.rpc('handle_reaction', {
    document_id: documentId,
    user_id: userId,
    reaction_emoji: emoji
  })

  if (error) throw error
  return data
}
