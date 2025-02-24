import { useState, useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type MediaType = 'video' | 'audio';
type Annotation = { time: number; text: string };

interface MediaPlayerProps {
  src: string;
  type: MediaType;
  annotations?: Annotation[];
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

export const MediaPlayer = ({
  src,
  type,
  annotations = [],
  autoPlay = false,
  onPlay,
  onPause,
}: MediaPlayerProps) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const mediaElement = mediaRef.current;
    if (!mediaElement) return;

    if (autoPlay) {
      mediaElement.play().catch(() => {
        // Autoplay failed, which is expected in some browsers
        console.log('Autoplay prevented by browser');
      });
    }

    const handlePlay = () => onPlay?.();
    const handlePause = () => onPause?.();

    mediaElement.addEventListener('play', handlePlay);
    mediaElement.addEventListener('pause', handlePause);

    return () => {
      mediaElement.removeEventListener('play', handlePlay);
      mediaElement.removeEventListener('pause', handlePause);
    };
  }, [autoPlay, onPlay, onPause]);

  return (
    <div className="relative group">
      {type === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          className="video-js w-full rounded-lg shadow-xl"
          onTimeUpdate={(e) => 
            setCurrentTime(e.currentTarget.currentTime)
          }
          controls
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          className="w-full"
          onTimeUpdate={(e) => 
            setCurrentTime(e.currentTarget.currentTime)
          }
          controls
        >
          <source src={src} type="audio/mpeg" />
        </audio>
      )}

      {/* Annotation overlay */}
      <div className="absolute bottom-20 left-4 right-4 space-y-2">
        {annotations
          .filter(({ time }) => 
            Math.abs(time - currentTime) < 0.5
          )
          .map((annotation) => (
            <div 
              key={`${annotation.time}-${annotation.text}`}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 animate-in fade-in"
            >
              <p className="text-sm text-gray-700">
                {annotation.text}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};
