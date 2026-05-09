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

export default function WatchedModal({ open, onClose, movieId, contentType, movieTitle }: WatchedModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [watchedListId, setWatchedListId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setRating(0);
      setNote('');
      // Find watched list ID
      listApi.getAll().then(res => {
        const lists = res.data.data || res.data;
        const watched = Array.isArray(lists) ? lists.find((l: any) => l.type === 'watched') : null;
        if (watched) setWatchedListId(watched.id);
      }).catch(() => {});
    }
  }, [open]);

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

  const ratingLabels = ['', '很差', '较差', '一般', '还行', '中等', '较好', '良好', '优秀', '神作', '满分'];

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
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Rating - 10-point with 0.5 step */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>评分</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <span className="text-lg font-bold" style={{ color: rating > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {rating > 0 ? rating.toFixed(1) : '-'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/10</span>
              </div>
            </div>
            {rating > 0 && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{ratingLabels[Math.ceil(rating)] || ''}</p>}
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
