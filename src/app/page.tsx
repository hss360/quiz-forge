'use client';

import { useState } from 'react';
import { AppState, QuizQuestion, QuizConfig, QuizResult } from '@/lib/types';
import UploadStage from '@/components/UploadStage';
import ConfigStage from '@/components/ConfigStage';
import LoadingStage from '@/components/LoadingStage';
import QuizStage from '@/components/QuizStage';
import ResultsStage from '@/components/ResultsStage';
import AudioPlayer from '@/components/AudioPlayer';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [extractedContent, setExtractedContent] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [config, setConfig] = useState<QuizConfig>({
    numQuestions: 10,
    timePerQuestion: 20,
    difficulty: 'mixed',
  });
  const [results, setResults] = useState<QuizResult[]>([]);

  const handleUploadComplete = (content: string, files: string[]) => {
    setExtractedContent(content);
    setFileNames(files);
    setAppState('configure');
  };

  const handleStartQuiz = async (cfg: QuizConfig) => {
    setConfig(cfg);
    setAppState('loading');

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: extractedContent,
          numQuestions: cfg.numQuestions,
          difficulty: cfg.difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQuestions(data.questions);
      setAppState('playing');
    } catch (err: any) {
      alert('Failed to generate quiz: ' + err.message);
      setAppState('configure');
    }
  };

  const handleQuizComplete = (quizResults: QuizResult[]) => {
    setResults(quizResults);
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('upload');
    setExtractedContent('');
    setFileNames([]);
    setQuestions([]);
    setResults([]);
  };

  const handleRetry = () => {
    setResults([]);
    setAppState('playing');
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-forge-accent/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-forge-purple/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-forge-border/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forge-accent to-forge-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <h1 className="font-display font-bold text-lg tracking-tight">
                Quiz<span className="text-forge-accent">Forge</span>
              </h1>
            </div>
            {appState !== 'upload' && (
              <button
                onClick={handleRestart}
                className="text-sm text-white/40 hover:text-white/70 transition-colors font-body"
              >
                ← New Quiz
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          {appState === 'upload' && <UploadStage onComplete={handleUploadComplete} />}
          {appState === 'configure' && (
            <ConfigStage
              fileNames={fileNames}
              config={config}
              onConfigChange={setConfig}
              onStart={handleStartQuiz}
            />
          )}
          {appState === 'loading' && <LoadingStage />}
          {appState === 'playing' && (
            <QuizStage
              questions={questions}
              config={config}
              onComplete={handleQuizComplete}
            />
          )}
          {appState === 'results' && (
            <ResultsStage
              questions={questions}
              results={results}
              config={config}
              onRetry={handleRetry}
              onNewQuiz={handleRestart}
            />
          )}
        </div>
      </div>

      {/* Persistent audio player */}
      <AudioPlayer />
    </main>
  );
}
