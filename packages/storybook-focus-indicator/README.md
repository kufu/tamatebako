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

このパッケージは [Storybook Pseudo States Addon](https://storybook.js.org/addons/storybook-addon-pseudo-states) を使用します。

```bash
npm install --save-dev storybook-addon-pseudo-states
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

フォーカスを当てる要素を限定したい場合:

```typescript
export const FocusIndicatorTest: Story = focusIndicatorTemplate(Default, {
  // 特定のroleのみチェック
  targetRoles: ['button', 'link'],
})
```

Pseudo States Addonの設定をカスタマイズしたい場合:

```typescript
export const FocusIndicatorTest: Story = focusIndicatorTemplate(Default, {
  pseudoOptions: {
    rootSelector: '#custom-root', // カスタムルート要素
    focus: true,
    focusVisible: true,
    focusWithin: false, // focus-within を無効化
  },
})
```

## チェック方法

1. Storybookを起動
2. `FocusIndicatorTest` Storyを開く
3. 画面上のインタラクティブ要素にフォーカスが当たった状態で表示される
4. フォーカスリングの四辺がすべて表示されているか目視で確認

## ESLintルールとの併用

`eslint-plugin-smarthr` の `storybook-require-focus-indicator-test` ルールを使用することで、`FocusIndicatorTest` Storyの追加を強制できます。

```javascript
{
  rules: {
    'smarthr/storybook-require-focus-indicator-test': 'warn'
  }
}
```

## トラブルシューティング

### フォーカスが当たらない

- 対象の要素が適切な `role` 属性を持っているか確認してください
- `targetRoles` オプションで明示的に指定してください

### Dialogなどでフォーカスが当たらない

- `rootSelector: 'body'` を指定してください（デフォルトで設定済み）

### 特定の要素のみチェックしたい

- `targetRoles` オプションで対象を絞り込んでください

## ライセンス

MIT
