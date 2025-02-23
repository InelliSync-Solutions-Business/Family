import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
        ...files.map(file => ({
          id: Math.random().toString(),
          name: file.name,
          type: file.type.startsWith('image') ? 'image' : 'pdf',
          isShared,
          previewUrl: URL.createObjectURL(file)
        }))
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
          <FileUpload onUpload={handleUpload} />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content
              .filter(item => !item.isShared)
              .map(item => (
                <Card key={item.id} className="p-2 hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-warm-100 rounded-md mb-2 overflow-hidden">
                    {item.type === 'image' ? (
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-warm-600">
                        <span className="text-4xl">📄</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-warm-700 truncate px-1">{item.name}</p>
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    Ask AI About This
                  </Button>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="shared">
          {/* Similar structure for shared items */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
