"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Article } from "@/lib/db/types";

export const runtime = 'edge';

export default function TrashPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrashedArticles();
  }, []);

  const fetchTrashedArticles = async () => {
    try {
      const response = await fetch("/api/trash");
      const data = await response.json() as { articles: Article[] };
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to fetch trashed articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm("この記事を復元しますか？")) return;

    try {
      const response = await fetch(`/api/trash/${id}`, {
        method: "POST",
      });

      if (response.ok) {
        alert("記事を復元しました");
        // リストから削除
        setArticles(articles.filter((a) => a.id !== id));
      } else {
        alert("復元に失敗しました");
      }
    } catch (error) {
      console.error("Restore error:", error);
      alert("復元に失敗しました");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6">ゴミ箱</h1>

          {loading ? (
            <div className="text-gray-500">読み込み中...</div>
          ) : articles.length === 0 ? (
            <div className="text-gray-500">ゴミ箱は空です</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      タイトル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      メモ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      タグ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      削除日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {article.memo || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {article.tags?.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {article.deleted_at
                            ? new Date(article.deleted_at).toLocaleDateString(
                                "ja-JP"
                              )
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRestore(article.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          復元
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
