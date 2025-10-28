"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Category } from "@/lib/db/types";

interface SidebarProps {
  onCategorySelect?: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
}

export default function Sidebar({
  onCategorySelect,
  selectedCategoryId: externalSelectedCategoryId
}: SidebarProps = {}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json() as { categories: Category[] };
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // 外部から選択されている場合はそれを優先
  const activeCategoryId = externalSelectedCategoryId !== undefined ? externalSelectedCategoryId : selectedCategoryId;

  const handleCategorySelect = (categoryId: number | null) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      setSelectedCategoryId(categoryId);
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

      {/* 新規記事作成ボタン */}
      <div className="p-4 border-b border-gray-700">
        <Link href="/articles/new">
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors mb-2">
            新規記事作成
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
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors text-sm mb-2">
            ゴミ箱
          </button>
        </Link>
        <Link href="/admin">
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors text-sm">
            管理画面
          </button>
        </Link>
      </div>

      {/* カテゴリ一覧 */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold mb-2 text-gray-400">カテゴリ</h3>
        <div className="space-y-1">
          <div
            onClick={() => handleCategorySelect(null)}
            className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
              activeCategoryId === null
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-800"
            }`}
          >
            すべて
          </div>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors flex items-center ${
                activeCategoryId === category.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
