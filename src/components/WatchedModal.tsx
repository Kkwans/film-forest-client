// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { listApi, type UserList } from '@/lib/userApi';

interface WatchedModalProps {
  open: boolean;
  onClose: () => void;
  movieId: number;
  contentType: string;
  movieTitle?: string;
}

const RATING_LEVELS = [
  { value: 1, label: '很差', color: '#6b7280' },
  { value: 2, label: '很差', color: '#6b7280' },
  { value: 3, label: '较差', color: '#6b7280' },
  { value: 4, label: '一般', color: '#3b82f6' },
  { value: 5, label: '还行', color: '#3b82f6' },
  { value: 6, label: '中等', color: '#2563eb' },
  { value: 7, label: '较好', color: '#16a34a' },
  { value: 8, label: '良好', color: '#16a34a' },
  { value: 9, label: '优秀', color: '#ea580c' },
  { value: 10, label: '神作', color: '#dc2626' },
];

export default function WatchedModal({ open, onClose, movieId, contentType, movieTitle }: WatchedModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [watchedListId, setWatchedListId] = useState<number | null>(null);
  // Use halfSteps internally: each step = 0.5, range 0-20
  const [halfSteps, setHalfSteps] = useState(0);
  const [hoverHalfSteps, setHoverHalfSteps] = useState(0);

  useEffect(() => {
    if (open) {
      setRating(0);
      setHoverRating(0);
      setNote('');
      setHalfSteps(0);
      setHoverHalfSteps(0);
      listApi.getAll().then(res => {
        const lists = res.data.data || res.data;
        const watched = Array.isArray(lists) ? lists.find((l: any) => l.type === 'watched') : null;
        if (watched) setWatchedListId(watched.id);
      }).catch(() => {});
    }
  }, [open]);

  // Sync halfSteps -> rating
  useEffect(() => { setRating(halfSteps * 0.5); }, [halfSteps]);
  useEffect(() => { setHoverRating(hoverHalfSteps * 0.5); }, [hoverHalfSteps]);

  const handleSave = async () => {
    if (!watchedListId) return;
    setSaving(true);
    try {
      await listApi.addItem(watchedListId, {
        movieId,
        contentType,
        rating: rating > 0 ? rating : undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } catch {} finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const displayRating = hoverRating || rating;
  const level = RATING_LEVELS.find(l => l.value === Math.ceil(displayRating)) || RATING_LEVELS[0];

  // Handle star click with mouse position detection for half-star precision
  const handleStarClick = (starIndex: number, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isRightHalf = x > rect.width / 2;
    const steps = starIndex * 2 + (isRightHalf ? 1 : 0);
    setHalfSteps(steps === halfSteps ? 0 : steps);
  };

  const handleStarHover = (starIndex: number, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isRightHalf = x > rect.width / 2;
    setHoverHalfSteps(starIndex * 2 + (isRightHalf ? 1 : 0));
  };

  // Render a single star with half-fill support
  const renderStar = (starIndex: number) => {
    const activeSteps = (hoverHalfSteps || halfSteps);
    const fillRatio = Math.max(0, Math.min(1, activeSteps / 2 - starIndex));
    const id = `star-clip-${starIndex}`;
    return (
      <button
        key={starIndex}
        onClick={(e) => handleStarClick(starIndex, e)}
        onMouseMove={(e) => handleStarHover(starIndex, e)}
        onMouseLeave={() => setHoverHalfSteps(0)}
        className="transition-transform hover:scale-110 active:scale-95"
        style={{ padding: '1px', lineHeight: 0 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24">
          <defs>
            <clipPath id={id}>
              <rect x="0" y="0" width={fillRatio * 24} height="24" />
            </clipPath>
          </defs>
          {/* Empty star background */}
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill="none" stroke={level.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Filled portion */}
          {fillRatio > 0 && (
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={level.color} stroke={level.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              clipPath={`url(#${id})`} />
          )}
        </svg>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border flex flex-col"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '75vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>标记看过</h3>
            {movieTitle && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{movieTitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full shrink-0" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Rating - Star rating with half-star precision */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>评分</label>

            {/* Stars - click left/right half for 0.5 precision */}
            <div className="flex items-center justify-center gap-0.5 mb-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(renderStar)}
            </div>

            {/* Rating value + label */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold tabular-nums" style={{ color: displayRating > 0 ? level.color : 'var(--text-muted)', minWidth: '2.5rem', textAlign: 'center' }}>
                {displayRating > 0 ? displayRating.toFixed(1) : '-'}
              </span>
              {displayRating > 0 && (
                <span className="text-sm px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${level.color}15`, color: level.color }}>
                  {level.label}
                </span>
              )}
            </div>
            <p className="text-center text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>点击星星或左右滑动选择分数（支持半星）</p>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>感想</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录一下看完的感受..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg text-sm border outline-none resize-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{note.length}/500</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-5 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>取消</button>
          <button onClick={handleSave} disabled={saving || !watchedListId} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--accent)' }}>
            {saving ? '保存中...' : '确认'}
          </button>
        </div>
      </div>
    </div>
  );
}
