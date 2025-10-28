import { NextRequest, NextResponse } from "next/server";
import { Category } from "@/lib/db/types";

export const runtime = 'edge';

/**
 * GET /api/categories - すべてのカテゴリを取得
 */
export async function GET(request: NextRequest) {
  try {
    const env = (process.env as any);
    const { results } = await env.DB.prepare(
      `SELECT id, name, parent_id, color, display_order, created_at, updated_at
       FROM categories
       ORDER BY display_order ASC, name ASC`
    ).all();

    const categories = results as unknown as Category[];
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "カテゴリの取得に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories - 新しいカテゴリを作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name: string; parent_id?: number | null; color?: string };
    const { name, parent_id, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "カテゴリ名は必須です" },
        { status: 400 }
      );
    }

    const env = (process.env as any);

    // 最大のdisplay_orderを取得
    const { results: orderResults } = await env.DB.prepare(
      "SELECT MAX(display_order) as max_order FROM categories"
    ).all();
    const maxOrder = (orderResults[0] as any)?.max_order || 0;

    const result = await env.DB.prepare(
      `INSERT INTO categories (name, parent_id, color, display_order)
       VALUES (?, ?, ?, ?)`
    ).bind(
      name,
      parent_id || null,
      color || '#6B7280',
      maxOrder + 1
    ).run();

    const categoryId = result.meta.last_row_id;

    return NextResponse.json({
      id: categoryId,
      message: "カテゴリを作成しました"
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "カテゴリの作成に失敗しました" },
      { status: 500 }
    );
  }
}
