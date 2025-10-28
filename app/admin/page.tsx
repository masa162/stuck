"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">管理画面</h1>

          <div className="grid gap-4">
            {/* カテゴリ管理カード */}
            <button
              onClick={() => router.push("/admin/categories")}
              className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                🏷️
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">カテゴリ管理</h2>
                <p className="text-gray-600 text-sm">
                  カテゴリの作成、編集、削除、並び替えができます
                </p>
              </div>
              <div className="text-gray-400">→</div>
            </button>

            {/* 将来の拡張用プレースホルダー */}
            <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-4 opacity-50">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                  ⚙️
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">その他の管理機能</h2>
                  <p className="text-gray-600 text-sm">
                    将来的にタグ管理や統計情報などを追加予定
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
