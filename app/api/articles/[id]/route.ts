import { NextRequest, NextResponse } from "next/server";

// GET /api/articles/:id - 記事詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // 開発中はモックデータを返す
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
    const body = await request.json();
    const { title, content, memo, tags } = body;

    // 開発中はモックレスポンスを返す
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

    // 開発中はモックレスポンスを返す
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
