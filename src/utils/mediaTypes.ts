/**
 * Determines the media type based on file extension
 * @param filename The name of the file including extension
 * @returns 'video' | 'audio' | 'other'
 */
export const getMediaType = (filename: string): 'video' | 'audio' | 'other' => {
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
  const ext = filename.split('.').pop()?.toLowerCase();

  if (!ext) return 'other';
  if (videoExtensions.includes(ext)) return 'video';
  if (audioExtensions.includes(ext)) return 'audio';
  return 'other';
};

/**
 * Validates if the file size is within the specified limit
 * @param size File size in bytes
 * @param maxSize Maximum allowed size in bytes
 * @returns boolean
 */
export const isValidFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

/**
 * Gets a human-readable file size string
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
