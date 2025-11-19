import { NextRequest, NextResponse } from "next/server";
import { getTrashedArticles, Env } from "@/lib/db/d1";
import { getRequestContext } from "@cloudflare/next-on-pages/next-dev";

export const runtime = 'edge';

// GET /api/trash - ゴミ箱の記事一覧取得
export async function GET(request: NextRequest) {
  try {
    const env = getRequestContext().env as Env;

    if (!env.DB) {
      // DBが利用できない場合は空配列を返す
      return NextResponse.json({ articles: [] });
    }

    const articles = await getTrashedArticles(env.DB);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching trashed articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch trashed articles" },
      { status: 500 }
    );
  }
}
