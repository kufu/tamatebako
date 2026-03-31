# smarthr/no-import-other-domain

ドメイン外からのimportを防ぐruleです。ディレクトリ構造からドメインを識別して判定することが出来ます。

## なぜドメイン外のimportを禁止する必要があるのか

大規模なアプリケーションでは、コードを機能ごとのドメインに分割して管理することが一般的です。しかし、ドメイン間の依存関係が無秩序に増えると、以下の問題が発生します：

- **密結合の発生**: ドメイン間が密結合になり、一つのドメインの変更が他のドメインに波及しやすくなります
- **循環依存のリスク**: ドメイン間で相互にimportし合うことで、循環依存が発生する可能性が高まります
- **テストの困難さ**: ドメイン間の依存関係が複雑になると、単体テストやモックの作成が困難になります
- **保守性の低下**: どのドメインがどの責務を持つかが不明確になり、コードの保守が困難になります

このルールを使用することで、ドメイン境界を明確にし、各ドメインの独立性を保つことができます。例えば、crews/index ドメイン内からのimportは許可し、crews/show など他のドメインからのimportを禁止することで、ドメイン間の依存関係を制御できます。

## チェック内容

このルールは以下をチェックします：

- ディレクトリ構造から自動的にドメインを識別
- 同一ドメイン内のimportは許可、他のドメインからのimportは禁止
  - 例: crews/index 以下からのimportはOK、crews/index から crews/show 以下をimportするとNG
- 設定により特定のファイルやimportを除外可能

## config

### 必須設定

tsconfig.json の compilerOptions.pathsに `@/*` もしくは `~/*` としてroot path を指定する必要があります。

- tsconfig.json はデフォルトではコマンド実行をしたディレクトリから読み込みます
- tsconfig.json の設置ディレクトリを変更したい場合、`.eslintrc` などのeslint設定ファイルに `parserOptions.project` を設定してください

### ドメイン識別設定

ドメインを識別するために以下の設定を記述する必要があります：

- **globalModuleDir**: 全体で利用するファイルを収めているディレクトリを相対パスで指定
- **domainModuleDir**: ドメイン内で共通のファイルを収めているディレクトリ名を指定
- **domainConstituteDir**: ドメインを構築するディレクトリ名を指定

### ディレクトリ例
```
/ constants
/ modules  // 全体共通ディレクトリ
/ crews
  / modules // 共通ディレクトリ
    / views
      / parts
  / index
    / adapters
      / index.ts
      / hoge.ts
    / slices
      / index.ts
    / views
      / index.ts
      / parts
        / Abc.ts
  / show
    / views
      / parts
```

### 指定例
```js
const DOMAIN_RULE_ARGS = {
  globalModuleDir: [ './constants', './modules' ],
  domainModuleDir: [ 'modules' ],
  domainConstituteDir: [ 'adapters', 'slices', 'views', 'parts' ],
}
```

## options

### ignores

除外したいファイルの正規表現を配列で指定します。

### allowedImports

特定のファイルから特定のimportを許可する設定を記述できます。

### analyticsMode

分析モードを指定します（`'all'`, `'same-domain'`, `'another-domain'`）

## rules

```js
{
  rules: {
    'smarthr/no-import-other-domain': [
      'error', // 'warn', 'off'
      {
        ...DOMAIN_RULE_ARGS,
        // ignores: ['\\/test\\/'], // 除外したいファイルの正規表現
        // allowedImports: {
        //   '/any/path/': { // 正規表現でチェックするファイルを指定
        //     // import制御するファイル (相対パスを指定する場合、.eslintrc.js を基準とする)
        //     '@/hoge/fuga': true // ['abc', 'def'] と指定すると個別に指定
        //   }
        // },
        // analyticsMode: 'all', // 'same-domain', 'another-domain'
      }
    ]
  },
}
```

## ❌ Incorrect

```js
// crews/index/views/index.js

import showPart1 from '@/crews/show/views/parts'
import showPart2 from '../../show/views/parts'
```

## ✅ Correct

```js
// crews/index/views/index.js

import slice from '../slice'
import hoge from '../adapter/hoge'
import Abc from './parts/Abc'
import modulePart from '../../modules/views/parts'
import globalModulePart from '@/modules/views/parts'
```
