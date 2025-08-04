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
