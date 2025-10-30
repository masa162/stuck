"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import { Article } from "@/lib/db/types";

export const runtime = 'edge';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
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

  const handleDelete = async () => {
    if (!article) return;

    if (!confirm("この記事をゴミ箱に移動しますか？")) return;

    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("記事をゴミ箱に移動しました");
        router.push("/");
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました");
    }
  };

  const handleExportMarkdown = () => {
    if (!article) return;

    // フロントマターを生成
    const frontmatter = [
      "---",
      `title: "${article.title}"`,
      article.tags && article.tags.length > 0
        ? `tags: [${article.tags.map((t) => `"${t.name}"`).join(", ")}]`
        : "",
      article.memo ? `memo: "${article.memo}"` : "",
      `created_at: "${article.created_at}"`,
      `updated_at: "${article.updated_at}"`,
      "---",
      "",
    ]
      .filter((line) => line !== "")
      .join("\n");

    // Markdownコンテンツを結合
    const markdownContent = `${frontmatter}${article.content}`;

    // Blobを作成してダウンロード
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.title.replace(/[/\\?%*:|"<>]/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* デスクトップ用サイドバー */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* メインコンテンツエリア */}
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
            <h1 className="text-lg font-semibold">記事詳細</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {loading ? (
            <div className="text-gray-500">読み込み中...</div>
          ) : article ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>ID: {article.id}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(article.id.toString());
                          const btn = event?.target as HTMLButtonElement;
                          const originalText = btn.textContent;
                          btn.textContent = "✓";
                          setTimeout(() => { btn.textContent = originalText; }, 1000);
                        }}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs transition-colors"
                      >
                        コピー
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportMarkdown}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      MD出力
                    </button>
                    <Link href={`/articles/${article.id}/edit`}>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        編集
                      </button>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      削除
                    </button>
                  </div>
                </div>
                {article.memo && (
                  <p className="text-sm text-gray-500 mb-2">{article.memo}</p>
                )}
                <div className="flex gap-2 mb-4">
                  {article.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  作成日: {new Date(article.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>

              <MarkdownRenderer content={article.content || ''} />
            </>
          ) : (
            <div className="text-gray-500">記事が見つかりませんでした</div>
          )}
        </div>
      </main>

      {/* 右サイドバー（目次エリア） */}
      <aside className="hidden md:block w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-4 text-gray-700">目次</h3>
        {article && article.content ? (
          <TableOfContents content={article.content} />
        ) : (
          <p className="text-sm text-gray-500">記事を表示すると目次が表示されます</p>
        )}
      </aside>

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
