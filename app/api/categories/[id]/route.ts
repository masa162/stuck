import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages/next-dev";

export const runtime = 'edge';

/**
 * PUT /api/categories/[id] - カテゴリを更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json() as { name: string; color?: string };
    const { name, color } = body;

    const env = getRequestContext().env;

    await env.DB.prepare(
      `UPDATE categories
       SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(name, color || '#6B7280', id).run();

    return NextResponse.json({ message: "カテゴリを更新しました" });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      { error: "カテゴリの更新に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id] - カテゴリを削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const env = getRequestContext().env;

    // カテゴリを削除（CASCADE設定により子カテゴリも削除される）
    // 記事のcategory_idはSET NULLされる
    await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();

    return NextResponse.json({ message: "カテゴリを削除しました" });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { error: "カテゴリの削除に失敗しました" },
      { status: 500 }
    );
  }
}
