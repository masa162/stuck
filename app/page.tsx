"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Article, Category } from "@/lib/db/types";

type SortColumn = "title" | "created_at" | "updated_at" | "memo";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 20;

export default function Home() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json() as { categories: Category[] };
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
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

  // タグとカテゴリによるフィルタリングとソート
  const filteredAndSortedArticles = articles
    .filter((article) => {
      const matchesTag = selectedTagId === null || (article.tags?.some((tag) => tag.id === selectedTagId) ?? false);
      const matchesCategory = selectedCategoryId === null || article.category_id === selectedCategoryId;
      return matchesTag && matchesCategory;
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

  // ページネーション処理
  const totalPages = Math.ceil(filteredAndSortedArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = filteredAndSortedArticles.slice(startIndex, endIndex);

  // ページ変更時にトップへスクロール
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // タグ・カテゴリ変更時にページをリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTagId, selectedCategoryId, sortColumn, sortDirection]);

  return (
    <div className="flex h-screen">
      <Sidebar
        onTagSelect={setSelectedTagId}
        selectedTagId={selectedTagId}
        onCategorySelect={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
      />

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
            <>
              <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 table-fixed">
                <colgroup>
                  <col className="w-[35%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[13%]" />
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
                      カテゴリ
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
                  {paginatedArticles.map((article) => (
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
                        {article.category_id ? (
                          (() => {
                            const category = categories.find(c => c.id === article.category_id);
                            return category ? (
                              <span
                                className="inline-flex items-center px-2 py-1 text-xs rounded"
                                style={{ backgroundColor: category.color + '20', color: category.color }}
                              >
                                <span
                                  className="inline-block w-2 h-2 rounded-full mr-1"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </span>
                            ) : null;
                          })()
                        ) : (
                          <span className="text-xs text-gray-400">未分類</span>
                        )}
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

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  前へ
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // 最初、最後、現在のページ周辺のみ表示
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2);

                    if (!showPage) {
                      // 省略記号を表示（重複しないように）
                      if (page === currentPage - 3 || page === currentPage + 3) {
                        return (
                          <span key={page} className="px-3 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  次へ
                </button>

                <div className="ml-4 text-sm text-gray-600">
                  {currentPage} / {totalPages} ページ
                </div>
              </div>
            )}
          </>
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
