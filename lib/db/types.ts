export interface Article {
  id: number;
  title: string;
  content: string;
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
