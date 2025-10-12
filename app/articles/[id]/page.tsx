"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import { Article } from "@/lib/db/types";

export default function ArticlePage() {
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
      const data = await response.json();
      setArticle(data.article);
    } catch (error) {
      console.error("Failed to fetch article:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* メインコンテンツエリア */}
      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {loading ? (
            <div className="text-gray-500">読み込み中...</div>
          ) : article ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold">{article.title}</h1>
                  <Link href={`/articles/${article.id}/edit`}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      編集
                    </button>
                  </Link>
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

              <MarkdownRenderer content={article.content} />
            </>
          ) : (
            <div className="text-gray-500">記事が見つかりませんでした</div>
          )}
        </div>
      </main>

      {/* 右サイドバー（目次エリア） */}
      <aside className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-4 text-gray-700">目次</h3>
        {article ? (
          <TableOfContents content={article.content} />
        ) : (
          <p className="text-sm text-gray-500">記事を表示すると目次が表示されます</p>
        )}
      </aside>
    </div>
  );
}
