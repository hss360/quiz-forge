'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizQuestion, QuizConfig, QuizResult } from '@/lib/types';
import { Timer, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  questions: QuizQuestion[];
  config: QuizConfig;
  onComplete: (results: QuizResult[]) => void;
}

const OPTION_COLORS = [
  { bg: 'bg-red-500/15', border: 'border-red-500/30', hover: 'hover:bg-red-500/25', active: 'bg-red-500', shape: '▲' },
  { bg: 'bg-blue-500/15', border: 'border-blue-500/30', hover: 'hover:bg-blue-500/25', active: 'bg-blue-500', shape: '◆' },
  { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', hover: 'hover:bg-yellow-500/25', active: 'bg-yellow-500', shape: '●' },
  { bg: 'bg-green-500/15', border: 'border-green-500/30', hover: 'hover:bg-green-500/25', active: 'bg-green-500', shape: '■' },
];

export default function QuizStage({ questions, config, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timePerQuestion);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const startTimeRef = useRef(Date.now());

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex) / totalQuestions) * 100;

  // Timer countdown
  useEffect(() => {
    if (showAnswer) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, showAnswer]);

  const handleAnswer = useCallback(
    (optionIndex: number | null) => {
      if (showAnswer) return;

      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      const isCorrect = optionIndex === question.correctIndex;

      // Scoring: base points + time bonus + streak bonus
      let points = 0;
      if (isCorrect) {
        const timeBonus = Math.round((timeLeft / config.timePerQuestion) * 500);
        const newStreak = streak + 1;
        const streakBonus = Math.min(newStreak, 5) * 100;
        points = 500 + timeBonus + streakBonus;
        setStreak(newStreak);
        if (newStreak >= 3) {
          setShowStreakBonus(true);
          setTimeout(() => setShowStreakBonus(false), 1500);
        }
      } else {
        setStreak(0);
      }

      const result: QuizResult = {
        questionId: question.id,
        selectedIndex: optionIndex,
        correct: isCorrect,
        timeSpent,
        pointsEarned: points,
      };

      setSelectedOption(optionIndex);
      setShowAnswer(true);
      setResults((prev) => [...prev, result]);
    },
    [showAnswer, question, timeLeft, config.timePerQuestion, streak]
  );

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      const finalResult = results;
      onComplete(finalResult);
    } else {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setShowAnswer(false);
      setTimeLeft(config.timePerQuestion);
      startTimeRef.current = Date.now();
    }
  };

  const totalScore = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const timerPercentage = (timeLeft / config.timePerQuestion) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Top bar: progress + score */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-body text-white/40">
          {currentIndex + 1} / {totalQuestions}
        </span>
        <span className="text-sm font-bold font-body text-forge-accent">
          {totalScore.toLocaleString()} pts
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-forge-surface rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-forge-accent to-forge-purple rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timer ring + question */}
      <div className="text-center mb-8 animate-slide-up" key={currentIndex}>
        {/* Timer */}
        <div className="flex items-center justify-center mb-6">
          <div className={`relative w-16 h-16 ${isUrgent ? 'animate-countdown-pulse' : ''}`}>
            <svg className="countdown-ring w-full h-full" viewBox="0 0 60 60">
              <circle
                cx="30" cy="30" r="26"
                fill="none"
                stroke="#1e1e30"
                strokeWidth="4"
              />
              <circle
                cx="30" cy="30" r="26"
                fill="none"
                stroke={isUrgent ? '#ef4444' : '#f97316'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - timerPercentage / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-bold text-lg font-body ${isUrgent ? 'text-forge-wrong' : 'text-white'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Question type badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forge-surface border border-forge-border text-xs text-white/40 font-body mb-4">
          {question.type === 'mcq' ? 'Multiple Choice' : 'True / False'}
          <span className="ml-1">
            {question.difficulty === 'easy' ? '🟢' : question.difficulty === 'medium' ? '🟡' : '🔴'}
          </span>
        </div>

        {/* Question text */}
        <h2 className="font-display font-bold text-xl md:text-2xl leading-snug max-w-2xl mx-auto">
          {question.question}
        </h2>
      </div>

      {/* Streak bonus popup */}
      {showStreakBonus && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-score-pop">
          <div className="px-4 py-2 rounded-xl bg-forge-accent text-white font-bold text-sm shadow-xl shadow-forge-accent/30">
            🔥 {streak} streak! +{Math.min(streak, 5) * 100} bonus
          </div>
        </div>
      )}

      {/* Options grid */}
      <div className={`grid gap-3 mb-6 ${question.type === 'true_false' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        {question.options.map((option, i) => {
          const color = OPTION_COLORS[i % OPTION_COLORS.length];
          const isSelected = selectedOption === i;
          const isCorrect = i === question.correctIndex;

          let cardStyle = `${color.bg} border ${color.border} ${color.hover}`;
          if (showAnswer) {
            if (isCorrect) {
              cardStyle = 'bg-forge-correct/20 border border-forge-correct';
            } else if (isSelected && !isCorrect) {
              cardStyle = 'bg-forge-wrong/20 border border-forge-wrong';
            } else {
              cardStyle = 'bg-forge-surface/30 border border-forge-border/30 opacity-50';
            }
          }

          return (
            <button
              key={i}
              onClick={() => !showAnswer && handleAnswer(i)}
              disabled={showAnswer}
              className={`
                option-card ${cardStyle}
                rounded-xl p-4 md:p-5 text-left transition-all duration-200
                ${!showAnswer ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg opacity-60">{color.shape}</span>
                <span className="font-display font-semibold text-sm md:text-base flex-1">
                  {option}
                </span>
                {showAnswer && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-forge-correct flex-shrink-0" />
                )}
                {showAnswer && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-forge-wrong flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      {showAnswer && (
        <div className="animate-slide-up">
          <div className="p-4 rounded-xl bg-forge-surface/80 border border-forge-border/50 mb-6">
            <p className="text-sm text-white/60 font-body leading-relaxed">
              <span className="text-white/80 font-semibold">Explanation: </span>
              {question.explanation}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10
              text-white font-display font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {currentIndex + 1 >= totalQuestions ? 'See Results' : 'Next Question'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
