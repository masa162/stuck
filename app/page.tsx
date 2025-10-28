"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Article } from "@/lib/db/types";

type SortColumn = "title" | "created_at" | "updated_at" | "memo";
type SortDirection = "asc" | "desc";

export default function Home() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/articles");
      const data = await response.json() as { articles: Article[] };
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // タグによるフィルタリングとソート
  const filteredAndSortedArticles = articles
    .filter((article) => {
      if (selectedTagId === null) return true;
      return article.tags?.some((tag) => tag.id === selectedTagId) ?? false;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortColumn) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "memo":
          aValue = (a.memo || "").toLowerCase();
          bValue = (b.memo || "").toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "updated_at":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // すべてのタグを抽出
  const allTags = articles
    .flatMap((a) => a.tags || [])
    .filter((tag, index, self) =>
      self.findIndex((t) => t.id === tag.id) === index
    );

  return (
    <div className="flex h-screen">
      <Sidebar onTagSelect={setSelectedTagId} selectedTagId={selectedTagId} />

      {/* メインコンテンツエリア */}
      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">記事一覧</h1>
            <div className="text-sm text-gray-500">
              {filteredAndSortedArticles.length}件
              {selectedTagId !== null && ` / 全${articles.length}件`}
            </div>
          </div>

          {loading ? (
            <div className="text-gray-500">読み込み中...</div>
          ) : filteredAndSortedArticles.length === 0 ? (
            <div className="text-gray-500">記事がありません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 table-fixed">
                <colgroup>
                  <col className="w-[40%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort("title")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                    >
                      タイトル {getSortIcon("title")}
                    </th>
                    <th
                      onClick={() => handleSort("memo")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                    >
                      メモ {getSortIcon("memo")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      タグ
                    </th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                    >
                      作成日時 {getSortIcon("created_at")}
                    </th>
                    <th
                      onClick={() => handleSort("updated_at")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                    >
                      更新日時 {getSortIcon("updated_at")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedArticles.map((article) => (
                    <tr
                      key={article.id}
                      onClick={() => router.push(`/articles/${article.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {article.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
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
                        <div className="text-sm text-gray-900">
                          {new Date(article.created_at).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(article.updated_at).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 右サイドバー（タグ一覧エリア） */}
      <aside className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">タグで絞り込み</h3>
        <div className="space-y-1">
          <div
            onClick={() => setSelectedTagId(null)}
            className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
              selectedTagId === null
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100 border border-gray-300"
            }`}
          >
            すべて ({articles.length})
          </div>
          {allTags.map((tag) => {
            const count = articles.filter((a) =>
              a.tags?.some((t) => t.id === tag.id)
            ).length;
            return (
              <div
                key={tag.id}
                onClick={() => setSelectedTagId(tag.id)}
                className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
                  selectedTagId === tag.id
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {tag.name} ({count})
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
