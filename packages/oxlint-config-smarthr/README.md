# oxlint-config-smarthr

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
