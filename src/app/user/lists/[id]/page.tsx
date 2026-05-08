// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';
import { listApi, type UserList, type UserListItem } from '@/lib/userApi';
import Pagination from '@/components/Pagination';

const contentTypeRoute: Record<string, string> = {
  movie: '/movie',
  drama: '/drama',
  variety: '/variety',
  anime: '/anime',
  short_drama: '/short',
};

const typeLabel: Record<string, string> = {
  movie: '电影', drama: '电视剧', variety: '综艺', anime: '动漫', short_drama: '短剧',
};

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const listId = Number(params.id);

  const [list, setList] = useState<UserList | null>(null);
  const [items, setItems] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?from=/user/lists/' + listId);
      return;
    }
    loadList();
  }, [isAuthenticated, listId]);

  const loadList = async (page = 1) => {
    setLoading(true);
    try {
      const allRes = await listApi.getAll();
      const allLists: UserList[] = allRes.data.data || allRes.data;
      const found = allLists.find((l) => l.id === listId);
      if (found) setList(found);

      const itemsRes = await listApi.getItems(listId, { page, size: 20 });
      const data = itemsRes.data.data || itemsRes.data;
      setItems(data.records || data || []);
      setCurrentPage(page);
      setTotalPages(data.size ? Math.ceil(data.total / data.size) : 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item: UserListItem) => {
    setRemoving(item.id);
    try {
      await listApi.removeItem(listId, { movieId: item.movieId, contentType: item.contentType });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (list) setList({ ...list, itemCount: Math.max(0, list.itemCount - 1) });
    } catch {
      // silent
    } finally {
      setRemoving(null);
    }
  };

  if (!isAuthenticated) return null;

  const fallbackCover = (id: number) => `https://picsum.photos/seed/${id}/120/180`;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link href="/profile" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
          我的
        </Link>
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        <span style={{ color: 'var(--text-primary)' }}>{list?.name || '片单'}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {list?.name || '片单'}
        </h1>
        {list?.description && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {list.description}
          </p>
        )}
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          共 {list?.itemCount ?? items.length} 部
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="w-[80px] h-[110px] rounded-lg shrink-0" style={{ backgroundColor: 'var(--border-color)' }} />
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 w-2/3 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
                <div className="h-3 w-1/3 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            片单还是空的，去发现更多影视吧
          </p>
          <Link
            href="/"
            className="inline-block mt-3 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            去首页看看 <svg className="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      ) : (
        <>
          {/* List layout - like search results */}
          <div className="space-y-2">
            {items.map((item) => {
              const route = contentTypeRoute[item.contentType] || '/movie';
              const href = `${route}/${item.movieId}`;
              return (
                <div
                  key={item.id}
                  className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-colors hover:shadow-md group relative"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {/* Poster */}
                  <Link href={href} className="shrink-0">
                    <img
                      src={item.cover || fallbackCover(item.movieId)}
                      alt={item.title || ''}
                      className="w-[80px] h-[110px] md:w-[100px] md:h-[140px] object-cover rounded-lg"
                      loading="lazy"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <Link
                        href={href}
                        className="font-bold text-sm md:text-base hover:text-[var(--accent)] transition-colors line-clamp-1 no-underline"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.title || '未知标题'}
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Type badge */}
                        <span className="px-1.5 py-0.5 rounded text-[10px] md:text-xs" style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                          {typeLabel[item.contentType] || item.contentType}
                        </span>
                        {item.year && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.year}</span>}
                        {/* Douban rating */}
                        {item.rating && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                            豆瓣 {Number(item.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                      {/* User rating (看过评分) */}
                      {item.userRating != null && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>我的评分:</span>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={star <= Math.round(item.userRating / 2) ? '#f59e0b' : 'none'} stroke={star <= Math.round(item.userRating / 2) ? '#f59e0b' : 'var(--text-muted)'} strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                            <span className="text-xs font-bold ml-1" style={{ color: 'var(--accent)' }}>{Number(item.userRating).toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                      {/* Note (备注) */}
                      {item.note && (
                        <div className="mt-1.5 flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                          <p className="text-xs italic line-clamp-2" style={{ color: 'var(--text-muted)' }}>{item.note}</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom: added time + remove */}
                    <div className="flex items-center justify-between mt-2">
                      {item.addedAt && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          收藏于 {new Date(item.addedAt).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                      <button
                        onClick={() => handleRemove(item)}
                        disabled={removing === item.id}
                        className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors opacity-0 group-hover:opacity-100"
                        style={{
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-muted)',
                        }}
                        title="从片单移除"
                      >
                        {removing === item.id ? '移除中...' : '移除'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => loadList(p)}
            />
          )}
        </>
      )}
    </div>
  );
}
