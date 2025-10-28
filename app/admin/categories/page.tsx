"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/db/types";

interface CategoryWithCount extends Category {
  article_count?: number;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    parent_id: null as number | null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json() as { categories: CategoryWithCount[] };

      // Fetch article counts for each category
      const categoriesWithCounts = await Promise.all(
        (data.categories || []).map(async (cat) => {
          const articlesRes = await fetch(`/api/articles?category_id=${cat.id}`);
          const articlesData = await articlesRes.json() as { articles?: any[] };
          return {
            ...cat,
            article_count: articlesData.articles?.length || 0
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert("カテゴリ名を入力してください");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ name: "", color: "#3b82f6", parent_id: null });
        setShowCreateForm(false);
        fetchCategories();
      } else {
        alert("カテゴリの作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("カテゴリの作成に失敗しました");
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim()) {
      alert("カテゴリ名を入力してください");
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, color: formData.color })
      });

      if (response.ok) {
        setEditingId(null);
        setFormData({ name: "", color: "#3b82f6", parent_id: null });
        fetchCategories();
      } else {
        alert("カテゴリの更新に失敗しました");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("カテゴリの更新に失敗しました");
    }
  };

  const handleDelete = async (id: number, articleCount: number) => {
    if (articleCount > 0) {
      if (!confirm(`このカテゴリには${articleCount}件の記事が紐づいています。削除すると記事のカテゴリは「未分類」になります。本当に削除しますか？`)) {
        return;
      }
    } else {
      if (!confirm("このカテゴリを削除しますか？")) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchCategories();
      } else {
        alert("カテゴリの削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("カテゴリの削除に失敗しました");
    }
  };

  const startEdit = (category: CategoryWithCount) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      color: category.color || "#3b82f6",
      parent_id: category.parent_id
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", color: "#3b82f6", parent_id: null });
  };

  const renderCategoryRow = (category: CategoryWithCount, level: number = 0) => {
    const isEditing = editingId === category.id;
    const children = categories.filter(c => c.parent_id === category.id);

    return (
      <div key={category.id}>
        <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-200 hover:bg-gray-50">
          <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-3 flex-1">
            {isEditing ? (
              <>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded"
                  autoFocus
                />
                <span className="text-sm text-gray-500 min-w-[60px] text-right">
                  {category.article_count || 0}件
                </span>
                <button
                  onClick={() => handleUpdate(category.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  保存
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: category.color || "#3b82f6" }}
                />
                <span className="flex-1 font-medium">{category.name}</span>
                <span className="text-sm text-gray-500 min-w-[60px] text-right">
                  {category.article_count || 0}件
                </span>
                <button
                  onClick={() => startEdit(category)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.article_count || 0)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  削除
                </button>
              </>
            )}
          </div>
        </div>
        {children.map(child => renderCategoryRow(child, level + 1))}
      </div>
    );
  };

  const rootCategories = categories.filter(c => !c.parent_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">カテゴリ管理</h1>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← TOPに戻る
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showCreateForm ? "キャンセル" : "+ 新規カテゴリ作成"}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">新規カテゴリ作成</h2>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">カラー</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-gray-600">カテゴリ名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="カテゴリ名を入力"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">親カテゴリ</label>
                <select
                  value={formData.parent_id || ""}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">なし（ルート）</option>
                  {rootCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 opacity-0">作成</label>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex items-center gap-3 py-3 px-4 bg-gray-100 border-b border-gray-200 font-semibold text-sm text-gray-700">
            <div className="w-8"></div>
            <div className="flex-1">カテゴリ名</div>
            <div className="min-w-[60px] text-right">記事数</div>
            <div className="w-[140px]">操作</div>
          </div>
          {rootCategories.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              カテゴリがありません
            </div>
          ) : (
            rootCategories.map(category => renderCategoryRow(category))
          )}
        </div>
      </div>
    </div>
  );
}
