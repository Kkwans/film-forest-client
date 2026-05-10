// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';

interface NoteEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: string, rating?: number) => void;
  initialNote?: string;
  initialRating?: number;
  isWatchedList?: boolean;
  movieTitle?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: '屎', 2: '拉完了', 3: '拉完了', 4: '很差', 5: '很差',
  6: '还行', 7: '推荐', 8: '顶级', 9: '神作', 10: '神作',
};

function getRatingColor(r: number): string {
  if (r >= 9) return '#dc2626';
  if (r >= 8) return '#ea580c';
  if (r >= 7) return '#16a34a';
  if (r >= 6) return '#2563eb';
  if (r >= 4) return '#6b7280';
  return '#9ca3af';
}

export default function NoteEditModal({ open, onClose, onSave, initialNote = '', initialRating, isWatchedList = false, movieTitle }: NoteEditModalProps) {
  const [note, setNote] = useState(initialNote);
  const [rating, setRating] = useState<number>(initialRating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setNote(initialNote);
      setRating(initialRating || 0);
      setHoverRating(0);
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

  const STAR_W = 28;
  const STAR_GAP = 2;
  const STAR_COUNT = 10;
  const TOTAL_STAR_W = STAR_COUNT * STAR_W + (STAR_COUNT - 1) * STAR_GAP;

  const calcRatingFromX = (clientX: number) => {
    if (!starsRef.current) return 0;
    const rect = starsRef.current.getBoundingClientRect();
    const starsStart = rect.left + (rect.width - TOTAL_STAR_W) / 2;
    const x = clientX - starsStart;
    const ratio = Math.max(0, Math.min(1, x / TOTAL_STAR_W));
    return Math.round(ratio * 10 * 2) / 2;
  };

  if (!open) return null;

  const displayRating = hoverRating || rating;
  const levelColor = getRatingColor(Math.ceil(displayRating));

  const placeholders = isWatchedList
    ? ['记录一下看完的感受...', '分享你的观后感...']
    : ['想看的理由...', '为什么想看这部...'];
  const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border flex flex-col"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '75vh' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{isWatchedList ? '编辑' : '备注'}</h3>
            {movieTitle && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{movieTitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full shrink-0" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {isWatchedList && (
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>评分</label>
              <div ref={starsRef} className="flex items-center justify-center gap-0.5 cursor-pointer select-none touch-none"
                onClick={(e) => { const v = calcRatingFromX(e.clientX); setRating(v === rating ? 0 : v); }}
                onMouseMove={(e) => setHoverRating(calcRatingFromX(e.clientX))}
                onMouseLeave={() => setHoverRating(0)}
              >
                {[0,1,2,3,4,5,6,7,8,9].map(i => {
                  const fillRatio = Math.max(0, Math.min(1, (hoverRating || rating) / 2 - i));
                  const id = `note-edit-clip-${i}`;
                  return (
                    <svg key={i} width="28" height="28" viewBox="0 0 24 24">
                      <defs><clipPath id={id}><rect x="0" y="0" width={fillRatio * 24} height="24" /></clipPath></defs>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                        fill="none" stroke={levelColor} strokeWidth="1.5" />
                      {fillRatio > 0 && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                        fill={levelColor} stroke={levelColor} strokeWidth="1.5" clipPath={`url(#${id})`} />}
                    </svg>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-2xl font-bold tabular-nums" style={{ color: displayRating > 0 ? levelColor : 'var(--text-muted)' }}>
                  {displayRating > 0 ? displayRating.toFixed(1) : '-'}
                </span>
                {displayRating >= 0.5 && (
                  <span className="text-sm px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>
                    {RATING_LABELS[Math.ceil(displayRating)] || ''}
                  </span>
                )}
              </div>
              {rating > 0 && <button onClick={() => setRating(0)} className="block mx-auto text-xs mt-1" style={{ color: 'var(--text-muted)' }}>清除评分</button>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{isWatchedList ? '感想' : '备注'}</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={placeholder} rows={4} maxLength={500}
              className="w-full px-4 py-3 rounded-lg text-sm border outline-none resize-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} autoFocus />
            <div className="flex justify-end mt-1"><span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{note.length}/500</span></div>
          </div>
        </div>

        <div className="flex gap-3 justify-end px-5 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>取消</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--accent)' }}>{saving ? '保存中...' : '保存'}</button>
        </div>
      </div>
    </div>
  );
}
