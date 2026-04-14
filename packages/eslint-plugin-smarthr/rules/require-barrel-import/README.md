# smarthr/require-barrel-import

importした対象が本来exportされているべきであるbarrel(index.tsなど)が有る場合、import pathの変更を促します。ディレクトリ内のindexファイルを捜査し、対象を決定します。

## なぜbarrel経由のimportを強制する必要があるのか

barrel（index.tsなど）を使用したexportパターンは、モジュールの公開APIを明示的に定義する重要な設計手法です：

### カプセル化の実現

barrelを経由することで、ディレクトリ内のどのモジュールが公開APIで、どれが内部実装かを明確に区別できます。これにより：

- 内部実装の詳細を隠蔽し、外部から直接アクセスされることを防ぎます
- モジュールの利用者に対して、使用すべきAPIを明示的に示すことができます

### リファクタリングの容易性

barrelを経由することで、内部のファイル構成を変更しても、外部のimport文に影響を与えずにリファクタリングできます：

- ファイルの移動や名前変更時に、barrelのexport文のみを修正すればよい
- 利用側のimport文を一切変更する必要がない

### import文の簡潔化

例えば、`Page/parts/Menu/Item` を `Page/parts/Menu` から importすることで、import文がより簡潔で読みやすくなります。

## config

### 必須設定

tsconfig.json の compilerOptions.pathsに `@/*` もしくは `~/*` としてroot path を指定する必要があります。

- tsconfig.json はデフォルトではコマンド実行をしたディレクトリから読み込みます
- tsconfig.json の設置ディレクトリを変更したい場合、`.eslintrc` などのeslint設定ファイルに `parserOptions.project` を設定してください

## options

### ignores

除外したいファイルの正規表現を配列で指定します。

### allowedImports

特定のファイルから特定のimportを許可する設定を記述できます。

### additionalBarrelFileNames

`index` 以外にbarrelファイルとして扱うファイル名を配列で指定します（拡張子なし）。

Next.jsなどで使用される `client.ts` や `server.ts` をbarrelファイルとして扱いたい場合に使用します。

- デフォルト: `[]`（`index.*` のみがbarrelファイル）
- 例: `['client', 'server']` を指定すると、`client.ts`, `client.tsx`, `server.ts`, `server.tsx` などもbarrelファイルとして扱われます
- 優先順位: 指定したファイル名 > `index`（同じディレクトリに `client.ts` と `index.ts` がある場合、`client.ts` が優先されます）

## rules

```js
{
  rules: {
    'smarthr/require-barrel-import': [
      'error',
      {
        // ignores: ['\\/test\\/'], // 除外したいファイルの正規表現
        // allowedImports: {
        //   '/any/path/': { // 正規表現でチェックするファイルを指定
        //     // import制御するファイル (相対パスを指定する場合、.eslintrc.js を基準とする)
        //     '@/hoge/fuga': true // ['abc', 'def'] と指定すると個別に指定
        //   }
        // },
        // additionalBarrelFileNames: ['client', 'server'], // Next.jsなどでclient.ts, server.tsをbarrelとして扱う
      }
    ],
  },
}
```

## ❌ Incorrect

```js
// client/src/views/Page/parts/Menu/index.ts
export { Menu } from './Menu'
export { Item } from './Item'

// client/src/App.tsx
import { Item } from './Page/parts/Menu/Item'
```

## ✅ Correct


```js
// client/src/views/Page/parts/Menu/index.ts
export { Menu } from './Menu'
export { Item } from './Item'

// client/src/App.tsx
import { Item } from './Page/parts/Menu'
```
