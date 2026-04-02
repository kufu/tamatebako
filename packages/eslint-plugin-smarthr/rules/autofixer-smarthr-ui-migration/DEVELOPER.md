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
5. テストケースを作成（`versions/vXX-to-vYY/test.js`）
6. VERSION_MODULES に登録（`index.js`）
7. メインテストファイルを更新（`test/autofixer-smarthr-ui-migration.js`）
8. README を更新（サポートバージョンテーブル）
9. **このDEVELOPER.mdを更新**（AIアシスタント用プロンプトの参考ファイルを最新versionに更新）

## ファイル構成

```
rules/autofixer-smarthr-ui-migration/
├── index.js                              # メインファイル（VERSION_MODULESの登録）
├── README.md                             # 使い方と概要
├── DEVELOPER.md                         # このファイル
├── versions/
│   ├── v90-to-v91/                     # v90→v91の移行ルール
│   │   ├── index.js                   # 移行ルール実装
│   │   ├── README.md                  # 移行ガイド
│   │   └── test.js                    # テストケース
│   └── vXX-to-vYY/                     # ← 新規追加
│       ├── index.js                   # 移行ルール実装
│       ├── README.md                  # 移行ガイド
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
- rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/index.js
- rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/README.md
- rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/test.js
- test/autofixer-smarthr-ui-migration.js

## 対応する変更

smarthr-ui v[YY]のリリースノート: [GitHubリリースページのURL]

以下の変更に対応してください（破壊的変更および推奨パターンへの移行）：

1. [変更内容1の説明]
   - 例: ComponentA が ComponentB にリネーム（破壊的変更）
   - 自動修正: [可能/不可能/条件付き]

2. [変更内容2の説明]
   - 例: propsXがpropsYにリネーム（破壊的変更）
   - 自動修正: [可能/不可能/条件付き]

3. [変更内容3の説明]
   - 例: 非推奨パターンから推奨パターンへの置き換え（非破壊的）
   - 自動修正: [可能/不可能/条件付き]

4. ...

## 実装内容

1. versionディレクトリを作成: `versions/v[XX]-to-v[YY]/`

2. `versions/v[XX]-to-v[YY]/index.js` を作成
   - messages定義
   - createCheckers関数の実装
   - 必要に応じてヘルパー関数

3. `versions/v[XX]-to-v[YY]/README.md` を作成
   - 各変更の説明
   - Before/Afterのコード例
   - 制限事項

4. `versions/v[XX]-to-v[YY]/test.js` を作成
   - valid: v[YY]形式が正常に通ること
   - invalid: v[XX]形式が検出されて修正されること

5. `index.js`のVERSION_MODULESに登録
   ```javascript
   const v[XX]Tov[YY] = require('./versions/v[XX]-to-v[YY]/index')

   const VERSION_MODULES = {
     'v90-v91': v90ToV91,
     'v[XX]-v[YY]': v[XX]Tov[YY], // ← 追加
   }
   ```

6. `test/autofixer-smarthr-ui-migration.js` を更新
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

7. README.mdのサポートバージョンテーブルを更新

8. **DEVELOPER.mdを更新**
   - AIアシスタント用プロンプトの「参考にするファイル」を最新versionに更新
   - 既存実装の参考ポイントで言及しているversionを最新に更新

## 注意事項

- このルールは**読みやすさ重視**で設計されています（一時的な使用を想定）
- 実行速度より、後から読んだときの理解しやすさを優先してください
- JSDocコメントを適切に追加してください
- ディレクトリ名は必ず `vXX-to-vYY` 形式にしてください（内部キーと統一）

## 完了後の作業

実装が完了したら、**必ずこのDEVELOPER.mdを更新**してください：

1. 「参考にするファイル」セクションで、v90-to-v91を今回追加したversionに変更
2. 「既存実装の参考ポイント」セクションで言及しているversionを今回追加したversionに更新
3. 上記の変更により、次回のversion追加時により適切な実装パターンが参照されるようになります

これにより、このドキュメント自体が常に最新の実装を参照し、**自己進化**します。
```

## チェックリスト

新バージョン追加時のチェックリスト：

### ディレクトリとファイル作成
- [ ] `versions/vXX-to-vYY/` ディレクトリを作成
- [ ] `versions/vXX-to-vYY/index.js` を作成
  - [ ] messages定義が含まれている
  - [ ] createCheckers関数が実装されている
  - [ ] ヘルパー関数にJSDocコメントがある
  - [ ] ファイル冒頭に変更サマリーコメントがある
- [ ] `versions/vXX-to-vYY/README.md` を作成
  - [ ] 各変更の説明がある
  - [ ] Before/Afterのコード例がある
  - [ ] 制限事項が記載されている
- [ ] `versions/vXX-to-vYY/test.js` を作成
  - [ ] validケースがある（v[YY]形式）
  - [ ] invalidケースがある（v[XX]形式の検出と修正）
  - [ ] module.exportsでvalidとinvalidをエクスポート

### 登録と統合
- [ ] `index.js`のVERSION_MODULESに登録
- [ ] `test/autofixer-smarthr-ui-migration.js` を更新（version別テストをインポート）
- [ ] README.mdのサポートバージョンテーブルに追加
- [ ] **DEVELOPER.mdを更新**
  - [ ] AIアシスタント用プロンプトの参考ファイルを最新versionに更新
  - [ ] 「既存実装の参考ポイント」セクションで言及するversionを最新に更新

### 動作確認
- [ ] `npm test -- test/autofixer-smarthr-ui-migration.js` が通過
- [ ] オプション `{ from: "[XX]", to: "[YY]" }` で動作確認
- [ ] 複数バージョンスキップ（例: `{ from: "90", to: "[YY]" }`）でも動作確認

## 参考情報

### smarthr-ui リリースノート

https://github.com/kufu/smarthr-ui/releases

### 既存実装の参考ポイント

**重要:** 新しいバージョンを追加したら、このセクションで言及しているversionを最新のものに更新してください。

#### 最新version（v90-to-v91）の構造
1. ファイル冒頭のコメント（対応する変更のサマリー）
2. 定数定義（DIALOG_COMPONENTS、STATUS_ICON_MAPなど）
3. messages定義（エラーメッセージ）
4. createCheckers関数
   - 各変更に対応するセレクターとハンドラー
   - fix関数での自動修正ロジック
5. ヘルパー関数（必要に応じて、JSDocコメント付き）

#### メッセージの書き方
- 何が変更されたのか明確に
- 必要に応じて対処方法も含める
- `{{変数名}}` で動的な値を埋め込める

#### 自動修正の判断基準
- **自動修正可能**: 機械的に100%正しく変換できる場合
- **エラーのみ**: 手動確認が必要な場合（意図が不明、複数の対処方法がある）
- **変換しない**: 複雑すぎる、安全性が確保できない場合

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
