import { NextRequest, NextResponse } from "next/server";
import { getArticleById, updateArticle, deleteArticle, Env } from "@/lib/db/d1";
import { ArticleStorage } from "@/lib/storage";

export const runtime = 'edge';

// GET /api/articles/:id - Get article detail with content from R2
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const env = process.env as unknown as Env;

    if (!env.DB || !env.ARTICLES_BUCKET) {
      // Return mock data if DB or R2 is not available
      const mockArticle = {
        id,
        title: `Sample Article ${id}`,
        content: `# Sample Article ${id}\n\n## Section 1\n\nThis is sample content.\n\n## Section 2\n\nDetailed content goes here.`,
        content_key: `articles/${id}.md`,
        content_size: 100,
        content_hash: "mock-hash",
        memo: `Memo ${id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        tags: [{ id: 1, name: "sample", created_at: new Date().toISOString() }],
      };
      return NextResponse.json({ article: mockArticle });
    }

    const storage = new ArticleStorage({ bucket: env.ARTICLES_BUCKET });
    const article = await getArticleById(env.DB, storage, id);

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

// PUT /api/articles/:id - Update article with R2 storage
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

    if (!env.DB || !env.ARTICLES_BUCKET) {
      // Return mock response if DB or R2 is not available
      const updatedArticle = {
        id,
        title: title || `Sample Article ${id}`,
        content: content || "",
        content_key: `articles/${id}.md`,
        content_size: content ? new TextEncoder().encode(content).byteLength : 0,
        content_hash: "mock-hash",
        memo: memo || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        tags: tags || [],
      };
      return NextResponse.json({ article: updatedArticle });
    }

    const storage = new ArticleStorage({ bucket: env.ARTICLES_BUCKET });
    const article = await updateArticle(env.DB, storage, id, { title, content, memo, tags });

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

// DELETE /api/articles/:id - Soft delete article (R2 content preserved)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const env = process.env as unknown as Env;

    if (!env.DB) {
      // Return mock response if DB is not available
      return NextResponse.json({
        success: true,
        message: `Article ${id} moved to trash`
      });
    }

    const success = await deleteArticle(env.DB, id);

    if (!success) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

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
