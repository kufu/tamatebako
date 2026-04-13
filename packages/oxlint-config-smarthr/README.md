# oxlint-config-smarthr

[![npm version](https://badge.fury.io/js/oxlint-config-smarthr.svg)](https://badge.fury.io/js/oxlint-config-smarthr)

A sharable oxlint config for SmartHR.
This is intended to use at a project for React + TypeScript.

## Install

```sh
pnpm add --dev oxlint eslint-plugin-smarthr // install peerDependencies
pnpm add --dev oxlint-config-smarthr
```

## How to use

Import the config and add it to `extends` in your `oxlint.config.ts`.

```ts
import { defineConfig } from 'oxlint'
import smarthrConfig from 'oxlint-config-smarthr'

export default defineConfig({
  extends: [smarthrConfig],
  plugins: ['typescript', 'import', 'unicorn', 'react', 'jsx-a11y'],
  jsPlugins: ['eslint-plugin-smarthr'],
  rules: {
    // your project's rules
  },
})
```

Run `oxlint`!

```sh
pnpm oxlint
```

## Type-aware linting

この共有設定には `options.typeAware` は含まれていません。
TypeScript の型情報を利用するルール（`typescript/dot-notation` など）を有効にするには、各プロダクトの `oxlint.config.ts` で設定してください。

```ts
export default defineConfig({
  extends: [smarthrConfig],
  options: {
    typeAware: true,
  },
  // ...
})
```

type-aware linting を利用するには `tsgo` のインストールが必要です。
