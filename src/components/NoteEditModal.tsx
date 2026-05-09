// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

interface NoteEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: string, rating?: number) => void;
  initialNote?: string;
  initialRating?: number;
  isWatchedList?: boolean;
  movieTitle?: string;
}

export default function NoteEditModal({ open, onClose, onSave, initialNote = '', initialRating, isWatchedList = false, movieTitle }: NoteEditModalProps) {
  const [note, setNote] = useState(initialNote);
  const [rating, setRating] = useState<number>(initialRating || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNote(initialNote);
      setRating(initialRating || 0);
    }
  }, [open, initialNote, initialRating]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(note, isWatchedList && rating > 0 ? rating : undefined);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const placeholders = isWatchedList
    ? ['记录一下看完的感受...', '分享你的观后感...', '这部作品给你什么启发...']
    : ['想看的理由...', '为什么想看这部...', '期待什么...'];

  const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

  // 10-point rating with 0.5 step
  const ratingLabels = ['', '很差', '较差', '一般', '还行', '中等', '较好', '良好', '优秀', '神作', '满分'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border flex flex-col"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '75vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isWatchedList ? '编辑' : '备注'}
            </h3>
            {movieTitle && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{movieTitle}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full shrink-0" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Rating - only for watched list, 10-point scale with 0.5 step */}
          {isWatchedList && (
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
              {rating > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {ratingLabels[Math.ceil(rating)] || ''}
                </p>
              )}
              {rating > 0 && (
                <button onClick={() => setRating(0)} className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>清除评分</button>
              )}
            </div>
          )}

          {/* Note input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              {isWatchedList ? '感想' : '备注'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={placeholder}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg text-sm border outline-none resize-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{note.length}/500</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-5 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
