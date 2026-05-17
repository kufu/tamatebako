# smarthr-ui v93 → v94 移行ガイド

このドキュメントは、smarthr-ui v93からv94への移行に必要な変更をまとめたものです。

## 対応する破壊的変更

### 1. ThCheckbox: decorators属性の削除

v94では、`ThCheckbox`コンポーネントから`decorators`属性が削除されました。チェックボックスラベルの翻訳はsmarthr-ui内で自動的に行われます。

#### 変更内容

**削除された属性:**
- `decorators?: DecoratorsType<'selectAll'>`

**翻訳について:**
- デフォルトラベル: 「すべて選択」
- カスタム翻訳が必要な場合は、IntlProviderで `selectAll` キーを設定

#### 移行方法

**Before (v93):**
```tsx
<ThCheckbox decorators={{ selectAll: () => 'Select All' }} />
```

**After (v94):**
```tsx
<ThCheckbox />
```

IntlProviderで翻訳を設定する場合:
```tsx
<IntlProvider translations={{ selectAll: 'Select All' }}>
  <ThCheckbox />
</IntlProvider>
```

#### 自動修正可能なパターン

以下のパターンは、ESLintの`--fix`オプションで自動的に修正されます：

```tsx
// decorators属性を削除
<ThCheckbox decorators={{ selectAll: () => '全選択' }} />
→ <ThCheckbox />

// 空のdecoratorsも削除
<ThCheckbox decorators={{}} />
→ <ThCheckbox />

// 複雑な式でも削除
<ThCheckbox decorators={{ selectAll: () => getLabel() }} />
→ <ThCheckbox />
```

#### 手動対応

decorators属性内でカスタムラベルを設定していた場合、IntlProviderで翻訳を設定する必要があります。

```tsx
// Before
<ThCheckbox decorators={{ selectAll: () => 'Custom Label' }} />

// After - IntlProviderで翻訳を設定
<IntlProvider translations={{ selectAll: 'Custom Label' }}>
  <ThCheckbox />
</IntlProvider>
```

#### escape hatch className の変更

v94では、ThCheckboxコンポーネントのescape hatch用className（`smarthr-ui-ThCheckbox`等）に変更はありません。

## ESLintルールの使用方法

### .eslintrc.js の設定

```javascript
module.exports = {
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: '93', to: '94' }],
  },
}
```

### 自動修正の実行

```bash
# エラーを確認
pnpm run lint

# 自動修正を実行
pnpm run lint --fix
```

### smarthrUiAlias オプション

プロジェクト固有のsmarthr-ui aliasパスを使用している場合は、`smarthrUiAlias`オプションを指定してください。

```javascript
module.exports = {
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': [
      'error',
      {
        from: '93',
        to: '94',
        smarthrUiAlias: '@/components/parts/smarthr-ui', // プロジェクト固有のalias
      },
    ],
  },
}
```

## 参考リンク

- [smarthr-ui v94.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v94.0.0)
- [PR #6235: ThCheckbox の decorators 属性削除](https://github.com/kufu/smarthr-ui/pull/6235)
