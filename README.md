# tamatebako

[![](https://github.com/kufu/tamatebako/workflows/test/badge.svg)](https://github.com/kufu/tamatebako/actions?workflow=test)
[![](https://github.com/kufu/tamatebako/workflows/lint/badge.svg)](https://github.com/kufu/tamatebako/actions?workflow=lint)

Frontend packages for projects at SmartHR

## Package Index

| Package                  | Version                                                                                                                                  | Description                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| use-bulk-check           | [![npm version](https://badge.fury.io/js/%40smarthr%2Fuse-bulk-check.svg)](https://badge.fury.io/js/%40smarthr%2Fuse-bulk-check)         | React hooks for managing the values in the checkbox list |
| use-virtual-scroll       | [![npm version](https://badge.fury.io/js/%40smarthr%2Fuse-virtual-scroll.svg)](https://badge.fury.io/js/%40smarthr%2Fuse-virtual-scroll) | React hooks for virtual scroll                           |
| wareki                   | [![npm version](https://badge.fury.io/js/%40smarthr%2Fwareki.svg)](https://badge.fury.io/js/%40smarthr%2Fwareki)                         | Japanese 'wareki' formatter                              |
| create-lint-set          | [![npm version](https://badge.fury.io/js/%40smarthr%2Fcreate-lint-set.svg)](https://badge.fury.io/js/%40smarthr%2Fcreate-lint-set)       | Lint installer                                           |
| next-auth                | [![npm version](https://badge.fury.io/js/%40smarthr%2Fnext-auth.svg)](https://badge.fury.io/js/%40smarthr%2Fnext-auth)                   | SmartHR's next-auth utility                              |
| eslint-config-smarthr    | [![npm version](https://badge.fury.io/js/eslint-config-smarthr.svg)](https://badge.fury.io/js/eslint-config-smarthr)                     | ESLint config for SmartHR                                |
| eslint-plugin-smarthr    | [![npm version](https://badge.fury.io/js/eslint-plugin-smarthr.svg)](https://badge.fury.io/js/eslint-plugin-smarthr)                     | ESLint plugin for SmartHR                                |
| prettier-config-smarthr  | [![npm version](https://badge.fury.io/js/prettier-config-smarthr.svg)](https://badge.fury.io/js/prettier-config-smarthr)                 | Prettier config for SmartHR                              |
| stylelint-config-smarthr | [![npm version](https://badge.fury.io/js/stylelint-config-smarthr.svg)](https://badge.fury.io/js/stylelint-config-smarthr)               | Stylelint config for SmartHR                             |
| i18n                     | [![npm version](https://badge.fury.io/js/%40smarthr%2Fi18n.svg)](https://badge.fury.io/js/%40smarthr%2Fi18n)                             | Internationalization utility                             |

## リリース手順

### 1. リリース Pull Request をマージする

自動で作成されているリリース Pull Request をマージすると、Github Actions の publish workflow で以下のことが行われます。

- 各パッケージの package.json 内の version が更新される
- 各パッケージの `CHANGELOG.md` が更新される
- リリースタグが打たれる
- npm にパッケージが公開される

基本的にはこれでリリースは完了です。

### 2. publish workflow に失敗した場合は手元でリリースを行う

publish workflow が何かしらの理由で失敗した場合、`CHANGELOG.md` が更新されたりリリースタグが打たれたりなど Github 上ではリリースが完了している状態になるのに、npm にはパッケージが公開されていない、といったような不整合が起きてしまいます。  
これを解消するために、下記の手順で手元でリリースを行う必要があります。

```shell
$ git switch --detach xxx # 任意のリリースタグがついているコミットに切り替える
$ pnpm install
$ pnpm release
```

[smarthr の organization](https://www.npmjs.com/org/smarthr) に所属していない場合は publish ができないので、申請をするか、すでに所属している人に publish を依頼してください。

## 新しいパッケージの追加方法

1. `packages` ディレクトリに新しいパッケージ用のディレクトリを作成し、必要なファイルを追加します。
2. Lerna がリリースしてしまわないように、`package.json` に `private: true` を追記します。
3. tsc のビルド対象に含める場合は、`packages/tsconfig.json` の `references` に追加します。
4. 通常通り conventional commits でコミットを行い、プルリクエストを作成します。
5. プルリクエストをマージしても、リリース用のプルリクエストが作成されないことを確認します。

## 新しいパッケージのリリース方法

1. 下記の3つの変更を含んだプルリクエストを作成します。
   - 新しいパッケージの `package.json` に `version: "1.0.0"` を追記します。
   - 新しいパッケージの `package.json` から `private: true` を削除します。
   - release-please がリリース用のプルリクエストを作るように `release-please-config.json` に下記のような行を追加します。 (もし `0.1.0` などのマイナーバージョンでリリースしたい場合は [`initial-version`](https://github.com/googleapis/release-please/blob/a9b82178ce8040af09e55be509911fa36e0c20e7/schemas/config.json#L245-L247) を指定し、該当パッケージの `package.json` の `version` も合わせてください。)
```
"packages/new-package-name": {},
```
2. プルリクエストをマージすると、リリース用のプルリクエストが作成されます。`.release-please-manifest.json` の差分に表示されているリリースバージョンが正しいことを確認してください。
3. リリース用のプルリクエストに含まれる `CHANGELOG.md` には、リリースまでのすべてのプルリクエストの内容が記載されています。それらの記載が不要な場合はリリース用プルリクエストに直接コミットする形で `CHANGELOG.md` を修正します。([例](https://github.com/kufu/tamatebako/pull/765/commits/1ae223cc77d8022c499b2ccdf92b4d600c599146))
4. リリース用のプルリクエストをマージして、Github Actions のリリースのワークフローを見守ります。
5. リリースが完了したら、npm のパッケージのページで Trusted Publisher と Publishing Access の設定をします。
  - https://github.com/kufu/tamatebako/pull/793 に貼ってあるキャプチャと内容と同じ設定にしてください。
