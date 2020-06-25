# Contributing Guide

## For Contributors

Thank you for your contribution!

### Setup

This repository is a monorepo using Lerna and Yarn Workspaces.

```sh
% cd tamatebako
% yarn install
```

### Develop

```sh
% yarn start
```

### Test

```sh
% cd tamatebako
% yarn test
% yarn lint
```

## For Maintainers

### Merge

After you have approved a PR, please merge the PR using Squash and merge with Conventional Commits format.

### Release

```sh
% cd tamatebako
% yarn release
```

If you'd like to release a new package.

```sh
% cd tamatebako
% yarn initial:release
```