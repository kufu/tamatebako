# AGENTS.md

このファイルは、Claude Code (claude.ai/code) などのAIコーディングエージェントがこのリポジトリで作業する際のガイドです。

## 取り扱い注意事項

このリポジトリは public です。作業中に他のプライベートリポジトリ（社内の別プロダクト、非公開のコードベースなど）の名前や内容に言及する必要が生じても、PR本文・コミットメッセージ・コードコメント・Issueなど公開される場所には書かないでください。

## プロジェクト概要

tamatebako は、SmartHR の全プロダクトで共有する lint 設定・ESLintカスタムルール・汎用ユーティリティを管理する pnpm モノレポです。各パッケージは独立して npm に公開され、[release-please](https://github.com/googleapis/release-please) によってパッケージ単位でバージョン管理されます（タグ形式: `<package-name>-v<version>`）。

主なパッケージ:

- **`packages/eslint-plugin-smarthr`** — SmartHR UI/各プロダクトの利用規約・アクセシビリティ・ベストプラクティスをチェックするESLintカスタムルール本体
- **`packages/eslint-config-smarthr`** — `eslint-plugin-smarthr` を含む、プロダクトが導入するESLint設定一式
- **`packages/oxlint-config-smarthr`** — 同等のルールセットをoxlint向けに提供する設定（`jsPlugins`経由で`eslint-plugin-smarthr`自体を読み込んで実行する）
- **`packages/stylelint-config-smarthr`** / **`packages/prettier-config-smarthr`** — stylelint/prettierの共通設定
- **`packages/wareki`** / **`packages/use-virtual-scroll`** / **`packages/use-bulk-check`** / **`packages/storybook-focus-indicator`** / **`packages/next-auth`** / **`packages/i18n`** — 独立した汎用ユーティリティパッケージ群
- **`packages/create-lint-set`** — 上記lint設定群をプロダクトに導入するインストーラ

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

個別パッケージの作業は該当パッケージのディレクトリに移動して実行します。

```sh
# eslint-plugin-smarthr: 全ルールのテスト（Jest + RuleTester）
cd packages/eslint-plugin-smarthr && pnpm jest

# 単一ルールのみテスト
pnpm jest test/<rule-name>.js

# eslint-config-smarthr / oxlint-config-smarthr: スナップショットテスト（Vitest）
cd packages/eslint-config-smarthr && pnpm test
# スナップショット更新（依存更新などで期待値が変わった場合）
pnpm vitest run -u
```

### Node バージョンの注意

`.node-version` がリポジトリで指定しているバージョンが、ローカルのnodenvに未インストールであることがあります。その場合 `NODENV_VERSION=<インストール済みの近いバージョン>` を一時的に指定して回避します（例: `NODENV_VERSION=24.22.1 pnpm jest`）。commitlintなどのgit hookも同様に影響を受けるため、コミット時にも必要に応じて指定してください。

## アーキテクチャ（`eslint-plugin-smarthr` のルール構造）

### ファイル構成

1ルールにつき以下の3点セットで構成します。

```
rules/<rule-name>/
├── index.js      # ルール実装
└── README.md     # ユーザー向けドキュメント（チェック内容・❌/✅サンプル）
test/<rule-name>.js  # RuleTesterによるテスト
```

ルート `index.js` は `rules/` 配下を自動スキャンして登録するため、新規ルール追加時にルート側へ登録作業は不要です。

### 実装スタイル

esquery のセレクタ文字列を `create()` が返すオブジェクトのキーにする宣言的なスタイルが基本です。

```js
return {
  'JSXOpeningElement[name.name=/Button$/] > JSXAttribute[name.name="disabled"]': (node) => { ... },
}
```

セレクタだけでは表現できない判定（子要素同士の型比較、属性値の内容に応じた分岐など）は、セレクタで対象ノードまで絞り込んだ上でハンドラ内で手動のAST解析を行うハイブリッドな書き方を併用します（`best-practice-for-layouts`、`a11y-trigger-has-button` が実例）。

### メッセージ規約

エラーメッセージの末尾に、ルール自身のGitHub上のパスへのリンクを付与する `DETAIL_LINK_MESSAGE` パターンで統一します。

```js
const DETAIL_LINK_MESSAGE = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/<rule-name>`
```

### 命名規則

- **`a11y-*`** — アクセシビリティ関連
- **`best-practice-for-*`** — プログラミング的な一般ベストプラクティス（コードの書き方そのものに関する指摘）
- **`design-system-guideline-*`** — [smarthr.design](https://smarthr.design/) に明文化されたデザインシステムのガイドラインに準拠させるための指摘
- **`require-*`** / **`prohibit-*`** — 特定の構文・importの強制/禁止

新しいルールを追加する際、プログラミング上の問題なのか、smarthr.design上の明文化されたガイドライン違反なのかで `best-practice-for-*` と `design-system-guideline-*` のどちらに属するか判断してください。

### オプション

`meta.schema`（`SCHEMA`）は多くのルールで空配列です。設定可能にする場合も、対象コンポーネント名の正規表現を拡張できる `additionalXxxRegex` のような命名にする慣習があります（例: `additionalInteractiveComponentRegex`）。

## コミット・PR規約

- **PRは必ずdraftで作成する**（`gh pr create --draft`）。例外はありません。
- Conventional Commits形式。commitlintで検証されます。
  - **コミットメッセージの先頭を大文字のラテン文字単語にしない**（`subject-case` ルールに抵触します）。日本語の小文字始まりの文に言い換えてください（例: ✅「buttonのradioロールを...」、❌「ButtonのradioRoleを...」）
  - 変更内容に応じて種別を選ぶ（新ルール追加・既存ルールの検出対象拡張は `feat`、誤検知修正は `fix`）
- コミット本文の行が長すぎると `body-max-line-length` に抵触することがあるため、長い説明は改行で区切るか短くまとめる

### `eslint-config-smarthr` / `oxlint-config-smarthr` で `eslint-plugin-smarthr` を更新する場合

- `pnpm install eslint-plugin-smarthr@X.Y.Z` を使い、`package.json` を直接編集しない（lockfileとの不整合でCIが落ちるため）
- `eslint-config-smarthr`・`oxlint-config-smarthr` 向けのPRはそれぞれ別のPRに分ける
- release直後はnpmレジストリへの反映に数分のタイムラグが生じることがあります。`pnpm install` が `ERR_PNPM_NO_MATCHING_VERSION` で失敗した場合、GitHub Actionsのpublishジョブ自体は成功していることが多いため、`curl -s https://registry.npmjs.org/<package>` でレジストリの実際の状態を直接確認し、反映を待ってから再試行してください（ローカルの `safe-chain` という供給網セキュリティツールが「公開直後のバージョンを一定期間抑制する」ポリシーを持っている場合は `--safe-chain-skip-minimum-package-age` を付与します）

## 他リポジトリとの連携

`eslint-plugin-smarthr` は smarthr-ui のデフォルトprops・バージョン間の破壊的変更を独自に保持しており、smarthr-ui側の変更に自動では追従しません。smarthr-ui側で以下に該当する変更があったことに気づいた場合、本リポジトリ側の対応漏れがないか確認してください。

- **公開コンポーネントのデフォルト値（デフォルトprops）の変更** → `best-practice-for-default-props` ルールの `DEFAULT_PROPS` 定義を更新する（乖離すると誤ったfix提案をしてしまう）
- **破壊的変更（コンポーネント名・propsのリネーム等）** → `autofixer-smarthr-ui-migration` ルールに新しいバージョン移行ルール（`rules/autofixer-smarthr-ui-migration/versions/vXX-to-vYY/`）を追加する

### 新規ルール・既存ルール変更時の実プロダクトでの検証

ルールを追加・変更した際は、実際のプロダクトのコードベースに適用して誤検知やカバレッジを確認すると信頼性が高まります。

1. 検証対象（smarthr-ui、各プロダクトのフロントエンドリポジトリ等）のローカルチェックアウトで検証用ブランチを作成する
2. ローカルの `eslint-plugin-smarthr` をリンクする
   ```sh
   pnpm add -D <検証対象からの相対パス>/tamatebako/packages/eslint-plugin-smarthr
   ```
   pnpmワークスペースのルートでないディレクトリから実行すると `ERR_PNPM_ADDING_TO_ROOT` で止まることがあり、その場合は `-w` を付けてワークスペースルートに追加する
3. 検証対象のlint設定にルールを有効化する
   - Flat config（ESLint）で、検証対象が既に `eslint-config-smarthr` 経由で `smarthr` という名前のプラグインを登録している場合、名前が衝突するため別名（`smarthr-local` 等）でプラグインを登録し、個別ルールをその名前空間で有効化する
   - `oxlint-config-smarthr` 経由（`jsPlugins: ['eslint-plugin-smarthr']`）で読み込まれている場合は、oxlint設定の `rules` にルール名をそのまま追加するだけでよい
4. まずスクラッチファイルで既知の違反パターンを書いて、ルールが実際に発火することを確認してから、対象のソースツリー全体に対してlintを実行する（配線ミスで「0件検出」になっているのを「誤検知なしの正常な結果」と誤認しないため）
5. 検証用の変更（依存追加・config変更）をすべて元に戻し、`package.json`/lockfileの差分も `git checkout --` で破棄し、検証用ブランチを削除する
