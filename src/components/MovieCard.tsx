import Link from 'next/link';

interface MovieCardProps {
  id: number;
  title: string;
  cover?: string;
  year?: number;
  region?: string;
  rating?: number;
  type?: string;
  genre?: string[];
  status?: string;
  episodes?: number;
  href: string;
  badge?: string;
  badgeColor?: string;
}

export default function MovieCard({
  id,
  title,
  cover,
  year,
  region,
  rating,
  genre,
  status,
  episodes,
  href,
  badge,
  badgeColor = 'var(--accent)',
}: MovieCardProps) {
  const fallbackCover = `https://picsum.photos/seed/${id}/300/450`;

  return (
    <Link href={href} className="group block">
      <div
        className="rounded-lg overflow-hidden border card-hover"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={cover || fallbackCover}
            alt={title}
            className="w-full h-full object-cover img-zoom"
            loading="lazy"
          />
          {/* Rating badge */}
          {rating != null && (
            <span
              className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {rating.toFixed(1)}
            </span>
          )}
          {/* Status badge */}
          {status && (
            <span
              className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-medium text-white"
              style={{
                backgroundColor:
                  status === '更新中' || status === '连载中'
                    ? '#f59e0b'
                    : status === '已完结'
                    ? '#6b7280'
                    : badgeColor,
              }}
            >
              {status}
            </span>
          )}
          {/* Custom badge */}
          {badge && !status && (
            <span
              className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: badgeColor }}
            >
              {badge}
            </span>
          )}
          {/* Quality badge */}
          <span
            className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-medium text-white bg-black/60"
          >
            4K/蓝光
          </span>
        </div>

        {/* Info */}
        <div className="p-3">
          <p
            className="font-medium text-sm truncate group-hover:text-[var(--accent)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {year}
            {region ? ` · ${region}` : ''}
            {episodes ? ` · ${episodes}集` : ''}
          </p>
          {/* Rating row */}
          {rating != null && (
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>
              豆瓣 {rating.toFixed(1)}
            </p>
          )}
          {/* Genre tags */}
          {genre && genre.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {genre.slice(0, 3).map((g, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
