'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchApi } from '@/lib/api';
import Pagination from '@/components/Pagination';

interface SearchResult {
  id: number;
  type: 'movie' | 'drama' | 'variety' | 'anime' | 'short_drama';
  title: string;
  cover: string;
  year: number | null;
  rating: number | null;
  summary: string | null;
  director?: string[];
  actor?: string[];
  genre?: string[];
}

const TYPE_FILTERS = [
  { label: '全部', value: '' },
  { label: '电影', value: 'movie' },
  { label: '电视剧', value: 'drama' },
  { label: '综艺', value: 'variety' },
  { label: '动漫', value: 'anime' },
  { label: '短剧', value: 'short_drama' },
];

const SORT_OPTIONS = [
  { label: '最新更新', value: 'latest' },
  { label: '评分最高', value: 'rating' },
  { label: '热度最高', value: 'hot' },
];

const typeLabel: Record<string, string> = {
  movie: '电影',
  drama: '电视剧',
  variety: '综艺',
  anime: '动漫',
  short_drama: '短剧',
};

const typeHref: Record<string, string> = {
  movie: '/movie',
  drama: '/drama',
  variety: '/variety',
  anime: '/anime',
  short_drama: '/short',
};

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [keyword, setKeyword] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('latest');

  const doSearch = async (kw: string, page: number = 1) => {
    if (!kw.trim()) return;
    setLoading(true);
    setSearched(true);
    setCurrentPage(page);
    try {
      const res = await searchApi.search(kw, { page, size: 20 }) as any;
      const data = res.data?.data || {};
      setResults(data.records || []);
      setTotal(data.total || 0);
      setTotalPages(data.size ? Math.ceil(data.total / data.size) : 1);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setKeyword(q);
    if (q) doSearch(q, 1);
    else { setSearched(false); setResults([]); }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      doSearch(keyword.trim(), 1);
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  // Client-side filter
  const filteredResults = typeFilter
    ? results.filter((r) => r.type === typeFilter)
    : results;

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <div
        className="rounded-xl p-6 border"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="搜索影片、演员、导演..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 h-10 px-4 rounded-lg text-sm border outline-none"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            className="h-10 px-6 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            搜索
          </button>
        </form>
      </div>

      {/* Results info bar */}
      {searched && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            找到相关结果 <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{total}</span> 个
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Type filter tags */}
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTypeFilter(t.value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: typeFilter === t.value ? 'var(--accent)' : 'var(--bg-card)',
                    color: typeFilter === t.value ? '#ffffff' : 'var(--text-secondary)',
                    border: typeFilter === t.value ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-8 px-2 rounded-lg text-xs border outline-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : searched && filteredResults.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            没有找到「{initialQuery || keyword}」的相关结果
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>试试其他关键词？</p>
        </div>
      ) : filteredResults.length > 0 ? (
        <>
          <div className="space-y-3">
            {filteredResults.map((item) => {
              const href = `${typeHref[item.type] || '/movie'}/${item.id}`;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex gap-4 p-4 rounded-xl border transition-colors group"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {/* Thumbnail */}
                  <div className="shrink-0 w-20 h-28 rounded-lg overflow-hidden">
                    <img
                      src={item.cover || `https://picsum.photos/seed/${item.id}/80/120`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {item.title}
                          </h3>
                          {item.year && (
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({item.year})</span>
                          )}
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ border: '1px solid var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
                          >
                            {typeLabel[item.type] || item.type}
                          </span>
                        </div>

                        {/* Ratings */}
                        {item.rating != null && (
                          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--accent)' }}>
                            豆瓣 {item.rating.toFixed(1)}
                          </p>
                        )}

                        {/* Director/Actor */}
                        {(item.director || item.actor) && (
                          <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                            {item.director && item.director.length > 0 && `导演: ${item.director.join(', ')}`}
                            {item.director && item.director.length > 0 && item.actor && item.actor.length > 0 && ' | '}
                            {item.actor && item.actor.length > 0 && `主演: ${item.actor.join(', ')}`}
                          </p>
                        )}

                        {/* Genre */}
                        {item.genre && item.genre.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.genre.slice(0, 4).map((g, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Summary */}
                        {item.summary && (
                          <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {item.summary}
                          </p>
                        )}
                      </div>

                      {/* Action button */}
                      <Link
                        href={href}
                        className="shrink-0 px-4 py-2 rounded-lg text-white text-xs font-medium transition-colors hover:opacity-90"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        查看详情
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => doSearch(keyword, p)}
          />
        </>
      ) : !searched ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p className="text-4xl mb-3">🔍</p>
          <p>输入关键词开始搜索</p>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>加载中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
