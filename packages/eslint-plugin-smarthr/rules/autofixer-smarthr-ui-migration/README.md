# smarthr/autofixer-smarthr-ui-migration

smarthr-ui のバージョン間の移行を支援する自動修正ルールです。

オプションで移行元・移行先のバージョンを指定することで、該当する breaking changes を検出し、自動修正します。

**重要:** このルールは一時的な使用を想定しています。移行完了後は無効化してください。

## オプション

このルールは `from` と `to` オプションの指定が必須です。

```javascript
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "v90", "to": "v91" }]
  }
}
```

### 複数バージョンのスキップ

複数のバージョンをまたぐ移行も可能です（例: `v90` → `v93`）。この場合、存在する移行ルールを自動的に適用し、実装されていないバージョンについては警告を表示します。

```javascript
{
  "rules": {
    // v90→v91とv92→v93のルールが適用される（v91→v92がない場合は警告）
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "v90", "to": "v93" }]
  }
}
```

## サポートされているバージョン

各バージョンの破壊的変更の詳細と対応内容については、リンク先の移行ガイドを参照してください。

| バージョン | 詳細 |
|-----------|------|
| `v90` → `v91` | [移行ガイド](./versions/v90-to-v91.md) |

## 使用方法

### eslint-config-smarthr を使用している場合

`.eslintrc.js` または `eslint.config.js` でルールを有効化してください:

```javascript
module.exports = {
  extends: ['smarthr'],
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'v90', to: 'v91' }],
  },
}
```

### 個別に使用する場合

```javascript
module.exports = {
  plugins: ['smarthr'],
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'v90', to: 'v91' }],
  },
}
```

## 自動修正の実行

```bash
# 自動修正を実行
eslint --fix .

# または
npm run lint:fix
```

## 移行後の対応

移行が完了したら、このルールを無効化またはオプションを更新してください:

```javascript
module.exports = {
  extends: ['smarthr'],
  rules: {
    // v91 への移行完了後はコメントアウトまたは削除
    // 'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'v90', to: 'v91' }],

    // v92 への移行時は新しいオプションを設定
    // 'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'v91', to: 'v92' }],
  },
}
```

## 制限事項

このルールは**あくまで機械的に対応できる箇所を自動修正するもの**です。以下の点に注意してください：

### 自動修正の限界

- **100%の移行を保証するものではありません**
- 複雑なコード（変数経由での属性設定、動的な値など）は自動修正されない場合があります
- 一部のケースは検出のみでエラーを表示し、手動対応が必要です

### 移行完了後に必要な作業

自動修正を実行した後は、必ず以下を実施してください：

1. **手動での確認と修正**
   - 自動修正されなかったエラーを確認し、手動で対応
   - コードレビューで変更内容を確認

2. **表示確認**
   - VRT（Visual Regression Testing）での確認
   - 実際の画面で表示崩れがないか目視確認
   - 機能的に問題がないか動作確認

各バージョンの具体的な制限事項については、移行ガイドを参照してください。

## 将来のバージョン対応

新しいバージョンがリリースされた際は、このルールに新しいバージョンのサポートを追加していきます。各バージョンの移行ルールは `versions/` ディレクトリに追加されます。
