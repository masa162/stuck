import { Article, Tag } from "./types";

export interface Env {
  DB: D1Database;
}

export async function getArticles(db: D1Database): Promise<Article[]> {
  const { results } = await db
    .prepare(
      `
      SELECT * FROM articles
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `
    )
    .all();

  const articles = results as unknown as Article[];

  // 各記事のタグを取得
  for (const article of articles) {
    const { results: tags } = await db
      .prepare(
        `
        SELECT t.* FROM tags t
        INNER JOIN article_tags at ON t.id = at.tag_id
        WHERE at.article_id = ?
      `
      )
      .bind(article.id)
      .all();
    article.tags = tags as unknown as Tag[];
  }

  return articles;
}

export async function getArticleById(
  db: D1Database,
  id: number
): Promise<Article | null> {
  const { results } = await db
    .prepare("SELECT * FROM articles WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .all();

  if (results.length === 0) return null;

  const article = results[0] as unknown as Article;

  // タグを取得
  const { results: tags } = await db
    .prepare(
      `
      SELECT t.* FROM tags t
      INNER JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `
    )
    .bind(id)
    .all();

  article.tags = tags as unknown as Tag[];

  return article;
}

export async function createArticle(
  db: D1Database,
  data: { title: string; content: string; memo?: string; tags?: string[] }
): Promise<Article> {
  const { title, content, memo, tags } = data;

  // 記事を作成
  const { meta } = await db
    .prepare(
      "INSERT INTO articles (title, content, memo) VALUES (?, ?, ?)"
    )
    .bind(title, content, memo || null)
    .run();

  const articleId = meta.last_row_id;

  // タグを処理
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      // タグが存在するか確認
      let { results: existingTags } = await db
        .prepare("SELECT id FROM tags WHERE name = ?")
        .bind(tagName)
        .all();

      let tagId: number;
      if (existingTags.length > 0) {
        tagId = (existingTags[0] as unknown as { id: number }).id;
      } else {
        // 新しいタグを作成
        const tagResult = await db
          .prepare("INSERT INTO tags (name) VALUES (?)")
          .bind(tagName)
          .run();
        tagId = tagResult.meta.last_row_id!;
      }

      // 記事とタグを関連付け
      await db
        .prepare("INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)")
        .bind(articleId, tagId)
        .run();
    }
  }

  return (await getArticleById(db, articleId))!;
}

export async function updateArticle(
  db: D1Database,
  id: number,
  data: { title?: string; content?: string; memo?: string; tags?: string[] }
): Promise<Article | null> {
  const { title, content, memo, tags } = data;

  // 記事を更新
  await db
    .prepare(
      `
      UPDATE articles
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          memo = COALESCE(?, memo),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    )
    .bind(title || null, content || null, memo || null, id)
    .run();

  // タグを更新
  if (tags !== undefined) {
    // 既存のタグ関連を削除
    await db
      .prepare("DELETE FROM article_tags WHERE article_id = ?")
      .bind(id)
      .run();

    // 新しいタグを追加
    for (const tagName of tags) {
      let { results: existingTags } = await db
        .prepare("SELECT id FROM tags WHERE name = ?")
        .bind(tagName)
        .all();

      let tagId: number;
      if (existingTags.length > 0) {
        tagId = (existingTags[0] as unknown as { id: number }).id;
      } else {
        const tagResult = await db
          .prepare("INSERT INTO tags (name) VALUES (?)")
          .bind(tagName)
          .run();
        tagId = tagResult.meta.last_row_id!;
      }

      await db
        .prepare("INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)")
        .bind(id, tagId)
        .run();
    }
  }

  return await getArticleById(db, id);
}

export async function deleteArticle(
  db: D1Database,
  id: number
): Promise<boolean> {
  await db
    .prepare("UPDATE articles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();

  return true;
}

export async function getTrashedArticles(db: D1Database): Promise<Article[]> {
  const { results } = await db
    .prepare(
      `
      SELECT * FROM articles
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    `
    )
    .all();

  const articles = results as unknown as Article[];

  // 各記事のタグを取得
  for (const article of articles) {
    const { results: tags } = await db
      .prepare(
        `
        SELECT t.* FROM tags t
        INNER JOIN article_tags at ON t.id = at.tag_id
        WHERE at.article_id = ?
      `
      )
      .bind(article.id)
      .all();
    article.tags = tags as unknown as Tag[];
  }

  return articles;
}

export async function restoreArticle(
  db: D1Database,
  id: number
): Promise<boolean> {
  await db
    .prepare("UPDATE articles SET deleted_at = NULL WHERE id = ?")
    .bind(id)
    .run();

  return true;
}
