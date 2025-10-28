-- Migration: Add R2 storage support to articles table
-- Date: 2025-10-28
-- Description: Add columns for R2 content storage while maintaining backward compatibility

-- Add new columns for R2 storage
ALTER TABLE articles ADD COLUMN content_key TEXT;
ALTER TABLE articles ADD COLUMN content_size INTEGER;
ALTER TABLE articles ADD COLUMN content_hash TEXT;

-- Create index for content_key lookups
CREATE INDEX IF NOT EXISTS idx_articles_content_key ON articles(content_key);

-- Note: content column is kept for backward compatibility during migration
-- It will be removed in a future migration after all data is migrated to R2