# 開発者向けガイド

このドキュメントは、`autofixer-smarthr-ui-migration` ルールに新しいバージョンの移行ルールを追加する開発者向けのガイドです。

## 新バージョン追加の流れ

新しいバージョン（例: v91→v92）の移行ルールを追加する際の手順：

1. smarthr-ui のリリースノートから対応が必要な変更を確認
   - 破壊的変更（BREAKING CHANGES）
   - 推奨される書き方への置き換え（非破壊的だが移行を推奨するもの）
2. versionディレクトリを作成（`versions/vXX-to-vYY/`）
3. 移行ルール実装ファイルを作成（`versions/vXX-to-vYY/index.js`）
4. 移行ガイドを作成（`versions/vXX-to-vYY/README.md`）
5. **実装参考ドキュメントを作成**（`versions/vXX-to-vYY/REFERENCE.md`）
   - 前versionのREFERENCE.mdをベースにコピー
   - 今回のversionに特有のパターンを追加
6. テストケースを作成（`versions/vXX-to-vYY/test.js`）
7. VERSION_MODULES に登録（`index.js`）
8. メインテストファイルを更新（`test/autofixer-smarthr-ui-migration.js`）
9. README を更新（サポートバージョンテーブル）
10. **このDEVELOPER.mdを更新**（最新versionへの参照を更新）

## ファイル構成

```
rules/autofixer-smarthr-ui-migration/
├── index.js                              # メインファイル（VERSION_MODULESの登録）
├── README.md                             # 使い方と概要
├── DEVELOPER.md                         # このファイル
├── versions/
│   ├── v90-to-v91/                     # v90→v91の移行ルール
│   │   ├── index.js                   # 移行ルール実装
│   │   ├── README.md                  # 移行ガイド（ユーザー向け）
│   │   ├── REFERENCE.md               # 実装参考（開発者向け）
│   │   └── test.js                    # テストケース
│   └── vXX-to-vYY/                     # ← 新規追加
│       ├── index.js                   # 移行ルール実装
│       ├── README.md                  # 移行ガイド（ユーザー向け）
│       ├── REFERENCE.md               # 実装参考（開発者向け）
│       └── test.js                    # テストケース
└── test/
    └── autofixer-smarthr-ui-migration.js  # メインテスト（共通部分 + version別テストの統合）
```

## AIアシスタントを使って新バージョンを追加する場合

Claude Code、ChatGPT、Cursor、GitHub Copilot などのAI開発アシスタントを使用する場合、以下のプロンプトを貼り付けてください。
`[...]` の部分を実際の値に置き換えてから使用してください。

**重要:** 新しいバージョンを追加したら、このプロンプトの「参考にするファイル」セクションを最新のversionディレクトリに更新してください。これにより、次回以降のversion追加時により適切な実装が行えます。

