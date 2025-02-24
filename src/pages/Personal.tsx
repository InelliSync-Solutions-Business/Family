import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useUpload } from '@/hooks/use-upload'

type ContentItem = {
  id: string
  name: string
  type: 'image' | 'pdf'
  isShared: boolean
  previewUrl?: string
}

export function PersonalPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const { uploadFiles, isUploading } = useUpload()

  const handleUpload = async (files: File[], isShared: boolean) => {
    const result = await uploadFiles(files, { isShared })
    if (result.success) {
      setContent(prev => [
        ...prev,
        ...files.map(file => {
          const type = file.type.startsWith('image/') ? 'image' : 
                      file.type === 'application/pdf' ? 'pdf' :
                      'pdf' // default to pdf for other types
          return {
            id: Math.random().toString(),
            name: file.name,
            type,
            isShared,
            previewUrl: URL.createObjectURL(file)
          } satisfies ContentItem
        })
      ])
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-warm-800">Your Personal Archive</h1>
      
      <Tabs defaultValue="private" className="space-y-4">
        <TabsList>
          <TabsTrigger value="private">Private Items</TabsTrigger>
          <TabsTrigger value="shared">Shared with Family</TabsTrigger>
        </TabsList>

        <TabsContent value="private" className="space-y-4">
          <FileUpload onUpload={files => handleUpload(files, false)} />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content
              .filter(item => !item.isShared)
              .map(item => (
                <Card key={item.id} className="p-4">
                  {item.type === 'image' && item.previewUrl && (
                    <img src={item.previewUrl} alt={item.name} className="w-full h-32 object-cover rounded" />
                  )}
                  {item.type === 'pdf' && (
                    <div className="w-full h-32 bg-warm-100 flex items-center justify-center rounded">
                      <span className="text-warm-600">PDF</span>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-warm-700 truncate">{item.name}</p>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <FileUpload onUpload={files => handleUpload(files, true)} />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content
              .filter(item => item.isShared)
              .map(item => (
                <Card key={item.id} className="p-4">
                  {item.type === 'image' && item.previewUrl && (
                    <img src={item.previewUrl} alt={item.name} className="w-full h-32 object-cover rounded" />
                  )}
                  {item.type === 'pdf' && (
                    <div className="w-full h-32 bg-warm-100 flex items-center justify-center rounded">
                      <span className="text-warm-600">PDF</span>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-warm-700 truncate">{item.name}</p>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
