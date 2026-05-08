import Link from 'next/link';
import { parseRegion, parseGenre, cleanTitle as cleanTitleUtil } from '@/lib/utils';

interface MovieCardProps {
  id: number;
  title: string;
  cover?: string;
  year?: number;
  region?: string | string[];
  rating?: number;
  type?: string;
  genre?: string[];
  status?: string;
  episodes?: number;
  duration?: number;
  href: string;
}

export default function MovieCard({
  id,
  title,
  cover,
  year,
  region,
  rating,
  type,
  genre,
  status,
  episodes,
  duration,
  href,
}: MovieCardProps) {
  // Normalize region and genre using shared utils
  const regionArr = parseRegion(region);
  const genreArr = parseGenre(genre);
  // For cards: show only first region
  const regionDisplay = regionArr.length > 0 ? regionArr[0] : '';
  // Clean title
  const cleanTitle = cleanTitleUtil(title);
  const fallbackCover = `https://picsum.photos/seed/${id}/300/450`;

  // Build subtitle: year / region / genre
  const parts: string[] = [];
  if (year) parts.push(String(year));
  if (regionDisplay) parts.push(regionDisplay);
  if (genreArr.length > 0) parts.push(genreArr.slice(0, 2).join(','));

  // Duration or episode badge text
  let badgeText = '';
  if (type === 'movie' && duration) {
    badgeText = `${duration}分钟`;
  } else if (episodes && episodes > 0) {
    badgeText = `${episodes}集`;
  }

  return (
    <Link href={href} className="group block">
      <div
        className="rounded-xl overflow-hidden border card-hover"
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
          {/* Rating badge - top right */}
          {rating != null && (
            <span
              className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {rating.toFixed(1)}
            </span>
          )}
          {/* Status badge - top left */}
          {status && (
            <span
              className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-medium text-white"
              style={{
                backgroundColor:
                  status === '更新中' || status === '连载中'
                    ? '#f59e0b'
                    : status === '已完结'
                    ? '#6b7280'
                    : 'var(--accent)',
              }}
            >
              {status}
            </span>
          )}
          {/* Duration/Episode badge - bottom right, semi-transparent */}
          {badgeText && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium text-white bg-black/60 backdrop-blur-sm">
              {badgeText}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-2 md:p-3">
          {/* Title + Rating on same line */}
          <div className="flex items-center gap-1.5">
            <p
              className="font-medium text-xs md:text-sm truncate flex-1 min-w-0 group-hover:text-[var(--accent)] transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {cleanTitle}
            </p>
            {rating != null && (
              <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--accent)' }}>
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          {/* Year left / Region right */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{year || ''}</span>
            {regionDisplay && <span className="text-xs truncate ml-2" style={{ color: 'var(--text-muted)' }}>{regionDisplay}</span>}
          </div>
          {/* Genre line */}
          {genreArr.length > 0 && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {genreArr.slice(0, 3).join('/')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
