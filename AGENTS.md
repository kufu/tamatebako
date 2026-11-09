# AGENTS.md

このファイルは、Claude Code (claude.ai/code) などのAIコーディングエージェントがこのリポジトリで作業する際のガイドです。

## 取り扱い注意事項

このリポジトリは public です。作業中に他のプライベートリポジトリ（社内の別プロダクト、非公開のコードベースなど）の名前や内容に言及する必要が生じても、PR本文・コミットメッセージ・コードコメント・Issueなど公開される場所には書かないでください。

## プロジェクト概要

tamatebako は、SmartHR の全プロダクトで共有する lint 設定・ESLintカスタムルール・汎用ユーティリティを管理する pnpm モノレポです。各パッケージは独立して npm に公開され、[release-please](https://github.com/googleapis/release-please) によってパッケージ単位でバージョン管理されます（タグ形式: `<package-name>-v<version>`）。

主なパッケージ:

- **`packages/eslint-plugin-smarthr`**（[AGENTS.md](packages/eslint-plugin-smarthr/AGENTS.md)） — SmartHR UI/各プロダクトの利用規約・アクセシビリティ・ベストプラクティスをチェックするESLintカスタムルール本体
- **`packages/eslint-config-smarthr`**（[AGENTS.md](packages/eslint-config-smarthr/AGENTS.md)） — `eslint-plugin-smarthr` を含む、プロダクトが導入するESLint設定一式
- **`packages/oxlint-config-smarthr`**（[AGENTS.md](packages/oxlint-config-smarthr/AGENTS.md)） — 同等のルールセットをoxlint向けに提供する設定（`jsPlugins`経由で`eslint-plugin-smarthr`自体を読み込んで実行する）
- **`packages/stylelint-config-smarthr`** / **`packages/prettier-config-smarthr`** — stylelint/prettierの共通設定
- **`packages/wareki`** / **`packages/use-virtual-scroll`** / **`packages/use-bulk-check`** / **`packages/storybook-focus-indicator`** / **`packages/next-auth`** / **`packages/i18n`** — 独立した汎用ユーティリティパッケージ群
- **`packages/create-lint-set`** — 上記lint設定群をプロダクトに導入するインストーラ

パッケージ固有の作業ガイドは、それぞれの`AGENTS.md`を参照してください。

## よく使うコマンド

```sh
# セットアップ
pnpm install

# ルートから全パッケージをビルド
pnpm build

# ルートから全パッケージをlint（*.ts, *.tsx対象）
pnpm lint

# ルートから全パッケージのテストを実行（ルートのjestテスト + 各パッケージのtest）
pnpm test

# リリース前の一括チェック（build + lint + test）
pnpm prerelease
```

個別パッケージのテスト・lintコマンドは、該当パッケージの`AGENTS.md`を参照してください。

### Node バージョンの注意

`.node-version` がリポジトリで指定しているバージョンが、ローカルのnodenvに未インストールであることがあります。その場合 `NODENV_VERSION=<インストール済みの近いバージョン>` を一時的に指定して回避します（例: `NODENV_VERSION=24.22.1 pnpm <command>`）。commitlintなどのgit hookも同様に影響を受けるため、コミット時にも必要に応じて指定してください。

## コミット・PR規約

- Conventional Commits形式。commitlintで検証されます。
  - **コミットメッセージの先頭を大文字のラテン文字単語にしない**（`subject-case` ルールに抵触します）。日本語の小文字始まりの文に言い換えてください（例: ✅「buttonのradioロールを...」、❌「ButtonのradioRoleを...」）
  - 変更内容に応じて種別を選ぶ（新機能追加は `feat`、バグ修正は `fix` 等）
- コミット本文の行が長すぎると `body-max-line-length` に抵触することがあるため、長い説明は改行で区切るか短くまとめる
