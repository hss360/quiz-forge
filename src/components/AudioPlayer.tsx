'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Music, Upload, X, Pause, Play } from 'lucide-react';

export default function AudioPlayer() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showUpload, setShowUpload] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    // Revoke old URL if exists
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setFileName(file.name);
    setShowUpload(false);
    setIsPlaying(true);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    audio.src = audioUrl;
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.play().catch(() => {
      // Autoplay blocked — user needs to interact first
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const removeAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setFileName('');
    setIsPlaying(false);
  };

  return (
    <>
      <audio ref={audioRef} />

      {/* Floating audio bar — bottom right */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {/* Upload prompt / expanded upload area */}
        {showUpload && (
          <div
            className="animate-slide-up bg-forge-surface/95 backdrop-blur-md border border-forge-border rounded-xl p-3 shadow-2xl mr-1"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-forge-accent/10 hover:bg-forge-accent/20
                text-forge-accent text-xs font-body transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Choose audio file
            </button>
          </div>
        )}

        {/* Now playing pill */}
        {audioUrl && (
          <div className="animate-slide-up flex items-center gap-1.5 bg-forge-surface/95 backdrop-blur-md border border-forge-border
            rounded-full pl-3 pr-1.5 py-1.5 shadow-2xl max-w-[220px]">
            {/* Animated bars */}
            <div className="flex items-end gap-[2px] h-3 mr-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-[3px] rounded-full bg-forge-accent ${isPlaying && !isMuted ? 'animate-pulse' : ''}`}
                  style={{
                    height: isPlaying && !isMuted ? `${8 + (i * 4)}px` : '3px',
                    animationDelay: `${i * 150}ms`,
                    transition: 'height 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* File name */}
            <span className="text-[10px] text-white/50 font-body truncate max-w-[80px]">
              {fileName}
            </span>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 text-white/60" />
              ) : (
                <Play className="w-3 h-3 text-white/60" />
              )}
            </button>

            {/* Volume slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (v > 0 && isMuted) setIsMuted(false);
              }}
              className="w-12 h-1 accent-forge-accent cursor-pointer"
            />

            {/* Mute toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-forge-wrong/70" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white/50" />
              )}
            </button>

            {/* Remove */}
            <button
              onClick={removeAudio}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-forge-wrong/20 transition-colors"
            >
              <X className="w-3 h-3 text-white/30 hover:text-forge-wrong" />
            </button>
          </div>
        )}

        {/* Music button (always visible) */}
        <button
          onClick={() => {
            if (audioUrl) {
              togglePlay();
            } else {
              setShowUpload(!showUpload);
            }
          }}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
            ${audioUrl
              ? isPlaying
                ? 'bg-forge-accent shadow-forge-accent/30'
                : 'bg-forge-surface border border-forge-border'
              : 'bg-forge-surface/90 border border-forge-border hover:border-forge-accent/50'
            }
          `}
          title={audioUrl ? (isPlaying ? 'Pause' : 'Play') : 'Add background music'}
        >
          <Music className={`w-4 h-4 ${audioUrl && isPlaying ? 'text-white' : 'text-white/50'}`} />
        </button>
      </div>
    </>
  );
}
