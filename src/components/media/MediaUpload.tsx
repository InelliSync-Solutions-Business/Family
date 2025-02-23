import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUploader } from 'react-drag-drop-files';
import { getMediaType } from '@/utils/mediaTypes';
import { toast } from 'sonner';

const fileTypes = ['MP4', 'MOV', 'AVI', 'MP3', 'WAV'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const MediaUpload = ({ 
  onUploadComplete,
  onError
}: { 
  onUploadComplete: (url: string, type: 'video' | 'audio') => void;
  onError?: (error: string) => void;
}) => {
  const supabase = useSupabaseClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      const error = 'File size exceeds 100MB limit';
      onError?.(error);
      toast.error(error);
      return;
    }

    const mediaType = getMediaType(file.name);
    if (mediaType === 'other') {
      const error = 'Unsupported file type';
      onError?.(error);
      toast.error(error);
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}${fileExt ? `.${fileExt}` : ''}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('family-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('family-media')
        .getPublicUrl(data.path);

      onUploadComplete(publicUrl, mediaType);
      toast.success('Media uploaded successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
      <FileUploader
        handleChange={handleUpload}
        name="mediaFile"
        types={fileTypes}
        disabled={isUploading}
        maxSize={100}
      >
        <div className="text-center space-y-2 cursor-pointer">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            Drag & drop family media files here
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: {fileTypes.join(', ')}
          </p>
          <p className="text-xs text-gray-400">
            Maximum size: 100MB
          </p>
        </div>
      </FileUploader>
      
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-gray-500 text-center">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );
};
