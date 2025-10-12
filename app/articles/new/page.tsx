"use client";

import Sidebar from "@/components/Sidebar";
import ArticleEditor from "@/components/ArticleEditor";

export default function NewArticlePage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-white overflow-y-auto">
        <ArticleEditor isNew={true} />
      </main>
    </div>
  );
}
