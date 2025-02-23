import OpenAI from 'openai';
import { supabaseClient } from '@/lib/supabase';
import { Database } from '@/types/supabase';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export type MediaMetadata = {
  id: string;
  title: string;
  description?: string;
  mediaType: 'video' | 'audio';
  storagePath: string;
  duration?: number;
  transcription?: string;
};

export class MediaProcessingService {
  private supabase = supabaseClient;

  /**
   * Process a newly uploaded media file
   */
  async processMedia(metadata: Omit<MediaMetadata, 'id'>): Promise<MediaMetadata> {
    try {
      // Insert initial metadata
      const { data: mediaItem, error } = await this.supabase
        .from('media_items')
        .insert({
          title: metadata.title,
          media_type: metadata.mediaType,
          storage_path: metadata.storagePath,
          description: metadata.description,
          duration: metadata.duration,
        })
        .select()
        .single();

      if (error) throw error;

      // Start transcription if it's an audio file
      if (metadata.mediaType === 'audio') {
        this.transcribeAudio(mediaItem.id, metadata.storagePath);
      }

      return {
        id: mediaItem.id,
        title: mediaItem.title,
        description: mediaItem.description,
        mediaType: mediaItem.media_type,
        storagePath: mediaItem.storage_path,
        duration: mediaItem.duration,
      };
    } catch (error) {
      console.error('Error processing media:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  private async transcribeAudio(mediaId: string, storagePath: string) {
    try {
      // Get the file URL
      const { data: { publicUrl } } = this.supabase
        .storage
        .from('family-media')
        .getPublicUrl(storagePath);

      // Transcribe using OpenAI
      const transcription = await openai.audio.transcriptions.create({
        file: await fetch(publicUrl).then(r => r.blob()),
        model: 'whisper-1',
        language: 'en',
      });

      // Update the media item with transcription
      const { error } = await this.supabase
        .from('media_items')
        .update({ transcription: transcription.text })
        .eq('id', mediaId);

      if (error) throw error;

      return transcription.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Get media item by ID
   */
  async getMediaItem(id: string): Promise<MediaMetadata | null> {
    const { data, error } = await this.supabase
      .from('media_items')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      mediaType: data.media_type,
      storagePath: data.storage_path,
      duration: data.duration,
      transcription: data.transcription,
    };
  }
}
