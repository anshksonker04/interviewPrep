import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookmarkService } from '../services/api';
import { Bookmark } from '../types';
import { useToastStore } from '../store/toastStore';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { Bookmark as BookmarkIcon, Search, Trash2, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { show: showToast } = useToastStore();

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const data = await bookmarkService.getBookmarks();
      setBookmarks(data.bookmarks);
    } catch {
      showToast('Could not fetch bookmarks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  const handleRemoveBookmark = async (qId: number) => {
    try {
      await bookmarkService.toggleBookmark(qId);
      showToast('Bookmark removed.', 'success');
      setBookmarks((prev) => prev.filter((b) => b.question_id !== qId));
    } catch {
      showToast('Could not remove bookmark.', 'error');
    }
  };

  const topicsList = [
    { label: 'All Topics', value: '' },
    { label: 'DBMS', value: 'DBMS' },
    { label: 'Operating Systems', value: 'Operating Systems' },
    { label: 'Computer Networks', value: 'Computer Networks' },
    { label: 'OOPs', value: 'OOPs' },
    { label: 'Aptitude', value: 'Aptitude' },
    { label: 'Java', value: 'Java' },
    { label: 'Python', value: 'Python' },
    { label: 'DSA', value: 'DSA' },
  ];

  const filteredBookmarks = bookmarks.filter((b) => {
    if (!b.question) return false;
    const matchSearch = b.question.question.toLowerCase().includes(search.toLowerCase());
    const matchTopic = topic === '' || b.question.quiz_topic === topic;
    return matchSearch && matchTopic;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Bookmarks</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
          Review questions you saved during quiz sessions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-[34px] text-zinc-400 w-4 h-4" />
            <Input
              label="Search"
              type="text"
              placeholder="Filter by keyword..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-4">
            <Select label="Topic" options={topicsList} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Count badge */}
      {!loading && filteredBookmarks.length > 0 && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-600">
          Showing <span className="font-semibold text-zinc-700 dark:text-zinc-400">{filteredBookmarks.length}</span> saved question{filteredBookmarks.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filteredBookmarks.length > 0 ? (
        <div className="space-y-3">
          {filteredBookmarks.map((b) => {
            const q = b.question;
            const isExpanded = expandedId === b.id;

            return (
              <Card key={b.id} className={cn('transition-all duration-200', isExpanded && 'border-violet-500/20 dark:border-violet-500/15')}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="badge-blue px-2 py-0.5 rounded text-[10px] font-bold">{q.quiz_topic}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-500 border border-zinc-200/60 dark:border-white/[0.05]">
                        {q.quiz_difficulty}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600 truncate hidden sm:inline">
                        {q.quiz_title}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 leading-snug">{q.question}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    >
                      {isExpanded ? 'Hide' : 'Show Answer'}
                    </Button>
                    <button
                      onClick={() => handleRemoveBookmark(q.id)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-500/8 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-3 border-t border-zinc-100 dark:border-white/[0.04] animate-fade-in space-y-3">
                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { label: q.option_a, key: 'A' },
                        { label: q.option_b, key: 'B' },
                        { label: q.option_c, key: 'C' },
                        { label: q.option_d, key: 'D' },
                      ].map((opt) => {
                        const isCorrect = opt.key === q.correct_answer;
                        return (
                          <div
                            key={opt.key}
                            className={cn(
                              'p-3 rounded-lg border flex items-center gap-2 text-xs',
                              isCorrect
                                ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/15 dark:text-emerald-400'
                                : 'border-zinc-200/60 dark:border-white/[0.05] text-zinc-600 dark:text-zinc-500'
                            )}
                          >
                            <span className="font-bold text-[10px] shrink-0 w-4">{opt.key}.</span>
                            <span className="flex-1">{opt.label}</span>
                            {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 rounded-lg bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04] text-xs">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Explanation</span>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border border-dashed border-zinc-200 dark:border-white/[0.06]">
          <CardContent className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-zinc-400">
              <BookmarkIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No bookmarks yet</h3>
            <p className="text-xs text-zinc-500 max-w-xs">Bookmark questions during a quiz to review them here later.</p>
            <Button size="sm" onClick={() => navigate('/quizzes')} className="mt-2">Explore Quizzes</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
