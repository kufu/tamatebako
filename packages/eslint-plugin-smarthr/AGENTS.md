# AGENTS.md（eslint-plugin-smarthr）

このファイルは `packages/eslint-plugin-smarthr` で作業する際のガイドです。リポジトリ全体のルールは[ルートのAGENTS.md](../../AGENTS.md)を参照してください。

## よく使うコマンド

```sh
# 全ルールのテスト（Jest + RuleTester）
pnpm jest

# 単一ルールのみテスト
pnpm jest test/<rule-name>.js
```

## ルール構造

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

## 他リポジトリとの連携

`eslint-plugin-smarthr` は smarthr-ui のデフォルトprops・バージョン間の破壊的変更を独自に保持しており、smarthr-ui側の変更に自動では追従しません。smarthr-ui側で以下に該当する変更があったことに気づいた場合、本パッケージ側の対応漏れがないか確認してください。

- **公開コンポーネントのデフォルト値（デフォルトprops）の変更** → `best-practice-for-default-props` ルールの `DEFAULT_PROPS` 定義を更新する（乖離すると誤ったfix提案をしてしまう）
- **破壊的変更（コンポーネント名・propsのリネーム等）** → `autofixer-smarthr-ui-migration` ルールに新しいバージョン移行ルール（`rules/autofixer-smarthr-ui-migration/versions/vXX-to-vYY/`）を追加する

## 新規ルール・既存ルール変更時の実プロダクトでの検証

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
