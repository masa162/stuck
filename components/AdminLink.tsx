"use client";

import { useRouter } from "next/navigation";

export default function AdminLink() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/admin/categories")}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
    >
      ⚙️ カテゴリ管理
    </button>
  );
}
