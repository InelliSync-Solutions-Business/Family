export interface DocumentMetadata {
  userId: string
  documentId: string
  text: string
  type: 'pdf' | 'text' | 'image'
  timestamp: string
  [key: string]: any
}

export interface VectorData {
  id: string
  values: number[]
  metadata: DocumentMetadata
}

export interface ProcessingResult {
  success: boolean
  error?: string
  vectors?: VectorData[]
}
