'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: '首页', href: '/', icon: '🏠' },
  { label: '分类', href: '/category', icon: '📂' },
  { label: '搜索', href: '/search', icon: '🔍' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/category') {
      return ['/category', '/movie', '/drama', '/variety', '/anime', '/short'].some(
        (p) => pathname.startsWith(p)
      );
    }
    if (href === '/search') return pathname.startsWith('/search');
    return false;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-14">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors"
            style={{
              color: isActive(tab.href) ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
