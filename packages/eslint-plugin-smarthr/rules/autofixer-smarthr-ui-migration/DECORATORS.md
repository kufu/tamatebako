# smarthr-ui decorators属性の前提知識

## decorators属性の本来の目的と用途

### 基本的な目的
- **デフォルト文言の変更用**のAPI
- smarthr-uiがコンポーネント内部で表示するテキストをカスタマイズする手段

### 主な使用用途
- **多言語化（翻訳）**: ほぼすべてのケースで多言語対応のために利用されている
- 例: 日本語 → 英語、中国語などへの翻訳
- 例: 「すべて選択」 → 「Select All」

### 実装パターン
```tsx
// v93以前の典型的な使い方（多言語化）
<ThCheckbox decorators={{ selectAll: () => 'Select All' }} />
<DropZone decorators={{ selectButtonLabel: () => 'Choose File' }} />
```

## v94以降の方針変更

### 内部で翻訳対応
- v94以降、smarthr-ui内部で翻訳機能を提供
- decorators属性は**不要**になった
- 削除できる

## migrator開発時の考慮事項

### エラーメッセージの方針

**❌ 避けるべき表現:**
- 「IntlProviderのみを使用してください」（内部実装の詳細、利用者には意味不明）
- 「decorators属性を削除してください」（理由が不明）

**✅ 推奨される表現:**
- 「多言語対応はsmarthr-ui内で自動的に行われるため、decorators属性は不要です」
- 「翻訳はsmarthr-ui内で自動的に行われます」
- 利用者視点で「なぜ削除できるのか」が理解できる説明

### 削除時の判断基準

- decoratorsは翻訳目的で使われていた
- smarthr-ui内部で翻訳対応済み
- → 自動修正で削除

## 実績

### v92-to-v93: DropZone
- decorators.selectButtonLabel → selectButtonLabel 属性へ移行
- 空のdecoratorsは削除
- IntlProviderの翻訳を使用

### v93-to-v94: ThCheckbox
- decorators 完全削除（新属性への移行なし）
- 翻訳はsmarthr-ui内で自動対応
- 全ケースで自動修正可能

## 今後のversion追加時のチェックリスト

1. decorators削除対象のコンポーネントを確認
2. 新属性への移行が必要か、完全削除か判断
3. エラーメッセージは利用者視点で作成
   - 「なぜ削除できるのか」を説明
   - 「翻訳は内部で自動的に行われます」を明示