```
autofixer-smarthr-ui-migrationルールに新しいバージョン（v[XX]→v[YY]）の移行ルールを追加してください。

## 参考にするファイル

必ず以下のファイルを読んで、実装パターンを踏襲してください（最新のversionディレクトリを参照）：
- rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/REFERENCE.md（実装パターンの詳細説明）
- rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/index.js（実装例）
- rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/README.md（ユーザー向け移行ガイド）
- rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/test.js（テストケース）
- test/autofixer-smarthr-ui-migration.js（メインテスト）
- libs/common.js（rootPathの取得、tsconfig.jsonのpaths設定読み込み）

## 対応する変更

smarthr-ui v[YY]のリリースノート: [GitHubリリースページのURL]

以下の変更に対応してください（破壊的変更および推奨パターンへの移行）：

1. [変更内容1の説明]
   - 例: ComponentA が ComponentB にリネーム（破壊的変更）
   - 自動修正: [可能/不可能/条件付き]
   - セレクター: `ImportDeclaration`, `JSXOpeningElement[name.name="ComponentA"]`

2. [変更内容2の説明]
   - 例: propsXがpropsYにリネーム（破壊的変更）
   - 自動修正: [可能/不可能/条件付き]
   - セレクター: `JSXAttribute[name.name="propsX"]`

3. [変更内容3の説明]
   - 例: 非推奨パターンから推奨パターンへの置き換え（非破壊的）
   - 自動修正: [可能/不可能/条件付き]
   - セレクター: [該当するASTセレクター]

4. ...

**自動修正の判断基準:**
- ✅ 自動修正可能: 機械的に100%正しく変換できる場合
- ⚠️ エラーのみ: 手動確認が必要な場合（未知の属性がある、複数の対処方法がある等）
- ❌ 検出しない: 複雑すぎる、影響範囲が広すぎる場合

## 実装内容

1. versionディレクトリを作成: `versions/v[XX]-to-v[YY]/`

2. `versions/v[XX]-to-v[YY]/index.js` を作成
   - messages定義
   - createCheckers関数の実装（`createCheckers(context, sourceCode, options = {})`）
   - 必要に応じてヘルパー関数

   **smarthrUiAliasオプションを利用する場合:**
   ```javascript
   const { rootPath } = require('../../../../libs/common')

   createCheckers(context, sourceCode, options = {}) {
     const customSmarthrUiAlias = options.smarthrUiAlias
     const validSources = ['smarthr-ui']
     if (customSmarthrUiAlias) {
       validSources.push(customSmarthrUiAlias)
     }

     const isAliasFile = customSmarthrUiAlias && isFileMatchingSmarthrUiAlias(
       context.getFilename(),
       customSmarthrUiAlias
     )

     // ... チェッカー実装
   }
   ```

3. `versions/v[XX]-to-v[YY]/README.md` を作成（ユーザー向け移行ガイド）
   - 各変更の説明
   - Before/Afterのコード例
   - 制限事項

4. `versions/v[XX]-to-v[YY]/REFERENCE.md` を作成（開発者向け実装参考）
   - 前versionのREFERENCE.mdをベースにコピー
   - 今回のversionに特有の実装パターンを追加

5. `versions/v[XX]-to-v[YY]/test.js` を作成
   - valid: v[YY]形式が正常に通ること
   - invalid: v[XX]形式が検出されて修正されること

   **テストケースの構造:**
   ```javascript
   const v[XX]Tov[YY]Options = [{ from: '[XX]', to: '[YY]' }]

   module.exports = {
     valid: [
       { code: `import { NewComponent } from 'smarthr-ui'`, options: v[XX]Tov[YY]Options },
       { code: `<NewComponent>...</NewComponent>`, options: v[XX]Tov[YY]Options },
     ],
     invalid: [
       {
         code: `import { OldComponent } from 'smarthr-ui'`,
         output: `import { NewComponent } from 'smarthr-ui'`,
         options: v[XX]Tov[YY]Options,
         errors: [{ messageId: 'renameComponent', data: { old: 'OldComponent', new: 'NewComponent', to: 'v[YY]' } }],
       },
     ],
   }
   ```

6. `index.js`のVERSION_MODULESに登録
   ```javascript
   const v[XX]Tov[YY] = require('./versions/v[XX]-to-v[YY]/index')

   const VERSION_MODULES = {
     'v90-v91': v90ToV91,
     'v[XX]-v[YY]': v[XX]Tov[YY], // ← 追加
   }
   ```

7. `test/autofixer-smarthr-ui-migration.js` を更新
   ```javascript
   const v[XX]Tov[YY]Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v[XX]-to-v[YY]/test')

   ruleTester.run('autofixer-smarthr-ui-migration', rule, {
     valid: [
       ...v90ToV91Tests.valid,
       ...v[XX]Tov[YY]Tests.valid, // ← 追加
     ],
     invalid: [
       // ... 共通テストケース ...
       ...v90ToV91Tests.invalid,
       ...v[XX]Tov[YY]Tests.invalid, // ← 追加
     ],
   })
   ```

8. README.mdのサポートバージョンテーブルを更新

9. **DEVELOPER.mdを更新**
   - AIアシスタント用プロンプトの「参考にするファイル」を最新versionに更新
   - 「実装の参考ポイント」セクションの「最新version」リンクを更新

## 注意事項

- このルールは**読みやすさ重視**で設計されています（一時的な使用を想定）
- 実行速度より、後から読んだときの理解しやすさを優先してください
- JSDocコメントを適切に追加してください
- ディレクトリ名は必ず `vXX-to-vYY` 形式にしてください（内部キーと統一）

## 共通機能：smarthrUiAlias オプション

プロジェクト固有のsmarthr-ui aliasパスに対応するため、`smarthrUiAlias`オプションが利用可能です。

### createCheckers関数でのオプション利用

```javascript
createCheckers(context, sourceCode, options = {}) {
  const customSmarthrUiAlias = options.smarthrUiAlias
  const validSources = ['smarthr-ui']
  if (customSmarthrUiAlias) {
    validSources.push(customSmarthrUiAlias)
  }

  // aliasファイルかどうかの判定
  const isAliasFile = customSmarthrUiAlias && isFileMatchingSmarthrUiAlias(
    context.getFilename(),
    customSmarthrUiAlias
  )

  // ...
}
```

### 主な用途

1. **importのチェック範囲拡張**: `smarthr-ui`に加えて、aliasパス（例: `@/components/parts/smarthr-ui`）からのimportも置換対象
2. **aliasファイル内のexport変数名置換**: `smarthrUiAlias`配下のファイルで、smarthr-uiコンポーネント名と同じexport変数名を自動置換

詳細は[README.md](./README.md#smarthr-ui-の-alias-を使用している場合)を参照。

### 🔄 今後の検討事項：共通化

**現状:** 各versionディレクトリ（v90-to-v91など）で個別にsmarthrUiAlias関連の処理を実装しています。

**検討中:** 以下の処理を共通化できる可能性があります：
- `validSources`の拡張ロジック
- `isFileMatchingSmarthrUiAlias`ヘルパー関数
- export変数名の置換チェッカー追加ロジック

**実装時期:** v92移行ルール追加時に、重複を確認して共通化を検討してください。共通化する場合は、以下のような場所が候補です：
- `libs/common.js`に共通ヘルパー関数を追加
- 各versionモジュールで共通の基底関数を提供

## 完了後の作業

実装が完了したら、**必ずこのDEVELOPER.mdを更新**してください：

1. 「参考にするファイル」セクション（AIアシスタント用プロンプト内）で、v90-to-v91を今回追加したversionに変更
2. 「実装の参考ポイント」セクションの「最新version」リンクを今回追加したversionに更新
3. `versions/vXX-to-vYY/REFERENCE.md` を作成（前versionのREFERENCE.mdをベースに、今回特有のパターンを追加）

これにより、このドキュメント自体が常に最新の実装を参照し、**自己進化**します。
```

