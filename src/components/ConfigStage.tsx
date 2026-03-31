'use client';

import { QuizConfig } from '@/lib/types';
import { FileText, Clock, Hash, Zap, Play } from 'lucide-react';

interface Props {
  fileNames: string[];
  config: QuizConfig;
  onConfigChange: (config: QuizConfig) => void;
  onStart: (config: QuizConfig) => void;
}

const QUESTION_COUNTS = [5, 10, 15, 20, 25];
const TIME_OPTIONS = [10, 15, 20, 30, 45];
const DIFFICULTIES = [
  { value: 'mixed', label: 'Mixed', icon: '🎲' },
  { value: 'easy', label: 'Easy', icon: '🟢' },
  { value: 'medium', label: 'Medium', icon: '🟡' },
  { value: 'hard', label: 'Hard', icon: '🔴' },
] as const;

export default function ConfigStage({ fileNames, config, onConfigChange, onStart }: Props) {
  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Files detected */}
      <div className="mb-8 p-4 rounded-xl bg-forge-surface/80 border border-forge-border/50">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-forge-accent" />
          <span className="text-sm font-semibold text-white/70">
            {fileNames.length} file{fileNames.length !== 1 ? 's' : ''} loaded
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {fileNames.map((name, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-forge-accent/10 text-forge-accent text-xs rounded-md font-body truncate max-w-[200px]"
            >
              {name.split('/').pop()}
            </span>
          ))}
        </div>
      </div>

      {/* Config sections */}
      <h2 className="font-display font-bold text-2xl mb-6">Configure your quiz</h2>

      {/* Number of questions */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-sm font-semibold text-white/60 mb-3">
          <Hash className="w-4 h-4" /> Number of questions
        </label>
        <div className="flex gap-2">
          {QUESTION_COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => onConfigChange({ ...config, numQuestions: n })}
              className={`
                flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${
                  config.numQuestions === n
                    ? 'bg-forge-accent text-white shadow-lg shadow-forge-accent/20'
                    : 'bg-forge-surface border border-forge-border hover:border-white/20 text-white/50'
                }
              `}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Time per question */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-sm font-semibold text-white/60 mb-3">
          <Clock className="w-4 h-4" /> Seconds per question
        </label>
        <div className="flex gap-2">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => onConfigChange({ ...config, timePerQuestion: t })}
              className={`
                flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${
                  config.timePerQuestion === t
                    ? 'bg-forge-purple text-white shadow-lg shadow-forge-purple/20'
                    : 'bg-forge-surface border border-forge-border hover:border-white/20 text-white/50'
                }
              `}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-10">
        <label className="flex items-center gap-2 text-sm font-semibold text-white/60 mb-3">
          <Zap className="w-4 h-4" /> Difficulty
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() =>
                onConfigChange({ ...config, difficulty: d.value as QuizConfig['difficulty'] })
              }
              className={`
                py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${
                  config.difficulty === d.value
                    ? 'bg-forge-blue text-white shadow-lg shadow-forge-blue/20'
                    : 'bg-forge-surface border border-forge-border hover:border-white/20 text-white/50'
                }
              `}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => onStart(config)}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-forge-accent to-orange-500 text-white font-display font-bold text-lg
          hover:shadow-xl hover:shadow-forge-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200
          flex items-center justify-center gap-3"
      >
        <Play className="w-5 h-5" />
        Generate & Start Quiz
      </button>
    </div>
  );
}
