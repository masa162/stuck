-- カテゴリテーブルを作成
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER,
  color TEXT NOT NULL DEFAULT '#6B7280',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- articlesテーブルにcategory_idカラムを追加
ALTER TABLE articles ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);

-- 初期カテゴリデータを投入
INSERT INTO categories (name, color, display_order) VALUES
  ('技術/Web開発', '#3B82F6', 1),      -- 青
  ('古典文学', '#8B5CF6', 2),          -- 紫
  ('語学', '#10B981', 3),              -- 緑
  ('コミック', '#EC4899', 4),          -- ピンク
  ('ブログ運営', '#F59E0B', 5),        -- オレンジ
  ('週報/PDCA', '#06B6D4', 6),         -- シアン
  ('医学/健康', '#EF4444', 7),         -- 赤
  ('個人/その他', '#6B7280', 8);       -- グレー
