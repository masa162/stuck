import { NextRequest, NextResponse } from "next/server";
import { getAllTags } from "@/lib/db/d1";

export const runtime = 'edge';

/**
 * GET /api/tags - すべてのタグを取得
 */
export async function GET(request: NextRequest) {
  try {
    const env = (process.env as any);
    const tags = await getAllTags(env.DB);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return NextResponse.json(
      { error: "タグの取得に失敗しました" },
      { status: 500 }
    );
  }
}
