# Contributing Guide

## For Contributors

Thank you for your contribution!

### Setup

This repository is a monorepo using pnpm workspace.

```sh
% cd tamatebako
% pnpm install
```

### Develop

```sh
% pnpm dev
```

### Test

```sh
% cd tamatebako
% pnpm test
% pnpm lint
```

## For Maintainers

### Merge

After you have approved a PR, please merge the PR using Squash and merge with Conventional Commits format.

### Release

リリースは Github Actions の publish workflow で行います。自動で作成されているリリース Pull Request をマージしてください。詳しい手順やワークフローが失敗した場合の対応は [README のリリース手順](./README.md#リリース手順) を参照してください。

新しいパッケージを追加する場合は、[README の新しいパッケージの追加方法](./README.md#新しいパッケージの追加方法) を参照してください。
