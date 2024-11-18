# Contributing Guide

## For Contributors

Thank you for your contribution!

### Setup

This repository is a monorepo using Lerna and Yarn Workspaces.

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

```sh
% cd tamatebako
% pnpm release
```

If you'd like to release a new package.

```sh
% cd tamatebako
% pnpm initial:release
```
