"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ArticleEditor from "@/components/ArticleEditor";
import { Article } from "@/lib/db/types";

export const runtime = 'edge';

export default function EditArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`);
      const data = await response.json() as { article: Article };
      setArticle(data.article);
    } catch (error) {
      console.error("Failed to fetch article:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-lg font-semibold">記事編集</h1>
            <div className="w-8" />
          </div>
        </div>
        {loading ? (
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : article ? (
          <ArticleEditor
            initialTitle={article.title}
            initialContent={article.content}
            initialMemo={article.memo || ""}
            initialTags={article.tags?.map((t) => t.name) || []}
            articleId={article.id}
            isNew={false}
          />
        ) : (
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-gray-500">記事が見つかりませんでした</div>
          </div>
        )}
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
