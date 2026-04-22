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

## 同階層・子階層からのバレルimportの禁止

バレルファイル（index.ts、client.ts等）と同じディレクトリまたは子ディレクトリ内からバレルファイルをimportすることを禁止します。

### なぜ禁止する必要があるのか

バレルファイルは**ディレクトリ外部**へのエクスポート専用として設計されています。同じディレクトリ内や子ディレクトリからバレルファイルをimportすると、以下の問題が発生します：

1. **循環参照のリスク**: バレルファイルが内部のファイルをexportし、その内部ファイルがバレルファイルをimportする循環が発生しやすい
2. **カプセル化の崩壊**: バレルファイルは外部向けAPIであり、内部からimportすると内部実装の境界が曖昧になる
3. **不要な依存**: 直接相対パスでimportできるものをバレル経由でimportすることは冗長

### ❌ 検出されるエラーケース

```typescript
// src/components/Button/Button.tsx から同じディレクトリのバレルをimport
import { ButtonProps } from '.'          // NG
import { ButtonProps } from './index'    // NG
import { ButtonProps } from '@/components/Button'  // NG

// src/components/Button/_utils/helper.ts から親のバレルをimport
import { Button } from '..'              // NG
import { Button } from '../index'        // NG
import { Button } from '@/components/Button'  // NG

// client.ts を使用している場合
import { ButtonPresentation } from './client'  // NG
```

### ✅ 正しいimport方法

```typescript
// 同じディレクトリ内では直接相対パスを使用
import { ButtonProps } from './types'    // OK

// 親ディレクトリのファイルも直接相対パスを使用
import { buttonUtils } from '../utils'   // OK

// バレルファイルは外部ディレクトリからのみimport
// src/pages/HomePage.tsx から
import { Button } from '@/components/Button'  // OK
```

## バレルファイルの純粋性チェック

バレルファイル（index.ts、client.ts等）内では、**re-export のみを行うべき**であり、それ以外の実装は禁止されます。

### なぜ純粋性が必要なのか

バレルファイルはディレクトリ外部へのエクスポート（公開API定義）が責務です。ロジックや定義を含むと、以下の問題が発生します：

1. **責務の混在**: エクスポート定義とロジック実装が混在し、ファイルの役割が不明確になる
2. **メンテナンス性の低下**: バレルファイルが肥大化し、何をexportしているか把握しづらくなる
3. **テスト困難**: ロジックはテスト対象であるべきだが、バレル内に書くとテストしづらい
4. **分割の妨げ**: 実装はそれぞれ専用ファイルに分離すべき

### ❌ 禁止されるパターン

```typescript
// ❌ import文の使用
import { Button } from './Button'

// ❌ 変数定義
const DEFAULT_SIZE = 'medium'
export const sizes = ['small', 'medium', 'large']

// ❌ 関数定義
function helper() {
  return 'value'
}

// ❌ export function
export function createConfig() {
  return { theme: 'light' }
}

// ❌ クラス定義
class Util {}
export class Helper {}

// ❌ export default
export default function Component() {
  return <div />
}

// ❌ 既存定義のexport
const value = 'test'
export { value }
```

### ✅ 許可されるパターン

```typescript
// ✅ re-export（named export）
export { Button } from './Button'
export { Input, TextArea } from './Input'

// ✅ TypeScript型定義（型は実行時の責務ではないため許可）
export type { ButtonProps } from './Button'
export interface ComponentAPI {
  render: () => void
}
export type Size = 'small' | 'medium' | 'large'
```

### 正しい実装方法

ロジックや定義が必要な場合は、専用ファイルを作成してそこからre-exportします：

```typescript
// ❌ 悪い例: index.ts内で定義
// components/Button/index.ts
export const DEFAULT_SIZE = 'medium'
export { Button } from './Button'

// ✅ 良い例: 専用ファイルを作成
// components/Button/constants.ts
export const DEFAULT_SIZE = 'medium'

// components/Button/index.ts
export { Button } from './Button'
export { DEFAULT_SIZE } from './constants'
```

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

Next.jsなどで使用される `client.ts` をbarrelファイルとして扱いたい場合に使用します。

- デフォルト: `[]`（`index.*` のみがbarrelファイル）
- 例: `['client']` を指定すると、`client.ts`, `client.tsx` などもbarrelファイルとして扱われます
- 複数指定も可能: `['client', 'server']` を指定すると、`server.ts`, `server.tsx` なども追加されます

#### 優先順位とチェックルール

**1. 同じディレクトリ内に複数のbarrelがある場合**
- `client.ts` と `index.ts` が両方ある場合、どちらからのimportも許容されます
- 例: `import { Foo } from './api'` も `import { Foo } from './api/client'` もOK

**2. 同じファイル名の場合は親を優先**

探索により同じファイル名のbarrelが複数見つかった場合（例: `client.ts`同士、`index.ts`同士）、より親のbarrelを推奨します。

```typescript
// 例: 同じファイル名の場合（index同士）
route/
  index.ts  ← より親を推奨
  edit/
    index.ts

// import { Foo } from './route/edit/Foo'
// → route/index.ts を推奨（より親のbarrel）
```

**index.ts経由のre-export対応:**

子で`index.ts`を見つけた場合でも、親方向に`client.ts`があれば、そちらを優先します。

```typescript
// 子が index.ts、親が client.ts のパターン
route/
  client.ts  ← これを推奨
  edit/
    index.ts

// import { Foo } from './route/edit/Foo'
// → route/client.ts を推奨（親のclient.tsが見つかった）

// この場合、route/client.ts で edit/index.ts をre-exportする想定：
// route/client.ts
export * from './edit'
```

**3. エラーメッセージの表示**

`additionalBarrelFileNames`が設定されている場合、エラーメッセージには存在しないbarrelファイルも含めて全ての選択肢が表示されます。

```typescript
// 例: additionalBarrelFileNames: ['client'] 設定時、index.tsのみ存在
検出されたバレル: @/components/api/index.ts
現在のimport:      import { fetchUser } from '@/components/api/user'
推奨されるimport（以下のいずれか）:
  - import { fetchUser } from '@/components/api' // index.ts
  - import { fetchUser } from '@/components/api/client' // client.ts (作成が必要)

※ 存在しないバレルファイルは必要に応じて作成してください。
```

- `index.ts`が優先的に表示されます（常に最初）
- 存在しないファイルには `(作成が必要)` マークが表示されます
- 存在しないファイルがある場合、注意メッセージが追加されます
- 「検出されたバレル」には実際に存在するファイルのみが表示されます

**4. 階層の一貫性チェック**

子ディレクトリで`client.ts`を使用している場合、親ディレクトリにも同名のbarrelを作成することを促します。これにより、プロジェクト全体でbarrel構造の一貫性を保ちます。

```typescript
// 例: client.tsパターンの一貫性チェック
route/
  index.ts  ← client.tsがない
  edit/
    client.ts  ← client.tsを使用

// import { Foo } from './route/edit/client'
// → エラー: route/client.ts を作成して、edit/client のexportをまとめてください

// この場合、以下のようにroute/client.tsを作成する必要があります：
// route/client.ts
export * from './edit/client'
```

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
        // additionalBarrelFileNames: ['client'], // Next.jsなどでclient.tsをbarrelとして扱う
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
