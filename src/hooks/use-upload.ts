import { useState } from 'react'
import { useAuth } from './use-auth'
import { upsertDocumentVectors } from '@/services/pinecone'
import { supabase } from '@/services/supabase'

type UploadOptions = {
  isShared: boolean
  description?: string
}

export function useUpload() {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)

  const uploadFiles = async (files: File[], options: UploadOptions) => {
    if (!user) throw new Error('Not authenticated')
    setIsUploading(true)
    
    try {
      const { data, error } = await supabase.storage
        .from('family-legacy')
        .upload(`user-${user.id}/${Date.now()}-${files[0].name}`, files[0])

      if (error) throw error
      const supabasePath = data.path

      // After Supabase upload
      if (options.isShared) {
        const vectorizationResult = await fetch('/api/vectorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath: supabasePath,
            userId: user.id,
            isShared: options.isShared
          })
        })
        
        if (!vectorizationResult.ok) {
          throw new Error('Failed to vectorize document')
        }
      }

      return { success: true }
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFiles, isUploading }
}
