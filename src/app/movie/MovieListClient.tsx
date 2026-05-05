'use client';

import { useState, useEffect, useCallback } from 'react';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/Pagination';

const GENRES = ['全部', '剧情', '喜剧', '动作', '爱情', '科幻', '悬疑', '恐怖', '犯罪', '动画', '奇幻', '冒险'];
const YEARS = ['全部', '2026', '2025', '2024', '2023', '更早'];
const REGIONS = ['全部', '大陆', '美国', '日本', '韩国', '香港', '台湾'];
const SORT_OPTIONS = [{ label: '最新更新', value: 'latest' }, { label: '评分最高', value: 'rating' }, { label: '热度最高', value: 'hot' }];

interface ContentItem { id: number; title: string; cover: string; year: number; region: string; rating?: number; genre?: string[]; }

interface Props {
  initialItems: ContentItem[];
  initialTotal: number;
  contentType: string;
  apiBase: string; // e.g. '/api/movies'
}

export default function MovieListClient({ initialItems, initialTotal, contentType, apiBase }: Props) {
  const [items, setItems] = useState<ContentItem[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('全部');
  const [region, setRegion] = useState('全部');
  const [year, setYear] = useState('全部');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const fetchData = useCallback(async (p: number, g: string, r: string, y: string, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), size: '24' });
      if (g !== '全部') params.set('genre', g);
      if (r !== '全部') params.set('region', r);
      if (y !== '全部') params.set('year', y);
      if (s !== 'latest') params.set('sort', s);
      const res = await fetch(`${apiBase}?${params}`);
      const data = await res.json();
      const raw = data?.data?.records || data?.data || [];
      setItems(raw.map((m: any) => ({
        id: m.id,
        title: m.title,
        cover: m.posterUrl || m.cover || '',
        year: m.year || 0,
        region: Array.isArray(m.region) ? m.region[0] : (m.region || ''),
        rating: m.scoreDouban || m.scoreImdb || undefined,
        genre: Array.isArray(m.genre) ? m.genre : (m.genre ? JSON.parse(m.genre) : []),
      })));
      setTotal(data?.data?.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  // Initial load uses server-provided data, subsequent changes fetch client-side
  useEffect(() => {
    if (initialized) {
      fetchData(page, genre, region, year, sort);
    }
  }, [page, genre, region, year, sort, initialized, fetchData]);

  const updateFilter = (key: string, value: string) => {
    if (!initialized) setInitialized(true);
    setPage(1);
    if (key === 'genre') setGenre(value);
    else if (key === 'region') setRegion(value);
    else if (key === 'year') setYear(value);
    else if (key === 'sort') setSort(value);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {contentType === 'movie' ? '电影' : contentType === 'drama' ? '电视剧' : contentType === 'variety' ? '综艺' : contentType === 'anime' ? '动漫' : '短剧'}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map(g => (
          <button key={g} onClick={() => updateFilter('genre', g)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer active:scale-95"
            style={genre === g ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            {g}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map(r => (
          <button key={r} onClick={() => updateFilter('region', r)}
            className="px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer active:scale-95"
            style={region === r ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {YEARS.map(y => (
            <button key={y} onClick={() => updateFilter('year', y)}
              className="px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer active:scale-95"
              style={year === y ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              {y}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="h-9 px-3 rounded-full text-sm border outline-none cursor-pointer"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((item) => (
          <MovieCard key={item.id} id={item.id} title={item.title} cover={item.cover} year={item.year} region={item.region} rating={item.rating} type={contentType} href={`/${contentType}/${item.id}`} />
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>暂无数据</div>
      )}

      {total > 24 && <Pagination currentPage={page} totalPages={Math.ceil(total / 24)} onPageChange={handlePageChange} />}
    </div>
  );
}