## チェックリスト

新バージョン追加時のチェックリスト：

### ディレクトリとファイル作成
- [ ] `versions/vXX-to-vYY/` ディレクトリを作成
- [ ] `versions/vXX-to-vYY/index.js` を作成
  - [ ] messages定義が含まれている
  - [ ] createCheckers関数が実装されている（`createCheckers(context, sourceCode, options = {})`）
  - [ ] smarthrUiAliasオプションに対応している場合：
    - [ ] `const { rootPath } = require('../../../../libs/common')` をimport
    - [ ] `validSources`に`customSmarthrUiAlias`を追加
    - [ ] `isAliasFile`でファイル判定を実装
  - [ ] ヘルパー関数にJSDocコメントがある
  - [ ] ファイル冒頭に変更サマリーコメントがある
- [ ] `versions/vXX-to-vYY/README.md` を作成（ユーザー向け移行ガイド）
  - [ ] 各変更の説明がある
  - [ ] Before/Afterのコード例がある
  - [ ] 制限事項が記載されている
- [ ] `versions/vXX-to-vYY/REFERENCE.md` を作成（開発者向け実装参考）
  - [ ] 前versionのREFERENCE.mdをベースにコピー
  - [ ] 今回のversionに特有の実装パターンを追加
  - [ ] よくある実装パターンセクションを更新
- [ ] `versions/vXX-to-vYY/test.js` を作成
  - [ ] validケースがある（v[YY]形式）
  - [ ] invalidケースがある（v[XX]形式の検出と修正）
  - [ ] module.exportsでvalidとinvalidをエクスポート

### 登録と統合
- [ ] `index.js`のVERSION_MODULESに登録
- [ ] `test/autofixer-smarthr-ui-migration.js` を更新（version別テストをインポート）
- [ ] README.mdのサポートバージョンテーブルに追加
- [ ] **DEVELOPER.mdを更新**
  - [ ] AIアシスタント用プロンプトの「参考にするファイル」を最新versionに更新
  - [ ] 「実装の参考ポイント」セクションの「最新version」リンクを更新

