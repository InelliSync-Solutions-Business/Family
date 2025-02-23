import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { supabaseClient } from '@/lib/supabase';

const ffmpeg = createFFmpeg({ log: true });

export class ThumbnailService {
  private static instance: ThumbnailService;
  private initialized = false;

  private constructor() {}

  static getInstance(): ThumbnailService {
    if (!ThumbnailService.instance) {
      ThumbnailService.instance = new ThumbnailService();
    }
    return ThumbnailService.instance;
  }

  private async init() {
    if (!this.initialized) {
      await ffmpeg.load();
      this.initialized = true;
    }
  }

  /**
   * Generate a thumbnail from a video file
   * @param videoUrl URL of the video file
   * @param timestamp Time in seconds to capture thumbnail
   * @returns URL of the generated thumbnail
   */
  async generateVideoThumbnail(
    videoUrl: string,
    timestamp: number = 0
  ): Promise<string> {
    await this.init();

    try {
      // Download the video file
      const videoData = await fetchFile(videoUrl);
      ffmpeg.FS('writeFile', 'input.mp4', videoData);

      // Generate thumbnail
      await ffmpeg.run(
        '-i', 'input.mp4',
        '-ss', timestamp.toString(),
        '-frames:v', '1',
        '-q:v', '2',
        'thumbnail.jpg'
      );

      // Read the thumbnail
      const thumbnailData = ffmpeg.FS('readFile', 'thumbnail.jpg');
      
      // Clean up
      ffmpeg.FS('unlink', 'input.mp4');
      ffmpeg.FS('unlink', 'thumbnail.jpg');

      // Upload to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('family-media-thumbnails')
        .upload(
          `${Date.now()}.jpg`,
          thumbnailData,
          {
            contentType: 'image/jpeg',
            cacheControl: '3600',
          }
        );

      if (error) throw error;

      const { data: { publicUrl } } = supabaseClient.storage
        .from('family-media-thumbnails')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  /**
   * Generate a waveform image from an audio file
   * @param audioUrl URL of the audio file
   * @returns URL of the generated waveform image
   */
  async generateAudioWaveform(audioUrl: string): Promise<string> {
    await this.init();

    try {
      // Download the audio file
      const audioData = await fetchFile(audioUrl);
      ffmpeg.FS('writeFile', 'input.mp3', audioData);

      // Generate waveform image
      await ffmpeg.run(
        '-i', 'input.mp3',
        '-filter_complex', 'showwavespic=s=640x120:colors=#4338ca',
        '-frames:v', '1',
        'waveform.png'
      );

      // Read the waveform image
      const waveformData = ffmpeg.FS('readFile', 'waveform.png');
      
      // Clean up
      ffmpeg.FS('unlink', 'input.mp3');
      ffmpeg.FS('unlink', 'waveform.png');

      // Upload to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('family-media-thumbnails')
        .upload(
          `waveform_${Date.now()}.png`,
          waveformData,
          {
            contentType: 'image/png',
            cacheControl: '3600',
          }
        );

      if (error) throw error;

      const { data: { publicUrl } } = supabaseClient.storage
        .from('family-media-thumbnails')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error generating waveform:', error);
      throw error;
    }
  }

  /**
   * Update thumbnail for a media item
   */
  async updateMediaThumbnail(
    mediaId: string,
    mediaUrl: string,
    mediaType: 'video' | 'audio'
  ): Promise<void> {
    try {
      const thumbnailUrl = mediaType === 'video'
        ? await this.generateVideoThumbnail(mediaUrl)
        : await this.generateAudioWaveform(mediaUrl);

      const { error } = await supabaseClient
        .from('media_items')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', mediaId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating media thumbnail:', error);
      throw error;
    }
  }
}
