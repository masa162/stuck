import { NextRequest, NextResponse } from "next/server";
import { getArticles, createArticle, Env } from "@/lib/db/d1";
import { ArticleStorage } from "@/lib/storage";

export const runtime = 'edge';

// GET /api/articles - Get article list (metadata only, optimized)
export async function GET(request: NextRequest) {
  try {
    const env = process.env as unknown as Env;

    if (!env.DB) {
      // Return mock data if DB is not available
      const mockArticles = [
        {
          id: 1,
          title: "Sample Article 1",
          content_key: null,
          content_size: null,
          content_hash: null,
          memo: "Memo 1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          tags: [{ id: 1, name: "sample", created_at: new Date().toISOString() }],
        },
      ];
      return NextResponse.json({ articles: mockArticles });
    }

    // Fetch metadata only (no content)
    const articles = await getArticles(env.DB);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create new article with R2 storage
export async function POST(request: NextRequest) {
  try {
    const env = process.env as unknown as Env;
    const body = await request.json() as { title: string; content: string; memo?: string; tags?: string[]; category_id?: number | null };
    const { title, content, memo, tags, category_id } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    if (!env.DB || !env.ARTICLES_BUCKET) {
      // Return mock response if DB or R2 is not available
      const newArticle = {
        id: Date.now(),
        title,
        content_key: `articles/${Date.now()}.md`,
        content_size: new TextEncoder().encode(content).byteLength,
        content_hash: "mock-hash",
        memo: memo || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        tags: tags || [],
      };
      return NextResponse.json({ article: newArticle }, { status: 201 });
    }

    const storage = new ArticleStorage({ bucket: env.ARTICLES_BUCKET });
    const articleId = await createArticle(env.DB, storage, { title, content, memo, tags, category_id });

    return NextResponse.json({ id: articleId }, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      {
        error: "Failed to create article",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
