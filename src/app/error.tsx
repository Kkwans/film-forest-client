"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Route Error]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>😵</div>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          color: "var(--text-primary)",
        }}
      >
        页面加载失败
      </h2>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
          marginBottom: "1.5rem",
          maxWidth: "28rem",
        }}
      >
        {error.message || "该页面遇到了意外错误，请尝试刷新"}
        {error.digest && (
          <span
            style={{
              display: "block",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
              opacity: 0.6,
            }}
          >
            错误ID: {error.digest}
          </span>
        )}
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "0.875rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          🔄 重试
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.875rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          🏠 回到首页
        </button>
      </div>
    </div>
  );
}
