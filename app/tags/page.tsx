"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Tag } from "@/lib/db/types";

interface TagWithCount extends Tag {
  article_count: number;
}

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json() as { tags: TagWithCount[] };
      setTags(data.tags || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* メインコンテンツエリア */}
      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">タグ一覧</h1>
            <div className="text-sm text-gray-500">{tags.length}個のタグ</div>
          </div>

          {loading ? (
            <div className="text-gray-500">読み込み中...</div>
          ) : tags.length === 0 ? (
            <div className="text-gray-500">タグがありません</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  onClick={() => router.push(`/?tag=${tag.id}`)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {tag.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {tag.article_count}件の記事
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {tag.article_count}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    作成: {new Date(tag.created_at).toLocaleDateString("ja-JP")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
