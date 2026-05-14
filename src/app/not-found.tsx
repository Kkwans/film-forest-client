"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="flex items-center justify-center min-h-[60vh]"
      style={{ color: "var(--text-primary)" }}
    >
      <div className="text-center max-w-md mx-auto px-4">
        {/* 404 Number */}
        <div
          className="text-8xl font-bold mb-4"
          style={{ color: "var(--accent)", opacity: 0.3 }}
        >
          404
        </div>

        {/* Icon + Title */}
        <div className="mb-4">
          <span className="text-5xl mb-3 block">🎬</span>
          <h1
            className="text-2xl font-bold mt-3"
            style={{ color: "var(--text-primary)" }}
          >
            页面走丢了
          </h1>
        </div>

        {/* Description */}
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          你要找的影视资源可能已被下架，或者链接地址有误。
          <br />
          试试从首页重新搜索吧！
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
            style={{ backgroundColor: "var(--accent)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent)")
            }
          >
            🏠 回到首页
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-color)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")
            }
          >
            ← 返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
