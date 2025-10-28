import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/db/d1";

export const runtime = 'edge';

/**
 * GET /api/search?q=検索キーワード - 記事を検索
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || "";

    const env = (process.env as any);
    const articles = await searchArticles(env.DB, {
      query,
      tags: tag ? [tag] : undefined,
    });

    return NextResponse.json({ articles, query });
  } catch (error) {
    console.error("Failed to search articles:", error);
    return NextResponse.json(
      { error: "記事の検索に失敗しました" },
      { status: 500 }
    );
  }
}
