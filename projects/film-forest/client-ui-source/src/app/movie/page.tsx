import MovieListClient from './MovieListClient';

interface ContentItem { id: number; title: string; cover: string; year: number; region: string; rating?: number; genre?: string[]; }

function mapItem(m: any): ContentItem {
  return {
    id: m.id, title: m.title, cover: m.posterUrl || '', year: m.year || 0,
    region: Array.isArray(m.region) ? m.region[0] : (m.region || ''),
    rating: m.scoreDouban || m.scoreImdb || undefined,
    genre: Array.isArray(m.genre) ? m.genre : (m.genre ? JSON.parse(m.genre) : []),
  };
}

async function fetchMovies() {
  try {
    const res = await fetch('http://localhost:8080/api/movies?page=1&size=24', { cache: 'no-store' });
    const data = await res.json();
    const raw = data?.data?.records || [];
    return { items: raw.map(mapItem), total: data?.data?.total || 0 };
  } catch { return { items: [], total: 0 }; }
}

export default async function MoviePage() {
  const { items, total } = await fetchMovies();
  return <MovieListClient initialItems={items} initialTotal={total} contentType="movie" apiBase="/api/movies" />;
}
