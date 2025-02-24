import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { supabase } from '@/lib/supabaseClient';

const ffmpeg = new FFmpeg();

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
      // Load ffmpeg with the correct base path for WASM files
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
      });
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
    try {
      await this.init();

      // Download the video file
      const videoData = await fetchFile(videoUrl);
      await ffmpeg.writeFile('input.mp4', videoData);

      // Extract a frame at the specified timestamp to create thumbnail
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', `${timestamp}.000`,
        '-vframes', '1',
        '-f', 'image2',
        'thumbnail.jpg'
      ]);

      // Read the thumbnail file
      const thumbnailData = await ffmpeg.readFile('thumbnail.jpg');
      const thumbnailBlob = new Blob([thumbnailData], { type: 'image/jpeg' });

      // Clean up
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('thumbnail.jpg');

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('family-media-thumbnails')
        .upload(
          `${Date.now()}.jpg`,
          thumbnailBlob,
          {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          }
        );

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('family-media-thumbnails')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error generating video thumbnail:', error);
      throw error;
    }
  }

  /**
   * Generate a waveform image from an audio file
   * @param audioUrl URL of the audio file
   * @returns URL of the generated waveform image
   */
  async generateAudioWaveform(audioUrl: string): Promise<string> {
    try {
      await this.init();

      // Download the audio file
      const audioData = await fetchFile(audioUrl);
      await ffmpeg.writeFile('input.mp3', audioData);

      // Generate waveform using ffmpeg's showwavespic filter
      await ffmpeg.exec([
        '-i', 'input.mp3',
        '-filter_complex', 'showwavespic=s=640x120:colors=#4338ca',
        '-frames:v', '1',
        'waveform.png'
      ]);

      // Read the waveform image
      const waveformData = await ffmpeg.readFile('waveform.png');
      const waveformBlob = new Blob([waveformData], { type: 'image/png' });

      // Clean up
      await ffmpeg.deleteFile('input.mp3');
      await ffmpeg.deleteFile('waveform.png');

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('family-media-thumbnails')
        .upload(
          `waveform_${Date.now()}.png`,
          waveformBlob,
          {
            contentType: 'image/png',
            cacheControl: '3600'
          }
        );

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('family-media-thumbnails')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error generating audio waveform:', error);
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

      const { error } = await supabase
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
