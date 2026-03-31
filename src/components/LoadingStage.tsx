'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  'Reading your notes...',
  'Identifying key concepts...',
  'Crafting tricky questions...',
  'Generating wrong answers...',
  'Almost there...',
];

export default function LoadingStage() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 90));
    }, 500);
    return () => clearInterval(progTimer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
      {/* Spinner */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-forge-border" />
        <div className="absolute inset-0 rounded-full border-2 border-t-forge-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div
          className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-forge-purple border-b-transparent border-l-transparent animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-forge-accent font-bold text-lg font-body">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-forge-surface rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-forge-accent to-forge-purple rounded-full transition-all duration-500 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 progress-shimmer" />
        </div>
      </div>

      {/* Message */}
      <p
        key={msgIndex}
        className="text-white/50 font-body text-sm animate-slide-up"
      >
        {MESSAGES[msgIndex]}
      </p>
    </div>
  );
}
