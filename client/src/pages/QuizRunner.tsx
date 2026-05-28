import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { useToastStore } from '../store/toastStore';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import {
  Clock, ArrowLeft, ChevronLeft, ChevronRight, Check, X,
  Bookmark, Award, CheckCircle2, RefreshCw, BarChart2
} from 'lucide-react';
import { cn } from '../lib/utils';

export const QuizRunner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show: showToast } = useToastStore();

  const {
    currentQuiz, isQuizActive, currentQuestionIndex,
    answers, timeRemaining, quizResult,
    selectAnswer, nextQuestion, prevQuestion,
    submitQuiz, startQuiz, endQuizSession,
    toggleBookmark, bookmarkedQuestionIds, fetchBookmarks
  } = useQuizStore();

  const [checkingAnswer, setCheckingAnswer] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  useEffect(() => {
    if (!isQuizActive) return;
    let tickCount = 0;
    const interval = setInterval(() => {
      useQuizStore.setState((state) => {
        if (state.timeRemaining <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return { timeRemaining: 0 };
        }
        
        tickCount += 1;
        // Save progress in background every 10 seconds
        if (tickCount % 10 === 0) {
          setTimeout(() => {
            useQuizStore.getState().saveActiveProgress();
          }, 0);
        }
        
        return { timeRemaining: state.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isQuizActive]);

  const handleAutoSubmit = async () => {
    showToast('Time expired! Auto-submitting.', 'warning');
    try { await submitQuiz(); } catch { showToast('Auto-submission error.', 'error'); }
  };

  const handleManualSubmit = async () => {
    try {
      setSubmitting(true);
      await submitQuiz();
      showToast('Quiz submitted!', 'success');
    } catch {
      showToast('Could not submit.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerWarning = timeRemaining < 60;

  if (!currentQuiz) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const questions = currentQuiz.questions;

  // ─── Results ────────────────────────────────────────────────────────────────
  if (!isQuizActive && quizResult) {
    const totalQ = quizResult.total_questions;
    const score = quizResult.score;
    const pct = Math.round(quizResult.accuracy);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Result hero */}
        <div className="relative overflow-hidden rounded-xl border border-violet-500/15 dark:border-violet-500/10 bg-[#0f0f0f] p-8 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_60%)]" />
          <div className="relative max-w-lg mx-auto flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Award className="w-7 h-7 text-amber-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-zinc-100">Quiz Complete!</h1>
              <p className="text-xs text-zinc-500 mt-1">{currentQuiz.title}</p>
            </div>

            {/* Scorecards */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="w-28 h-28 rounded-full border border-violet-500/20 bg-violet-500/8 flex flex-col items-center justify-center gap-0.5">
                <span className="text-2xl font-bold text-zinc-100">{score}/{totalQ}</span>
                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Score</span>
              </div>
              <div className="w-28 h-28 rounded-full border border-emerald-500/20 bg-emerald-500/8 flex flex-col items-center justify-center gap-0.5">
                <span className="text-2xl font-bold text-emerald-400">{pct}%</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Accuracy</span>
              </div>
              <div className="w-28 h-28 rounded-full border border-blue-500/20 bg-blue-500/8 flex flex-col items-center justify-center gap-0.5">
                <span className="text-lg font-bold text-zinc-200">{Math.floor(quizResult.time_taken / 60)}m {quizResult.time_taken % 60}s</span>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Time</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/quizzes')}>Browse Quizzes</Button>
              <Button onClick={() => startQuiz(currentQuiz.id)}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retake
              </Button>
            </div>
          </div>
        </div>

        {/* Solutions review */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Solutions & Explanations</h2>
          </div>

          {questions.map((q, idx) => {
            const selected = answers[q.id];
            const isCorrect = selected === q.correct_answer;
            const isBookmarked = bookmarkedQuestionIds.has(q.id);

            return (
              <Card key={q.id} className={cn(
                'border-l-2',
                isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
              )}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-600 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 leading-relaxed">{q.question}</p>
                  </div>
                  <button
                    onClick={() => toggleBookmark(q.id)}
                    className={cn(
                      'p-1.5 rounded-md border transition-colors shrink-0',
                      isBookmarked
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'border-zinc-200 dark:border-white/[0.07] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
                    )}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { label: q.option_a, key: 'A' },
                      { label: q.option_b, key: 'B' },
                      { label: q.option_c, key: 'C' },
                      { label: q.option_d, key: 'D' },
                    ].map((opt) => {
                      const isCorrectOpt = opt.key === q.correct_answer;
                      const isStudentOpt = opt.key === selected;
                      return (
                        <div
                          key={opt.key}
                          className={cn(
                            'p-3 rounded-lg border flex items-center gap-2 text-xs',
                            isCorrectOpt
                              ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                              : isStudentOpt
                                ? 'bg-rose-500/8 border-rose-500/20 text-rose-700 dark:text-rose-400'
                                : 'border-zinc-200/60 dark:border-white/[0.05] text-zinc-600 dark:text-zinc-500'
                          )}
                        >
                          <span className="font-bold text-[10px] w-4 shrink-0">{opt.key}.</span>
                          <span className="flex-1">{opt.label}</span>
                          {isCorrectOpt && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {isStudentOpt && !isCorrectOpt && <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className={cn(
                    'p-3 rounded-lg border flex gap-2 text-xs',
                    isCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-500/5 border-rose-500/15 text-rose-700 dark:text-rose-400'
                  )}>
                    {isCorrect
                      ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      : <X className="w-4 h-4 shrink-0 mt-0.5" />
                    }
                    <span>
                      <strong>{isCorrect ? 'Correct.' : 'Incorrect.'}</strong>{' '}
                      Your answer: <strong>{selected || 'Unanswered'}</strong>. Correct: <strong>{q.correct_answer}</strong>.
                    </span>
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04] text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Explanation</span>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Active Quiz ─────────────────────────────────────────────────────────────
  const currentQ = questions[currentQuestionIndex];
  const selectedOption = answers[currentQ?.id];
  const isBookmarkedActive = bookmarkedQuestionIds.has(currentQ?.id);
  const showFeedback = checkingAnswer[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { endQuizSession(); navigate('/quizzes'); }}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Quiz
        </button>

        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-colors',
          timerWarning
            ? 'bg-rose-500/8 border-rose-500/20 text-rose-500'
            : 'bg-zinc-50 dark:bg-[#141414] border-zinc-200 dark:border-white/[0.07] text-zinc-900 dark:text-zinc-200'
        )}>
          <Clock className={cn('w-3.5 h-3.5', timerWarning && 'animate-pulse')} />
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-semibold text-zinc-500 dark:text-zinc-600">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">
              Q{currentQuestionIndex + 1}
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5 leading-relaxed">
              {currentQ.question}
            </h2>
          </div>
          <button
            onClick={() => toggleBookmark(currentQ.id)}
            className={cn(
              'p-1.5 rounded-md border transition-colors shrink-0',
              isBookmarkedActive
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'border-zinc-200 dark:border-white/[0.07] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
            )}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Options */}
          <div className="flex flex-col gap-2">
            {[
              { key: 'A', label: currentQ.option_a },
              { key: 'B', label: currentQ.option_b },
              { key: 'C', label: currentQ.option_c },
              { key: 'D', label: currentQ.option_d },
            ].map((opt) => {
              const isSelected = selectedOption === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => selectAnswer(currentQ.id, opt.key as any)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-lg border text-sm transition-all flex items-center gap-3 active:scale-[0.99]',
                    isSelected
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300'
                      : 'border-zinc-200/70 dark:border-white/[0.06] bg-zinc-50 dark:bg-transparent text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.03]'
                  )}
                >
                  <span className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border shrink-0',
                    isSelected
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-zinc-300 dark:border-white/[0.1] text-zinc-500 dark:text-zinc-500 bg-white dark:bg-transparent'
                  )}>
                    {opt.key}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Instant feedback */}
          {selectedOption && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCheckingAnswer((prev) => ({ ...prev, [currentQuestionIndex]: !prev[currentQuestionIndex] }))}
                className="text-[11px]"
              >
                {showFeedback ? 'Hide explanation' : 'Check answer'}
              </Button>

              {showFeedback && (
                <div className={cn(
                  'p-3.5 rounded-lg border text-xs space-y-2 animate-fade-in',
                  selectedOption === currentQ.correct_answer
                    ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/5 border-rose-500/15 text-rose-700 dark:text-rose-400'
                )}>
                  <div className="flex items-start gap-2">
                    {selectedOption === currentQ.correct_answer
                      ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      : <X className="w-4 h-4 shrink-0 mt-0.5" />
                    }
                    <span>
                      <strong>{selectedOption === currentQ.correct_answer ? 'Correct!' : 'Incorrect.'}</strong>{' '}
                      Correct answer: <strong>{currentQ.correct_answer}</strong>.
                    </span>
                  </div>
                  {currentQ.explanation && (
                    <div className="pt-2 border-t border-current/10">
                      <p className="leading-relaxed opacity-80">{currentQ.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentQuestionIndex === 0}
          onClick={prevQuestion}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button size="sm" onClick={nextQuestion} className="ml-auto">
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleManualSubmit}
            isLoading={submitting}
            className="ml-auto bg-emerald-600 hover:bg-emerald-500"
          >
            Submit Quiz
            <Check className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
