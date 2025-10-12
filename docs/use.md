  デプロイ時の設定:
  Cloudflare Pagesの環境変数に以下を追加してください:
  - BASIC_AUTH_USER
  - BASIC_AUTH_PASSWORD

> 外部画像CDNにあるアセットを記事にURLで呼び出したいです。
https://img.be2nd.com/itsf10vy  

どのように記述すればいいでしょうか？ 

⏺ 外部CDNの画像をMarkdownで表示する方法を説明します。

  Markdown記法:

  # 通常の画像表示
  ![画像の説明](https://img.be2nd.com/itsf10vy)

  # サイズ指定したい場合はHTMLタグを使用
  <img src="https://img.be2nd.com/itsf10vy" alt="画像の説明" width="600" />

  # 中央寄せ
  <div style="text-align: center;">
    <img src="https://img.be2nd.com/itsf10vy" alt="画像の説明" width="600" />
  </div>

  現在の実装（react-markdown + remark-gfm）では、Markdown画像記法とHTMLタグの両方が使えます。

  例:

  ## 外部画像の例

  通常サイズで表示:
  ![CDN画像](https://img.be2nd.com/itsf10vy)

  幅600pxで表示:
  <img src="https://img.be2nd.com/itsf10vy" alt="CDN画像" width="600" />

  試してみてください。記事作成・編集画面でこのMarkdownを入力すれば、外部CDNの画像が表示されます。