### 動作確認
- [ ] `npm test -- test/autofixer-smarthr-ui-migration.js` が通過
- [ ] オプション `{ from: "[XX]", to: "[YY]" }` で動作確認
- [ ] 複数バージョンスキップ（例: `{ from: "90", to: "[YY]" }`）でも動作確認
- [ ] smarthrUiAliasオプション対応がある場合：
  - [ ] `{ from: "[XX]", to: "[YY]", smarthrUiAlias: "@/components/parts/smarthr-ui" }` で動作確認
  - [ ] aliasファイル内のexport変数名が置換されることを確認

### 実プロダクトでの検証

単体テストが通過したら、実際のプロダクトで動作確認を行います。

**手順:**

1. **対象プロダクトの選択**
   - ローカルにある実プロダクトを選択（例: `/works/workflow/michi/frontend`）

2. **ブランチ作成**
   - `staging` ブランチから新しいブランチを作成（`staging` がない場合は `master` または `main`）
   ```bash
   cd /path/to/product
   git checkout staging  # または master/main
   git pull
   git checkout -b test/migrator-vXX-to-vYY
   ```

3. **migratorのコピーと設定**
   - 開発中のmigratorを対象プロダクトにコピー
   - `.eslintrc.js` または `eslint.config.js` でルールを有効化
   ```javascript
   {
     rules: {
       'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'XX', to: 'YY' }]
     }
   }
   ```

4. **初回実行**
   ```bash
   npm run lint:fix  # または eslint --fix .
   ```

5. **問題の修正と再実行**
   - 実行時に出た問題（エラー、不正な変換など）を確認
   - 問題があれば migrator の実装を修正
   - **重要:** 再実行前に、staging が更新されていない状態（migration前の状態）に戻す
   ```bash
   git reset --hard HEAD  # 変更を破棄
   # migratorを修正後、再度実行
   npm run lint:fix
   ```
   - 問題が解決するまで手順5を繰り返す

6. **PR作成**
   - 問題が修正されたことを確認できたら、差分を確認しやすいよう draft で PR 作成
   ```bash
   git add .
   git commit -m "test: vXX to vYY migration test"
   git push -u origin test/migrator-vXX-to-vYY
   gh pr create --draft --title "test: vXX to vYY migration test" --body "migratorの動作確認用PR"
   ```
   - PR の差分をレビューして、期待通りの変換が行われているか確認

**確認ポイント:**
- [ ] エラーが出ずに実行完了する
- [ ] 意図した変換が正しく行われている
- [ ] 不要な変更が含まれていない
- [ ] エッジケースでも正しく動作する

## 参考情報

### smarthr-ui リリースノート

https://github.com/kufu/smarthr-ui/releases

### 実装の参考ポイント

各versionディレクトリに`REFERENCE.md`があり、実装パターンや注意点が記載されています。

**最新version:** [v90-to-v91/REFERENCE.md](./versions/v90-to-v91/REFERENCE.md)

このドキュメントには以下が含まれます：
- ファイル構造と各セクションの説明
- 定数定義、messages、createCheckers関数の書き方
- 自動修正の判断基準
- よくある実装パターン
- トラブルシューティング

**重要:** 新しいバージョンを追加したら、上記の「最新version」リンクを更新してください。

## トラブルシューティング

### テストが失敗する

1. エラーメッセージの順序を確認（Programノードの警告が先に来る）
2. fix関数の戻り値を確認（配列 or 単一のfix）
3. セレクターの正規表現が正しいか確認

### 自動修正が動かない

1. `meta.fixable: 'code'` が設定されているか確認
2. fix関数がfixerを正しく返しているか確認
3. ノードの範囲（range）が正しく計算されているか確認

### VERSION_MODULESのキーが見つからない

- キーは `'vXX-vYY'` 形式（ファイル名と一致）
- ユーザーが指定する from/to は `"XX"`, `"YY"` 形式（vなし）
- 内部的にstepKey生成時に `v${i}-v${i + 1}` でvを付与
