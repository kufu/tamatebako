# smarthr-ui v92 → v93 移行ガイド

このドキュメントは、smarthr-ui v92からv93への移行に必要な変更をまとめたものです。

## 対応する破壊的変更

### 1. DropZone: decorators属性の削除

v93では、`DropZone`コンポーネントから`decorators`属性が削除されました。ファイル選択ボタンのラベルは、`selectButtonLabel`属性として独立しました。

#### 変更内容

**削除された属性:**
- `decorators?: DecoratorsType<'selectButtonLabel'>`

**追加された属性:**
- `selectButtonLabel?: string`
  - ファイル選択ボタンのラベル
  - 省略時はIntlProviderの翻訳が適用される（デフォルト: 「ファイルを選択」）

#### 移行方法

**Before (v92):**
```tsx
<DropZone decorators={{ selectButtonLabel: () => 'Choose File' }} />
```

**After (v93):**
```tsx
<DropZone selectButtonLabel="Choose File" />
```

**省略も可能（IntlProviderの翻訳を使用）:**
```tsx
<DropZone />
```

#### 自動修正可能なパターン

以下のパターンは、ESLintの`--fix`オプションで自動的に修正されます：

```tsx
// 文字列リテラル
<DropZone decorators={{ selectButtonLabel: () => 'Choose' }} />
→ <DropZone selectButtonLabel="Choose" />

// 変数参照
<DropZone decorators={{ selectButtonLabel: () => buttonLabel }} />
→ <DropZone selectButtonLabel={buttonLabel} />

// 関数呼び出し
<DropZone decorators={{ selectButtonLabel: () => getLabel() }} />
→ <DropZone selectButtonLabel={getLabel()} />

// テンプレートリテラル
<DropZone decorators={{ selectButtonLabel: () => `Select ${fileType}` }} />
→ <DropZone selectButtonLabel={`Select ${fileType}`} />

// decorators が空の場合
<DropZone decorators={{}} />
→ <DropZone />
```

#### 手動対応が必要なパターン

以下のパターンは自動修正できません。手動で修正してください：

```tsx
// ❌ 引数を使用している場合
<DropZone decorators={{ selectButtonLabel: (defaultLabel) => customLabel || defaultLabel }} />

// ❌ BlockStatement（return文を使用）
<DropZone decorators={{ selectButtonLabel: () => { return 'Choose' } }} />

// ❌ spread syntax
<DropZone decorators={{ ...baseDecorators, selectButtonLabel: () => 'Choose' }} />

// ❌ selectButtonLabel以外のキーがある場合
<DropZone decorators={{ selectButtonLabel: () => 'Choose', otherKey: () => 'value' }} />
```

#### escape hatch className の変更

v93では、DropZoneコンポーネントのescape hatch用className（`smarthr-ui-DropZone`等）に変更はありません。

## ESLintルールの使用方法

### .eslintrc.js の設定

```javascript
module.exports = {
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: '92', to: '93' }],
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
        from: '92',
        to: '93',
        smarthrUiAlias: '@/components/parts/smarthr-ui', // プロジェクト固有のalias
      },
    ],
  },
}
```

## 参考リンク

- [smarthr-ui v93.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v93.0.0)
- [PR #6236: DropZone の decorators 属性削除](https://github.com/kufu/smarthr-ui/pull/6236)
