"use client";

export default function ScrollTop() {
  return (
    <button
      aria-label="ページ先頭へ戻る"
      onClick={() => {
        try {
          // ウィンドウ自体をスクロール
          window.scrollTo({ top: 0, behavior: "smooth" });

          // コンテンツ側でスクロールを持っているコンテナもスクロール
          const scrollables = document.querySelectorAll<HTMLElement>('[class*="overflow-y-auto"], [class*="overflow-auto"]');
          scrollables.forEach((el) => {
            el.scrollTo({ top: 0, behavior: "smooth" });
          });
        } catch (_) {
          // フォールバック
          window.scrollTo(0, 0);
          const scrollables = document.querySelectorAll<HTMLElement>('[class*="overflow-y-auto"], [class*="overflow-auto"]');
          scrollables.forEach((el) => {
            el.scrollTop = 0;
          });
        }
      }}
      className="fixed bottom-4 right-4 z-30 px-3 py-2 rounded-full shadow bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
      ↑
    </button>
  );
}


