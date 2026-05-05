'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MovieDetail {
  id: number; title: string; cover: string; year: number; region: string;
  rating?: number; ratingImdb?: number; ratingRT?: number;
  summary: string; genre: string[]; director: string[]; actor: string[];
  language: string[]; duration?: number; releaseDate?: string; aka: string[];
}
interface Resource { id: number; title?: string; magnetUrl?: string; shareUrl?: string; resolution?: string; hasSubtitle?: boolean; storageName?: string; }

export default function MovieDetailClient({ movie, magnetResources, cloudResources }: {
  movie: MovieDetail; magnetResources: Resource[]; cloudResources: Resource[];
}) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'magnet' | 'cloud'>('magnet');
  const [qualityFilter, setQualityFilter] = useState('全部');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyLink = (url: string, resId: number) => {
    navigator.clipboard.writeText(url).then(() => { setCopiedId(resId); setTimeout(() => setCopiedId(null), 2000); });
  };

  const filteredMagnets = qualityFilter === '全部' ? magnetResources : magnetResources.filter(r =>
    r.resolution?.toLowerCase().includes(qualityFilter.toLowerCase()) || r.title?.toLowerCase().includes(qualityFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className="hover:opacity-80 active:opacity-60 transition-opacity" style={{ color: 'var(--text-secondary)' }}>首页</Link>
        <span>›</span>
        <Link href="/movie" className="hover:opacity-80 active:opacity-60 transition-opacity" style={{ color: 'var(--text-secondary)' }}>电影</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-primary)' }}>{movie.title}</span>
      </nav>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-48 md:w-64 shrink-0 mx-auto sm:mx-0 max-w-[256px]">
          <img src={movie.cover || `https://picsum.photos/seed/m${movie.id}/400/600`} alt={movie.title} className="w-full aspect-[2/3] object-cover rounded-xl" />
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {movie.title} {movie.year && <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>({movie.year})</span>}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {movie.rating != null && <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>豆瓣 {movie.rating.toFixed(1)}</span>}
            {movie.ratingImdb != null && <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#fefce8', color: '#ca8a04' }}>IMDB {movie.ratingImdb.toFixed(1)}</span>}
            {movie.ratingRT != null && <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>烂番茄 {movie.ratingRT}%</span>}
          </div>
          {movie.genre.length > 0 && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{movie.genre.join(' / ')}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
            {movie.director.length > 0 && <div className="text-sm"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>导演：</span><span style={{ color: 'var(--text-secondary)' }}>{movie.director.join(' / ')}</span></div>}
            {movie.language.length > 0 && <div className="text-sm"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>语言：</span><span style={{ color: 'var(--text-secondary)' }}>{movie.language.join(' / ')}</span></div>}
            {movie.actor.length > 0 && <div className="text-sm sm:col-span-2"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>主演：</span><span style={{ color: 'var(--text-secondary)' }}>{movie.actor.join(' / ')}</span></div>}
            {movie.duration && <div className="text-sm"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>片长：</span><span style={{ color: 'var(--text-secondary)' }}>约{movie.duration}分钟</span></div>}
            {movie.releaseDate && <div className="text-sm"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>上映日期：</span><span style={{ color: 'var(--text-secondary)' }}>{movie.releaseDate}</span></div>}
            {movie.region && <div className="text-sm"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>地区：</span><span style={{ color: 'var(--text-secondary)' }}>{movie.region}</span></div>}
          </div>
          {movie.aka.length > 0 && <div className="text-sm"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>又名：</span><span style={{ color: 'var(--text-muted)' }}>{movie.aka.join(' / ')}</span></div>}
        </div>
      </div>

      {movie.summary && (
        <section className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>剧集介绍</h2>
          <p className={`text-sm leading-relaxed ${synopsisExpanded ? '' : 'line-clamp-3'}`} style={{ color: 'var(--text-secondary)' }}>{movie.summary}</p>
          {movie.summary.length > 100 && (
            <button onClick={() => setSynopsisExpanded(!synopsisExpanded)} className="mt-2 text-sm font-medium active:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
              {synopsisExpanded ? '收起部分 ↑' : '展开全部 ↓'}
            </button>
          )}
        </section>
      )}

      <section className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>下载资源</h2>
        <div className="flex gap-6 border-b mb-4" style={{ borderColor: 'var(--border-color)' }}>
          {[{ key: 'magnet' as const, label: '磁力链接', count: magnetResources.length }, { key: 'cloud' as const, label: '网盘资源', count: cloudResources.length }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="pb-3 text-sm font-medium border-b-2 active:opacity-70 transition-all" style={{ color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)', borderColor: activeTab === tab.key ? 'var(--accent)' : 'transparent' }}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        {activeTab === 'magnet' && magnetResources.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {['全部', '4K', '1080P', '720P'].map(q => (
              <button key={q} onClick={() => setQualityFilter(q)} className="px-3 py-1 rounded-lg text-sm font-medium active:scale-95 transition-all" style={{ backgroundColor: qualityFilter === q ? 'var(--accent)' : 'var(--bg-primary)', color: qualityFilter === q ? '#fff' : 'var(--text-secondary)', border: qualityFilter === q ? 'none' : '1px solid var(--border-color)' }}>{q}</button>
            ))}
          </div>
        )}
        {activeTab === 'magnet' ? (
          filteredMagnets.length === 0 ? <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>暂无磁力链接</p> : (
            <div className="space-y-2">
              {filteredMagnets.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3 min-w-0 flex-1"><span className="text-lg shrink-0">🧲</span><div className="min-w-0 flex-1"><p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.title || '磁力链接'}</p>{r.resolution && <span className="px-1.5 py-0.5 rounded text-xs mt-0.5 inline-block" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{r.resolution}</span>}</div></div>
                  <button onClick={() => copyLink(r.magnetUrl || '', r.id)} className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-medium text-white active:scale-95 transition-all" style={{ backgroundColor: copiedId === r.id ? '#6b7280' : 'var(--accent)' }}>{copiedId === r.id ? '已复制 ✓' : '复制链接'}</button>
                </div>
              ))}
            </div>
          )
        ) : (
          cloudResources.length === 0 ? <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>暂无网盘资源</p> : (
            <div className="space-y-2">
              {cloudResources.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3 min-w-0 flex-1"><span className="text-lg shrink-0">☁️</span><div className="min-w-0 flex-1"><p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.title || '网盘资源'}</p>{r.storageName && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.storageName}</p>}</div></div>
                  <button onClick={() => copyLink(r.shareUrl || '', r.id)} className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-medium text-white active:scale-95 transition-all" style={{ backgroundColor: copiedId === r.id ? '#6b7280' : 'var(--accent)' }}>{copiedId === r.id ? '已复制 ✓' : '复制链接'}</button>
                </div>
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
}
