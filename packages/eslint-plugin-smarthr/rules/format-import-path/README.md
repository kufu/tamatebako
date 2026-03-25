# smarthr/format-import-path

importする際のpathをフォーマットするruleです。ディレクトリ構造からドメインを識別して相対パス、絶対パスいずれかにするかを判定することが出来ます。

## なぜimportパスをフォーマットする必要があるのか

プロジェクトが大きくなるにつれ、importパスの記述方法が統一されていないと、以下の問題が発生します：

- **可読性の低下**: 相対パスと絶対パスが混在することで、ファイルの位置関係が把握しづらくなります
- **リファクタリングの困難さ**: パスの記述方法が統一されていないと、ディレクトリ構造の変更時に修正漏れが発生しやすくなります
- **ドメイン境界の不明確さ**: どのファイルがどのドメインに属するかが不明確になり、意図しないドメイン間の依存関係が発生しやすくなります

このルールを使用することで、ドメインごとに適切なimportパスの形式を強制し、プロジェクト全体の一貫性を保つことができます。eslint を `--fix` オプション付きで実行すると自動的にパスを置き換えます。

## チェック内容

このルールは以下の機能を提供します：

- ディレクトリ構造からドメインを識別
- 同一ドメイン内のimportは相対パス、ドメイン外のimportは絶対パスといった制御が可能
  - 例: crews/index 以下同士でのimportは相対パス、crews/index外のファイルimportする場合は絶対パスにする
- 自動修正機能により、設定に基づいてパスを自動変換

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

## rules

```js
{
  rules: {
    'smarthr/format-import-path': [
      'error', // 'warn', 'off'
      {
        ...DOMAIN_RULE_ARGS,
        format: {
          // 'relative', 'auto', 'none'
          // all: 'absolute',
          outside: 'auto',
          globalModule: 'absolute',
          module: 'relative',
          domain: 'relative',
          lower: 'relative',
        },
      },
    ],
  },
}
```

## ❌ Incorrect

```js
// crews/index/views/index.js

import slice from '@/crews/index/slice'
import hoge from '@/crews/index/adapter/hoge'
import Abc from '@/crews/index/views/parts/Abc'
import modulePart from '@/crews/modules/views/part'
import showPart from '../../show/views/parts'
import globalModulePart from '../../../module/views/part'
```

## ✅ Correct

```js
// crews/index/views/index.js

import slice from '../slice'
import hoge from '../adapter/hoge'
import Abc from './parts/Abc'
import modulePart from '../../modules/views/parts'
import showPart from '@/crews/show/views/parts'
import globalModulePart from '@/modules/views/parts'
```
