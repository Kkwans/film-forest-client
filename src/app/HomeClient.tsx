'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';

interface ContentItem {
  id: number;
  title: string;
  cover: string;
  year: number;
  region: string;
  rating?: number;
  genre?: string[];
  status?: string;
  episodes?: number;
}

function HorizontalSection({ title, href, items, type }: { title: string; href: string; items: ContentItem[]; type: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -600 : 600, behavior: 'smooth' });
  };
  if (items.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <Link href={href} className="text-sm hover:underline transition-colors" style={{ color: 'var(--accent)' }}>查看更多 →</Link>
      </div>
      <div className="relative group/scroll">
        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>‹</button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[140px] sm:w-[160px]" style={{ scrollSnapAlign: 'start' }}>
              <MovieCard id={item.id} title={item.title} cover={item.cover} year={item.year} region={item.region} rating={item.rating} type={type} href={`/${type}/${item.id}`} />
            </div>
          ))}
        </div>
        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>›</button>
      </div>
    </section>
  );
}

export default function HomeClient({ initialMovies, initialDramas, initialVarieties, initialAnimes, initialShorts }: {
  initialMovies: ContentItem[]; initialDramas: ContentItem[]; initialVarieties: ContentItem[]; initialAnimes: ContentItem[]; initialShorts: ContentItem[];
}) {
  const heroMovie = initialMovies.length > 0 ? initialMovies[0] : null;
  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', border: '1px solid var(--border-color)' }}>
        <div className="relative px-6 py-10 md:px-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>影视资源聚合平台</div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
              发现精彩<span style={{ color: 'var(--accent)' }}>影视世界</span>
            </h1>
            <p className="text-base md:text-lg mb-6 md:mb-8" style={{ color: 'var(--text-secondary)' }}>聚合全网优质影视资源，电影、剧集、综艺、动漫一网打尽</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/movie" className="inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-colors text-sm text-white" style={{ background: 'var(--accent)' }}>探索电影</Link>
              <Link href="/search" className="inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-colors text-sm" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>搜索影视</Link>
            </div>
          </div>
        </div>
      </section>

      <HorizontalSection title="热门电影" href="/movie" items={initialMovies} type="movie" />
      <HorizontalSection title="热播剧集" href="/drama" items={initialDramas} type="drama" />
      <HorizontalSection title="热门综艺" href="/variety" items={initialVarieties} type="variety" />
      <HorizontalSection title="最新动漫" href="/anime" items={initialAnimes} type="anime" />
      <HorizontalSection title="短剧推荐" href="/short" items={initialShorts} type="short" />
    </div>
  );
}
