"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Article } from "@/lib/db/types";

export const runtime = 'edge';

type SortColumn = "title" | "created_at" | "updated_at" | "memo";
type SortDirection = "asc" | "desc";

export default function ArticlesListPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

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
      // 同じカラムをクリックしたら方向を反転
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // 新しいカラムは降順から開始
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // フィルタリングとソート
  const filteredAndSortedArticles = articles
    .filter((article) => {
      if (!dateFrom && !dateTo) return true;

      const createdDate = new Date(article.created_at);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;

      if (from && createdDate < from) return false;
      if (to) {
        // 終了日は23:59:59まで含める
        const toEnd = new Date(to);
        toEnd.setHours(23, 59, 59, 999);
        if (createdDate > toEnd) return false;
      }

      return true;
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

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedArticles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedArticles.map((a) => a.id)));
    }
  };

  const handleMoveToTrash = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`選択した${selectedIds.size}件の記事をゴミ箱に移動しますか?`)) {
      return;
    }

    setDeleting(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/articles/${id}`, {
          method: "DELETE",
        })
      );
      await Promise.all(promises);

      // 記事リストを再取得
      await fetchArticles();
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Failed to delete articles:", error);
      alert("記事の削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">記事一覧</h1>
            <div className="flex items-center gap-4">
              {selectedIds.size > 0 && (
                <button
                  onClick={handleMoveToTrash}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm"
                >
                  {deleting ? "削除中..." : `選択した${selectedIds.size}件をゴミ箱へ`}
                </button>
              )}
              <div className="text-sm text-gray-500">
                {filteredAndSortedArticles.length}件 / 全{articles.length}件
              </div>
            </div>
          </div>

          {/* 日付フィルター */}
          <div className="mb-6 flex gap-4 items-center bg-gray-50 p-4 rounded">
            <label className="text-sm font-medium text-gray-700">
              投稿日時:
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="開始日"
            />
            <span className="text-gray-500">〜</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="終了日"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                クリア
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-gray-500">読み込み中...</div>
          ) : filteredAndSortedArticles.length === 0 ? (
            <div className="text-gray-500">記事がありません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredAndSortedArticles.length && filteredAndSortedArticles.length > 0}
                        onChange={handleSelectAll}
                        className="cursor-pointer w-4 h-4"
                      />
                    </th>
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
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(article.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(article.id);
                          }}
                          className="cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => router.push(`/articles/${article.id}`)}
                      >
                        <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {article.title}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => router.push(`/articles/${article.id}`)}
                      >
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {article.memo || "-"}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => router.push(`/articles/${article.id}`)}
                      >
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
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => router.push(`/articles/${article.id}`)}
                      >
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
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => router.push(`/articles/${article.id}`)}
                      >
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
    </div>
  );
}
