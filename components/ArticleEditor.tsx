"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ArticleEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialMemo?: string;
  initialTags?: string[];
  articleId?: number;
  isNew?: boolean;
}

export default function ArticleEditor({
  initialTitle = "",
  initialContent = "",
  initialMemo = "",
  initialTags = [],
  articleId,
  isNew = false,
}: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [memo, setMemo] = useState(initialMemo);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !content) {
      alert("タイトルと本文は必須です");
      return;
    }

    setSaving(true);

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const body = {
        title,
        content,
        memo,
        tags: tagArray,
      };

      const url = isNew ? "/api/articles" : `/api/articles/${articleId}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        alert("保存しました");
        router.push(`/articles/${data.article.id}`);
      } else {
        alert("保存に失敗しました");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm("編集を破棄しますか?")) {
      router.back();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">
          {isNew ? "新規記事作成" : "記事編集"}
        </h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="記事のタイトル"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">メモ</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="記事のメモ（オプション）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            タグ（カンマ区切り）
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="例: AI, メモ, アイデア"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            本文（Markdown形式）
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 font-mono"
            rows={20}
            placeholder="# 見出し&#10;&#10;本文をMarkdown形式で記述してください..."
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
