'use client';

import { QuizQuestion, QuizResult, QuizConfig } from '@/lib/types';
import { Trophy, Target, Clock, Zap, RotateCcw, Plus, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface Props {
  questions: QuizQuestion[];
  results: QuizResult[];
  config: QuizConfig;
  onRetry: () => void;
  onNewQuiz: () => void;
}

export default function ResultsStage({ questions, results, config, onRetry, onNewQuiz }: Props) {
  const totalScore = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const correctCount = results.filter((r) => r.correct).length;
  const skippedCount = results.filter((r) => r.selectedIndex === null).length;
  const accuracy = Math.round((correctCount / questions.length) * 100);
  const avgTime =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length).toFixed(1)
      : '0';

  // Max possible score (rough estimate)
  const maxScore = questions.length * 1500;
  const scorePercent = Math.min((totalScore / maxScore) * 100, 100);

  // Grade
  let grade = { label: 'Keep Studying', emoji: '📚', color: 'text-forge-wrong' };
  if (accuracy >= 90) grade = { label: 'Quiz Master!', emoji: '🏆', color: 'text-yellow-400' };
  else if (accuracy >= 75) grade = { label: 'Great Job!', emoji: '🔥', color: 'text-forge-accent' };
  else if (accuracy >= 60) grade = { label: 'Not Bad!', emoji: '👍', color: 'text-forge-blue' };
  else if (accuracy >= 40) grade = { label: 'Getting There', emoji: '💪', color: 'text-forge-purple' };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero score */}
      <div className="text-center mb-10 animate-slide-up">
        <div className="text-6xl mb-3">{grade.emoji}</div>
        <h2 className={`font-display font-extrabold text-3xl ${grade.color} mb-2`}>
          {grade.label}
        </h2>
        <div className="animate-score-pop">
          <span className="font-display font-black text-5xl text-white">
            {totalScore.toLocaleString()}
          </span>
          <span className="text-white/30 text-lg font-body ml-2">pts</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: 'text-forge-correct' },
          { icon: CheckCircle2, label: 'Correct', value: `${correctCount}/${questions.length}`, color: 'text-forge-accent' },
          { icon: Clock, label: 'Avg Time', value: `${avgTime}s`, color: 'text-forge-purple' },
          { icon: Zap, label: 'Best Streak', value: `${getBestStreak(results)}`, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-forge-surface/80 border border-forge-border/50 text-center animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <div className="font-display font-bold text-lg">{stat.value}</div>
            <div className="text-xs text-white/30 font-body">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div className="mb-10">
        <div className="flex justify-between text-xs text-white/30 font-body mb-2">
          <span>Score</span>
          <span>{Math.round(scorePercent)}%</span>
        </div>
        <div className="w-full h-3 bg-forge-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forge-accent via-forge-purple to-forge-blue rounded-full transition-all duration-1000"
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* Question review */}
      <h3 className="font-display font-bold text-lg mb-4">Question Review</h3>
      <div className="space-y-3 mb-10">
        {questions.map((q, i) => {
          const result = results[i];
          if (!result) return null;

          return (
            <details
              key={q.id}
              className="group rounded-xl bg-forge-surface/60 border border-forge-border/40 overflow-hidden"
            >
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                {result.correct ? (
                  <CheckCircle2 className="w-5 h-5 text-forge-correct flex-shrink-0" />
                ) : result.selectedIndex === null ? (
                  <MinusCircle className="w-5 h-5 text-white/30 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-forge-wrong flex-shrink-0" />
                )}
                <span className="font-display font-medium text-sm flex-1 text-left">
                  {q.question}
                </span>
                <span className="text-xs font-body text-white/30">
                  +{result.pointsEarned}
                </span>
              </summary>
              <div className="px-4 pb-4 pt-0 border-t border-forge-border/30 mt-0">
                <div className="mt-3 space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`text-xs font-body px-3 py-2 rounded-lg ${
                        oi === q.correctIndex
                          ? 'bg-forge-correct/15 text-forge-correct'
                          : oi === result.selectedIndex && !result.correct
                          ? 'bg-forge-wrong/15 text-forge-wrong line-through'
                          : 'text-white/30'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/40 font-body leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            </details>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10
            text-white font-display font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Retry Same Quiz
        </button>
        <button
          onClick={onNewQuiz}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-forge-accent to-orange-500
            text-white font-display font-bold flex items-center justify-center gap-2
            hover:shadow-lg hover:shadow-forge-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Quiz
        </button>
      </div>
    </div>
  );
}

function getBestStreak(results: QuizResult[]): number {
  let best = 0;
  let current = 0;
  for (const r of results) {
    if (r.correct) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}
