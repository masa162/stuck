# stuck - AI Knowledge Hub

AIとのチャット履歴、壁打ち内容、収集した情報の整理・閲覧・編集を行うCMS風ダッシュボード。

## 技術スタック

- **フロントエンド・バックエンド**: Next.js 15 (App Router)
- **スタイリング**: Tailwind CSS
- **Markdownレンダリング**: react-markdown + remark-gfm
- **データベース**: Cloudflare D1
- **デプロイ**: Cloudflare Pages

## 機能

- ✅ 記事一覧・詳細表示
- ✅ Markdownレンダリング
- ✅ 目次自動生成
- ✅ 記事作成・編集
- ✅ クライアントサイド検索
- ✅ タグ管理
- 🚧 記事削除（ゴミ箱）
- 🚧 Markdown出力
- 🚧 Basic認証

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# http://localhost:3000 でアクセス
```

## Cloudflare Pagesへのデプロイ

### 初回デプロイ

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. GitHubリポジトリを選択
4. ビルド設定:
   - **Framework preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages@1`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/` (デフォルト)
5. **Environment variables** (後で設定):
   - D1データベースのバインディング設定
6. **Save and Deploy**

### D1データベースのセットアップ

```bash
# D1データベースを作成
npx wrangler d1 create stuck-db

# wrangler.tomlのdatabase_idを更新

# スキーマを適用
npx wrangler d1 execute stuck-db --file=./schema.sql
```

### Cloudflare Pagesにデータベースをバインド

1. Cloudflare Dashboard → Pages → stuck → Settings → Functions
2. **D1 database bindings** → **Add binding**
   - Variable name: `DB`
   - D1 database: `stuck-db`
3. 保存して再デプロイ

## ライセンス

個人利用のプライベートプロジェクト
