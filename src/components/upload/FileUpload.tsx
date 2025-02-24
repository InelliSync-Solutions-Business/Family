import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, FileText, CheckCircle } from 'lucide-react';
import { ContentType } from '../../types/content';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '../../components/ui/progress';

interface FileUploadProps {
  onUploadComplete: (contentId: string) => void;
}

interface UploadState {
  progress: number;
  error?: string;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
  });
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    type: '' as ContentType,
    isPrivate: false,
    tags: '',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setMetadata((prev) => ({ ...prev, type: 'image' }));
    } else if (file.type === 'application/pdf') {
      setMetadata((prev) => ({ ...prev, type: 'pdf' }));
    } else {
      setMetadata((prev) => ({ ...prev, type: 'document' }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file || !metadata.title || !metadata.type) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('description', metadata.description);
    formData.append('type', metadata.type);
    formData.append('isPrivate', metadata.isPrivate.toString());
    formData.append('tags', metadata.tags);

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadState({ progress });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          onUploadComplete(response.id);
          // Reset form
          setFile(null);
          setPreview('');
          setMetadata({
            title: '',
            description: '',
            type: '' as ContentType,
            isPrivate: false,
            tags: '',
          });
          setUploadState({ progress: 0 });
        } else {
          setUploadState({
            progress: 0,
            error: 'Upload failed. Please try again.',
          });
        }
      };

      xhr.onerror = () => {
        setUploadState({
          progress: 0,
          error: 'Upload failed. Please check your connection.',
        });
      };

      xhr.open('POST', '/api/content');
      xhr.send(formData);
    } catch (error) {
      setUploadState({
        progress: 0,
        error: 'Upload failed. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop a file here, or click to select
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Maximum file size: 10MB. Supported formats: Images, PDF, DOC, DOCX
        </p>
      </div>

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {/* File Preview */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-background rounded flex items-center justify-center">
                  {metadata.type === 'pdf' ? (
                    <FileText className="h-8 w-8 text-gray-400" />
                  ) : (
                    <Image className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFile(null);
                  setPreview('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Metadata Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) =>
                    setMetadata((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter a title for your content"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={metadata.description}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Add a description (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={metadata.tags}
                  onChange={(e) =>
                    setMetadata((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="Add tags separated by commas"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="private">Private</Label>
                <Select
                  value={metadata.isPrivate ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setMetadata((prev) => ({
                      ...prev,
                      isPrivate: value === 'true',
                    }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Shared with Family</SelectItem>
                    <SelectItem value="true">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Progress */}
              {uploadState.progress > 0 && (
                <div className="space-y-2">
                  <Progress value={uploadState.progress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Uploading... {Math.round(uploadState.progress)}%
                  </p>
                </div>
              )}

              {uploadState.error && (
                <p className="text-sm text-red-500 text-center">
                  {uploadState.error}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={!file || !metadata.title || uploadState.progress > 0}
              >
                {uploadState.progress > 0 ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
