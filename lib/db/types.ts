export interface Article {
  id: number;
  title: string;
  content?: string;              // Optional: only present when fetched from R2
  content_key: string | null;    // R2 object key (e.g., "articles/123.md")
  content_size: number | null;   // Content size in bytes
  content_hash: string | null;   // SHA-256 hash for integrity verification
  memo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tags?: Tag[];
}

// Metadata-only interface for list views (no content)
export interface ArticleMetadata {
  id: number;
  title: string;
  content_key: string | null;
  content_size: number | null;
  content_hash: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: number;
  tag_id: number;
  created_at: string;
}
