"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ArticleEditor from "@/components/ArticleEditor";
import { Article } from "@/lib/db/types";

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
      <main className="flex-1 bg-white overflow-y-auto">
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
    </div>
  );
}
