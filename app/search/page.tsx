"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Article } from "@/lib/db/types";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setArticles([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json() as { articles: Article[] };
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to search articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* メインコンテンツエリア */}
      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6">記事を検索</h1>

          {/* 検索フォーム */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="タイトルや本文から検索..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                検索
              </button>
            </div>
          </form>

          {/* 検索結果 */}
          {loading ? (
            <div className="text-gray-500">検索中...</div>
          ) : searched ? (
            <>
              <div className="mb-4 text-sm text-gray-600">
                「{searchParams.get("q")}」の検索結果: {articles.length}件
              </div>

              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">該当する記事が見つかりませんでした</p>
                  <p className="text-gray-400 text-sm mt-2">別のキーワードで検索してみてください</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => router.push(`/articles/${article.id}`)}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
                    >
                      <h2 className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2">
                        {article.title}
                      </h2>

                      {article.memo && (
                        <p className="text-gray-600 text-sm mb-3">{article.memo}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex gap-2">
                            {article.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="ml-auto">
                          {new Date(article.created_at).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">キーワードを入力して検索してください</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 bg-white overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </main>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
