"use client";

export default function ScrollTop() {
  return (
    <button
      aria-label="ページ先頭へ戻る"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-4 right-4 z-30 px-3 py-2 rounded-full shadow bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
      ↑
    </button>
  );
}


