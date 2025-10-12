import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* メインコンテンツエリア */}
      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4">stuck - AI Knowledge Hub</h1>
          <p className="text-gray-600 mb-6">
            AIとのチャット履歴、壁打ち内容、収集した情報の整理・閲覧・編集
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-500">記事を選択するか、新規記事を作成してください。</p>
          </div>
        </div>
      </main>

      {/* 右サイドバー（目次エリア） */}
      <aside className="w-64 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">目次</h3>
        <p className="text-sm text-gray-500">記事を表示すると目次が表示されます</p>
      </aside>
    </div>
  );
}
