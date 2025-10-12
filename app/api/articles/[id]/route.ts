import { NextRequest, NextResponse } from "next/server";
import { getArticleById, updateArticle, deleteArticle, Env } from "@/lib/db/d1";

export const runtime = 'edge';

// GET /api/articles/:id - 記事詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const env = process.env as unknown as Env;

    if (!env.DB) {
      // DBが利用できない場合はモックデータを返す
      const mockArticle = {
        id,
        title: `サンプル記事${id}`,
        content: `# サンプル記事${id}\n\n## セクション1\n\nこれはサンプルの記事内容です。\n\n## セクション2\n\n詳細な内容がここに入ります。`,
        memo: `メモ${id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        tags: [{ id: 1, name: "サンプル", created_at: new Date().toISOString() }],
      };
      return NextResponse.json({ article: mockArticle });
    }

    const article = await getArticleById(env.DB, id);

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT /api/articles/:id - 記事更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const env = process.env as unknown as Env;
    const body = await request.json() as { title?: string; content?: string; memo?: string; tags?: string[] };
    const { title, content, memo, tags } = body;

    if (!env.DB) {
      // DBが利用できない場合はモックレスポンスを返す
      const updatedArticle = {
        id,
        title: title || `サンプル記事${id}`,
        content: content || "",
        memo: memo || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        tags: tags || [],
      };
      return NextResponse.json({ article: updatedArticle });
    }

    const article = await updateArticle(env.DB, id, { title, content, memo, tags });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/:id - 記事削除（ゴミ箱へ移動）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const env = process.env as unknown as Env;

    if (!env.DB) {
      // DBが利用できない場合はモックレスポンスを返す
      return NextResponse.json({
        success: true,
        message: `Article ${id} moved to trash`
      });
    }

    await deleteArticle(env.DB, id);

    return NextResponse.json({
      success: true,
      message: `Article ${id} moved to trash`
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
