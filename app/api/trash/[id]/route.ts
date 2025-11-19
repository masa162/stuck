import { NextRequest, NextResponse } from "next/server";
import { restoreArticle, Env } from "@/lib/db/d1";
import { getRequestContext } from "@cloudflare/next-on-pages/next-dev";

export const runtime = 'edge';

// POST /api/trash/:id - 記事を復元
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const env = getRequestContext().env as Env;

    if (!env.DB) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    await restoreArticle(env.DB, id);

    return NextResponse.json({
      success: true,
      message: `Article ${id} restored`
    });
  } catch (error) {
    console.error("Error restoring article:", error);
    return NextResponse.json(
      { error: "Failed to restore article" },
      { status: 500 }
    );
  }
}
