ローカル確認できました。OKですね。つづけましょう

/Users/nakayamamasayuki/Documents/GitHub/stuck/public/images/stuck_logo.webp
に画像を格納しました。
webp形式でも表示できますかね？

ファビコンも用意しました。
/Users/nakayamamasayuki/Documents/GitHub/stuck/public/images/fav.png

設定お願いします

続けてください

いいですね。
もうさっそく、cloudflare pagesにデプロイしてみましょう。
githubにコミット、pushお願いします
初回なので、initiと、igitignore整理お願いします


https://stuck-bwf.pages.dev/
デプロイできました。

つづけましょう


topの画像当初の200sqだと、大きいとかんじました。
110squreで用意しました。
フレキシブルに表示するように修正お願いします。



  Cloudflare Pagesの環境変数に以下を追加してください:
  - BASIC_AUTH_USER mn
  - BASIC_AUTH_PASSWORD 39


外部画像CDNにあるアセットを記事にURLで呼び出したいです。
https://img.be2nd.com/itsf10vy  

どのように記述すればいいでしょうか？

記事一覧のページを作ります、
テーブル形式でメタデータを表示します
各カラムでソートできる
投稿日時でフィルタリングして、絞り込みができる

     BASIC_AUTH_USER=admin
     BASIC_AUTH_PASSWORD=your_secure_password_here