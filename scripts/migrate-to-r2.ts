/**
 * Migration Script: Move existing article content from D1 to R2
 *
 * This script migrates all existing articles with content in the D1 database
 * to R2 storage, updating the D1 records with R2 metadata.
 *
 * Usage:
 * 1. Deploy this as a temporary worker:
 *    npx wrangler deploy scripts/migrate-to-r2.ts --name stuck-migration --compatibility-date=2024-01-01
 * 2. Trigger migration via HTTP:
 *    curl https://stuck-migration.belong2jazz.workers.dev
 * 3. Delete the worker after completion:
 *    npx wrangler delete stuck-migration
 */

interface Env {
  DB: D1Database;
  ARTICLES_BUCKET: R2Bucket;
}

interface ArticleRow {
  id: number;
  title: string;
  content: string;
  content_key: string | null;
}

async function calculateHash(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function migrateArticlesToR2(env: Env): Promise<string> {
  const startTime = Date.now();
  let output = '=== Article Migration to R2 ===\n\n';

  try {
    // 1. Find articles with content but no R2 key
    const { results } = await env.DB.prepare(`
      SELECT id, title, content, content_key
      FROM articles
      WHERE content IS NOT NULL AND content_key IS NULL
    `).all();

    const articles = results as unknown as ArticleRow[];
    output += `Found ${articles.length} articles to migrate\n\n`;

    if (articles.length === 0) {
      output += 'No articles to migrate. All content is already in R2.\n';
      return output;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const article of articles) {
      try {
        output += `[${article.id}] Migrating: ${article.title}\n`;

        // 2. Save content to R2
        const key = `articles/${article.id}.md`;
        const buffer = new TextEncoder().encode(article.content);
        const hash = await calculateHash(buffer);

        await env.ARTICLES_BUCKET.put(key, buffer, {
          httpMetadata: {
            contentType: 'text/markdown; charset=utf-8',
          },
          customMetadata: {
            articleId: article.id.toString(),
            hash,
            migratedAt: new Date().toISOString(),
          },
        });

        // 3. Update D1 with R2 metadata
        const { meta } = await env.DB.prepare(`
          UPDATE articles
          SET content_key = ?, content_size = ?, content_hash = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(key, buffer.byteLength, hash, article.id).run();

        if (meta.changes > 0) {
          successCount++;
          output += `  ✓ Success: ${key} (${buffer.byteLength} bytes, hash: ${hash.substring(0, 16)}...)\n`;
        } else {
          errorCount++;
          errors.push(`Article ${article.id}: D1 update failed (no changes)`);
          output += `  ✗ Failed: D1 update had no effect\n`;
        }
      } catch (error) {
        errorCount++;
        const errorMsg = `Article ${article.id}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        output += `  ✗ Error: ${errorMsg}\n`;
      }
    }

    // 4. Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    output += `\n=== Migration Complete ===\n`;
    output += `Total articles: ${articles.length}\n`;
    output += `Successful: ${successCount}\n`;
    output += `Failed: ${errorCount}\n`;
    output += `Duration: ${duration}s\n`;

    if (errors.length > 0) {
      output += `\nErrors:\n`;
      errors.forEach(err => {
        output += `  - ${err}\n`;
      });
    }

    // 5. Verify migration
    output += `\n=== Verification ===\n`;
    const { results: verifyResults } = await env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN content_key IS NOT NULL THEN 1 ELSE 0 END) as migrated,
        SUM(CASE WHEN content IS NOT NULL AND content_key IS NULL THEN 1 ELSE 0 END) as remaining
      FROM articles
    `).all();

    const stats = verifyResults[0] as any;
    output += `Total articles: ${stats.total}\n`;
    output += `Migrated to R2: ${stats.migrated}\n`;
    output += `Remaining in D1: ${stats.remaining}\n`;

    if (stats.remaining === 0) {
      output += `\n✓ All articles successfully migrated to R2!\n`;
    } else {
      output += `\n⚠ Warning: ${stats.remaining} articles still have content in D1\n`;
    }

  } catch (error) {
    output += `\n✗ Fatal error during migration: ${error instanceof Error ? error.message : String(error)}\n`;
  }

  return output;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed. Use GET to trigger migration.', {
        status: 405,
      });
    }

    // Dry run mode for testing
    if (url.searchParams.get('dry-run') === 'true') {
      const { results } = await env.DB.prepare(`
        SELECT id, title, LENGTH(content) as content_size
        FROM articles
        WHERE content IS NOT NULL AND content_key IS NULL
        LIMIT 10
      `).all();

      return new Response(
        JSON.stringify({
          message: 'Dry run mode - these articles would be migrated:',
          articles: results,
        }, null, 2),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Run actual migration
    const output = await migrateArticlesToR2(env);

    return new Response(output, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};
