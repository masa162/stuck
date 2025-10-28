"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Article } from "@/lib/db/types";

interface SidebarProps {
  onTagSelect?: (tagId: number | null) => void;
  selectedTagId?: number | null;
}

export default function Sidebar({ onTagSelect, selectedTagId: externalSelectedTagId }: SidebarProps = {}) {
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

  // 外部からタグが選択されている場合はそれを優先
  const activeTagId = externalSelectedTagId !== undefined ? externalSelectedTagId : selectedTagId;

  const filteredArticles = articles.filter((article) => {
    // 検索クエリでフィルタ
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    // タグでフィルタ
    const matchesTag =
      activeTagId === null ||
      (article.tags?.some((tag) => tag.id === activeTagId) ?? false);

    return matchesSearch && matchesTag;
  });

  const handleTagSelect = (tagId: number | null) => {
    if (onTagSelect) {
      onTagSelect(tagId);
    } else {
      setSelectedTagId(tagId);
    }
  };

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
        <Link href="/articles">
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors text-sm mb-2">
            記事一覧
          </button>
        </Link>
        <Link href="/tags">
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors text-sm mb-2">
            タグ一覧
          </button>
        </Link>
        <Link href="/search">
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors text-sm mb-2">
            検索
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
            onClick={() => handleTagSelect(null)}
            className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
              activeTagId === null
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
                onClick={() => handleTagSelect(tag.id)}
                className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
                  activeTagId === tag.id
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
