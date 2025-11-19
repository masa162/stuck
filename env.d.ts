/// <reference types="@cloudflare/workers-types" />

declare module "@cloudflare/next-on-pages" {
  interface CloudflareEnv {
    DB: D1Database;
    ARTICLES_BUCKET: R2Bucket;
  }
}
