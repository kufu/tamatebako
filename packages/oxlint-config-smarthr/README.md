# oxlint-config-smarthr

[![npm version](https://badge.fury.io/js/oxlint-config-smarthr.svg)](https://badge.fury.io/js/oxlint-config-smarthr)

SmartHR 全社共通の oxlint 設定です。
React + TypeScript プロジェクトでの利用を想定しています。

## インストール

```sh
pnpm add --dev oxlint eslint-plugin-smarthr # peerDependencies
pnpm add --dev oxlint-config-smarthr
```

## 使い方

`oxlint.config.ts` で設定をインポートし、`extends` に追加してください。

```ts
import { defineConfig } from 'oxlint'
import smarthrConfig from 'oxlint-config-smarthr'

export default defineConfig({
  extends: [smarthrConfig],
  plugins: ['typescript', 'import', 'unicorn', 'react', 'jsx-a11y'],
  jsPlugins: ['eslint-plugin-smarthr'],
  rules: {
    // プロダクト固有のルール
  },
})
```

`oxlint` コマンドで実行可能です。 eslint で使用できる大半のコマンドを利用できます。

```sh
pnpm oxlint
```

## Type-aware linting

この共有設定には `options.typeAware` は含まれていません。
TypeScript の型情報を利用するルール（`typescript/dot-notation` など）を有効にするには、追加パッケージをインストールし、設定ファイルを調整してください。

```bash
pnpm add -D oxlint-tsgolint
