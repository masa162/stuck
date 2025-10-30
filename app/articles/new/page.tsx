"use client";

import Sidebar from "@/components/Sidebar";
import ArticleEditor from "@/components/ArticleEditor";

export default function NewArticlePage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* デスクトップ用サイドバー */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 bg-white overflow-y-auto">
        {/* モバイルヘッダー */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              aria-label="メニュー"
              className="p-2 rounded border border-gray-300"
              onClick={() => setMobileSidebarOpen(true)}
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold">新規記事作成</h1>
            <div className="w-8" />
          </div>
        </div>

        <ArticleEditor isNew={true} />
      </main>

      {/* モバイル用ドロワー */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-gray-900 shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}
