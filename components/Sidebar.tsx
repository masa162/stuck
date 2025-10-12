"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Article } from "@/lib/db/types";

export default function Sidebar() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
    }
  };

  const filteredArticles = articles.filter((article) => {
    // 検索クエリでフィルタ
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());

    // タグでフィルタ
    const matchesTag =
      selectedTagId === null ||
      (article.tags?.some((tag) => tag.id === selectedTagId) ?? false);

    return matchesSearch && matchesTag;
  });

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* ロゴエリア - TOPページへのリンク */}
      <div className="p-4 border-b border-gray-700">
        <Link href="/" className="block hover:opacity-80 transition-opacity">
          <Image
            src="/images/stuck_logo.webp"
            alt="stuck - AI Knowledge Hub"
            width={110}
            height={110}
            className="w-full h-auto max-w-[110px] mx-auto"
            priority
          />
        </Link>
      </div>

      {/* 検索ボックス */}
      <div className="p-4 border-b border-gray-700">
        <input
          type="text"
          placeholder="検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 新規記事作成ボタン */}
      <div className="p-4 border-b border-gray-700">
        <Link href="/articles/new">
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors mb-2">
            新規記事作成
          </button>
        </Link>
        <Link href="/trash">
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors text-sm">
            ゴミ箱
          </button>
        </Link>
      </div>

      {/* タグ一覧 */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold mb-2 text-gray-400">タグ</h3>
        <div className="space-y-1">
          <div
            onClick={() => setSelectedTagId(null)}
            className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
              selectedTagId === null
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-800"
            }`}
          >
            すべて
          </div>
          {articles
            .flatMap((a) => a.tags || [])
            .filter((tag, index, self) =>
              self.findIndex((t) => t.id === tag.id) === index
            )
            .map((tag) => (
              <div
                key={tag.id}
                onClick={() => setSelectedTagId(tag.id)}
                className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
                  selectedTagId === tag.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                {tag.name}
              </div>
            ))}
        </div>
      </div>

      {/* 記事一覧 */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-400">記事一覧</h3>
        <div className="space-y-1">
          {filteredArticles.length === 0 ? (
            <div className="text-sm text-gray-500 px-2 py-1">
              記事がありません
            </div>
          ) : (
            filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="block text-sm hover:bg-gray-800 px-2 py-1 rounded cursor-pointer truncate"
              >
                {article.title}
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
