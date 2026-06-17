# storybook-focus-indicator

Storybook上でフォーカスインジケーター（フォーカスリング）のアクセシビリティチェックを自動化するユーティリティパッケージです。

## なぜこのパッケージが必要か

アクセシビリティ簡易チェックリストの「フォーカスリングの四辺がすべて表示されている」を満たすかどうかを、Storybook上で視覚的に確認できます。

- キーボード操作時のフォーカスリングが正しく表示されているか確認
- `overflow: hidden` などでフォーカスリングが途切れていないか確認
- すべてのインタラクティブ要素で一貫したフォーカス表示がされているか確認

## インストール

```bash
npm install --save-dev storybook-focus-indicator
# or
pnpm add -D storybook-focus-indicator
```

## 前提条件

このパッケージは [Storybook Pseudo States Addon](https://storybook.js.org/addons/storybook-addon-pseudo-states) を使用します（peerDependencyとして指定されています）。

```bash
npm install --save-dev storybook-addon-pseudo-states
# or
pnpm add -D storybook-addon-pseudo-states
```

`.storybook/main.ts` に追加:

```typescript
export default {
  addons: [
    'storybook-addon-pseudo-states',
    // ... other addons
  ],
}
```

## 動作

このテンプレートは以下の処理を自動で実行します：

1. **Pseudo States Addonの設定**: `:focus`、`:focus-visible`、`:focus-within` 疑似クラスを有効化
2. **自動フォーカス**: Story内の最初のリンク（`role="link"`）とコンボボックス（`role="combobox"`）に自動的にフォーカスを当てる

これにより、フォーカスリングが正しく表示されているかを視覚的に確認できます。

## 使い方

### 基本的な使い方

各Storybookファイルに `FocusIndicatorTest` Storyを追加します:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { focusIndicatorTemplate } from 'storybook-focus-indicator'
import { MyComponent } from './MyComponent'

const meta = {
  component: MyComponent,
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // ...
  },
}

// フォーカスインジケーターテスト用のStory
export const FocusIndicatorTest: Story = focusIndicatorTemplate(Default)
```

### カスタマイズ

Pseudo States Addonの設定をカスタマイズしたい場合:

```typescript
export const FocusIndicatorTest: Story = focusIndicatorTemplate(Default, {
  pseudoOptions: {
    rootSelector: '#custom-root', // カスタムルート要素を指定
    focus: true,                   // :focus を有効化（デフォルト: true）
    focusVisible: true,            // :focus-visible を有効化（デフォルト: true）
    focusWithin: false,            // :focus-within を無効化（デフォルト: true）
  },
})
```

通常はデフォルト設定で問題ありません。特殊なDOM構造（Dialogなど）でフォーカス状態が適用されない場合のみカスタマイズしてください。

## チェック方法

1. Storybookを起動
2. `FocusIndicatorTest` Storyを開く
3. 自動的にリンクとコンボボックスにフォーカスが当たります
4. フォーカスリングの四辺がすべて表示されているか目視で確認
5. 必要に応じてTabキーで他の要素にも移動して確認

**確認ポイント:**
- フォーカスリングが四辺すべて見えているか
- `overflow: hidden` などで途切れていないか
- フォーカスリングの色やスタイルが適切か

## ESLintルールとの併用

`eslint-plugin-smarthr` の `storybook-require-focus-indicator-test` ルールを使用することで、`FocusIndicatorTest` Storyの追加を強制できます。

### 推奨設定（Storybookファイルのみに適用）

ESLint Flat Config形式の場合:

```javascript
import smarthr from 'eslint-plugin-smarthr'

export default [
  {
    files: ['**/*.stories.{ts,tsx}'],
    plugins: {
      smarthr,
    },
    rules: {
      'smarthr/storybook-require-focus-indicator-test': 'warn', // または 'error'
    },
  },
]
```

従来の設定形式の場合:

```javascript
{
  overrides: [
    {
      files: ['*.stories.ts', '*.stories.tsx'],
      rules: {
        'smarthr/storybook-require-focus-indicator-test': 'warn'
      }
    }
  ]
}
```

> **Note:** このルールはStorybookファイル (`.stories.ts` / `.stories.tsx`) 専用です。設定で対象ファイルを絞り込むことで、ESLintの実行効率が向上します。

## トラブルシューティング

### フォーカスが当たらない

このテンプレートは最初の `link` と `combobox` にのみ自動フォーカスします。

- 対象の要素が適切な `role` 属性を持っているか確認してください
- `button` や `textbox` など他の要素は、Pseudo States Addonによりフォーカス疑似クラスが適用されるため、タブキーで移動すれば確認できます

### Dialogなどでフォーカスが当たらない

- デフォルトで `rootSelector: 'body'` が設定されているため、通常は問題ありません
- カスタムルート要素を使用している場合は `pseudoOptions.rootSelector` で指定してください

## ライセンス

MIT
