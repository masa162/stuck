import { NextRequest, NextResponse } from "next/server";
import { getArticles, createArticle, Env } from "@/lib/db/d1";

export const runtime = 'edge';

// GET /api/articles - 記事一覧取得
export async function GET(request: NextRequest) {
  try {
    const env = process.env as unknown as Env;

    if (!env.DB) {
      // DBが利用できない場合はモックデータを返す
      const mockArticles = [
        {
          id: 1,
          title: "サンプル記事1",
          content: "# サンプル記事1\n\nこれはサンプルの記事です。",
          memo: "メモ1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          tags: [{ id: 1, name: "サンプル", created_at: new Date().toISOString() }],
        },
        {
          id: 2,
          title: "サンプル記事2",
          content: "# サンプル記事2\n\n## セクション1\n\nこれは2つ目のサンプルです。",
          memo: "メモ2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          tags: [{ id: 2, name: "テスト", created_at: new Date().toISOString() }],
        },
      ];
      return NextResponse.json({ articles: mockArticles });
    }

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

// POST /api/articles - 新規記事作成
export async function POST(request: NextRequest) {
  try {
    const env = process.env as unknown as Env;
    const body = await request.json();
    const { title, content, memo, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    if (!env.DB) {
      // DBが利用できない場合はモックレスポンスを返す
      const newArticle = {
        id: Date.now(),
        title,
        content,
        memo: memo || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        tags: tags || [],
      };
      return NextResponse.json({ article: newArticle }, { status: 201 });
    }

    const article = await createArticle(env.DB, { title, content, memo, tags });
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
