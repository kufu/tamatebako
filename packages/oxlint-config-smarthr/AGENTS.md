# AGENTS.md（oxlint-config-smarthr）

このファイルは `packages/oxlint-config-smarthr` で作業する際のガイドです。リポジトリ全体のルールは[ルートのAGENTS.md](../../AGENTS.md)を参照してください。

`eslint-config-smarthr` と同等のルールセットをoxlint向けに提供するパッケージです。`jsPlugins: ['eslint-plugin-smarthr']` によって `eslint-plugin-smarthr` 自体をoxlint経由で読み込んで実行しています。

## よく使うコマンド

```sh
# 設定が解釈可能かの確認
pnpm test
```

## `eslint-plugin-smarthr` を更新する場合

- `pnpm install eslint-plugin-smarthr@X.Y.Z` を使い、`package.json` を直接編集しない（lockfileとの不整合でCIが落ちるため）
- `eslint-config-smarthr` 向けの同種の更新と1つのPRにまとめる（どちらも `pnpm-lock.yaml` を変更するため、PRを分けると片方をマージするたびにもう片方へmasterの取り込みが必要になる）
  - それぞれのパッケージのディレクトリで `pnpm install eslint-plugin-smarthr@X.Y.Z` を実行する
  - 新しいルールを追加する場合は、両方の設定に同じ重大度で追加する
  - コミットのタイトルはスコープなしにする（例: `feat: eslint-plugin-smarthrを6.34.0に更新`）。release-pleaseはパッケージのパス単位でリリースを判定するため、1つのコミットでも両パッケージがそれぞれリリースされる
- release直後はnpmレジストリへの反映に数分のタイムラグが生じることがあります。`pnpm install` が `ERR_PNPM_NO_MATCHING_VERSION` で失敗した場合、GitHub Actionsのpublishジョブ自体は成功していることが多いため、`curl -s https://registry.npmjs.org/eslint-plugin-smarthr` でレジストリの実際の状態を直接確認し、反映を待ってから再試行してください（ローカルの `safe-chain` という供給網セキュリティツールが「公開直後のバージョンを一定期間抑制する」ポリシーを持っている場合は `--safe-chain-skip-minimum-package-age` を付与します）
  - レジストリにバージョンが表示されていても、tarballの配信が始まっておらず `ERR_PNPM_TARBALL_SIBLING_FETCH_FAILED`（HTTP 404）で失敗することがあります。この場合は `curl -sI https://registry.npmjs.org/eslint-plugin-smarthr/-/eslint-plugin-smarthr-X.Y.Z.tgz` が200を返すようになるまで待ってから再試行してください
