import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className="w-full py-6 mt-10 border-t hidden md:block"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <span>🌲</span>
            <span style={{ color: 'var(--text-secondary)' }}>影视森林</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">首页</Link>
            <Link href="/movie" className="hover:opacity-80 transition-opacity">电影</Link>
            <Link href="/drama" className="hover:opacity-80 transition-opacity">剧集</Link>
            <Link href="/variety" className="hover:opacity-80 transition-opacity">综艺</Link>
            <Link href="/anime" className="hover:opacity-80 transition-opacity">动漫</Link>
          </div>
          <p>© 2026 影视森林. 仅供学习交流.</p>
        </div>
      </div>
    </footer>
  );
}
