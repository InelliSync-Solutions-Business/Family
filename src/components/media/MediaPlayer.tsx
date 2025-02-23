import { useState, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type MediaType = 'video' | 'audio';
type Annotation = { time: number; text: string };

export const MediaPlayer = ({
  src,
  type,
  annotations = [],
}: {
  src: string;
  type: MediaType;
  annotations?: Annotation[];
}) => {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <div className="relative group">
      {type === 'video' ? (
        <video
          ref={mediaRef}
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
          ref={mediaRef}
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
