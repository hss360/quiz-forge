'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileArchive, FileText, Presentation, AlertCircle } from 'lucide-react';

interface Props {
  onComplete: (content: string, files: string[]) => void;
}

export default function UploadStage({ onComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError('');
      setIsProcessing(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/extract', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        onComplete(data.content, data.files);
      } catch (err: any) {
        setError(err.message || 'Failed to process file');
      } finally {
        setIsProcessing(false);
      }
    },
    [onComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mb-4">
          Turn your notes into
          <br />
          <span className="bg-gradient-to-r from-forge-accent via-orange-400 to-forge-purple bg-clip-text text-transparent">
            quiz battles
          </span>
        </h2>
        <p className="text-white/40 font-body text-sm max-w-md mx-auto">
          Upload a zip of your study materials — PDFs, slides, docs — and get
          an AI-powered Kahoot-style quiz in seconds.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full max-w-lg cursor-pointer rounded-2xl border-2 border-dashed
          transition-all duration-300 p-12 text-center group
          ${
            isDragging
              ? 'border-forge-accent bg-forge-accent/5 scale-[1.02]'
              : 'border-forge-border hover:border-white/20 bg-forge-surface/50'
          }
          ${isProcessing ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.pdf,.pptx,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-forge-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 font-body text-sm">Extracting content...</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-forge-accent/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-forge-accent/20 transition-colors">
              <Upload className="w-6 h-6 text-forge-accent" />
            </div>
            <p className="font-display font-semibold text-lg mb-2">
              Drop your files here
            </p>
            <p className="text-white/30 text-sm font-body">
              or click to browse
            </p>
          </>
        )}
      </div>

      {/* Supported formats */}
      <div className="flex items-center gap-6 mt-8 text-white/25 text-xs font-body">
        <span className="flex items-center gap-1.5">
          <FileArchive className="w-3.5 h-3.5" /> .zip
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> .pdf
        </span>
        <span className="flex items-center gap-1.5">
          <Presentation className="w-3.5 h-3.5" /> .pptx
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> .docx .txt
        </span>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 text-forge-wrong text-sm font-body bg-forge-wrong/10 px-4 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
