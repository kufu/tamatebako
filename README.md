# tamatebako

[![](https://github.com/kufu/tamatebako/workflows/test/badge.svg)](https://github.com/kufu/tamatebako/actions?workflow=test)
[![](https://github.com/kufu/tamatebako/workflows/lint/badge.svg)](https://github.com/kufu/tamatebako/actions?workflow=lint)

Frontend packages for projects at SmartHR

## Package Index

| Package            | Version                                                                                                                                  | Description                                              |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| use-bulk-check     | [![npm version](https://badge.fury.io/js/%40smarthr%2Fuse-bulk-check.svg)](https://badge.fury.io/js/%40smarthr%2Fuse-bulk-check)         | React hooks for managing the values in the checkbox list |
| use-virtual-scroll | [![npm version](https://badge.fury.io/js/%40smarthr%2Fuse-virtual-scroll.svg)](https://badge.fury.io/js/%40smarthr%2Fuse-virtual-scroll) | React hooks for virtual scroll                           |
| wareki             | [![npm version](https://badge.fury.io/js/%40smarthr%2Fwareki.svg)](https://badge.fury.io/js/%40smarthr%2Fwareki)                         | Japanese 'wareki' formatter                              |
| create-lint-set    | [![npm version](https://badge.fury.io/js/%40smarthr%2Fcreate-lint-set.svg)](https://badge.fury.io/js/%40smarthr%2Fcreate-lint-set)       | Lint installer                                           |
| next-auth          | [![npm version](https://badge.fury.io/js/%40smarthr%2Fnext-auth.svg)](https://badge.fury.io/js/%40smarthr%2Fnext-auth)                   | SmartHR's next-auth utility                              |

## リリース手順

### 1. バージョンを更新する

```bash
$ pnpm versionup
```

以下のことが行われます。

- commit log を元に各パッケージの version を更新
- 各パッケージのディレクトリに `CHANGELOG.md` を出力(更新)
- バージョンを git tag する

### 2. publish する

```bash
$ pnpm release
```

現在のバージョンが npm registry に公開されていなければ、npm publish します。
