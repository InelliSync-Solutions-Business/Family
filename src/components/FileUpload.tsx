import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Input } from './ui/input'
import { Upload } from 'lucide-react'

type FileUploadProps = {
  onUpload: (files: File[], isShared: boolean) => void
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles, false)
  }, [onUpload])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
  })

  return (
    <div 
      {...getRootProps()}
      className="border-2 border-dashed border-warm-300 rounded-lg p-8 text-center cursor-pointer hover:border-warm-400 bg-warm-50"
    >
      <Input {...getInputProps()} />
      <div className="space-y-2">
        <Upload className="mx-auto h-8 w-8 text-warm-600" />
        <p className="text-warm-700">
          Drag files here or click to upload
          <span className="block text-sm text-warm-500 mt-1">
            (Photos, PDFs, documents)
          </span>
        </p>
      </div>
    </div>
  )
}
