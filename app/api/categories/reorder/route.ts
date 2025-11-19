import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages/next-dev";

export const runtime = 'edge';

/**
 * POST /api/categories/reorder - カテゴリの並び順を更新
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryIds } = body as { categoryIds: number[] };

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "カテゴリIDの配列が必要です" },
        { status: 400 }
      );
    }

    const env = getRequestContext().env;

    // 各カテゴリのdisplay_orderを更新
    for (let i = 0; i < categoryIds.length; i++) {
      await env.DB.prepare(
        "UPDATE categories SET display_order = ? WHERE id = ?"
      ).bind(i + 1, categoryIds[i]).run();
    }

    return NextResponse.json({ message: "並び順を更新しました" });
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return NextResponse.json(
      { error: "並び順の更新に失敗しました" },
      { status: 500 }
    );
  }
}
