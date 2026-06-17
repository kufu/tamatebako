# smarthr/storybook-require-focus-indicator-test

Storybookファイルに `FocusIndicatorTest` Story の追加を推奨するルールです。

## なぜこのルールが必要か

アクセシビリティ簡易チェックリストの「フォーカスリングの四辺がすべて表示されている」を満たすかどうかを、Storybook上で視覚的に確認するためです。

**メリット:**
- フォーカスインジケーターのチェックを標準化
- キーボード操作時のアクセシビリティを向上
- `overflow: hidden` などでフォーカスリングが途切れていないか確認

## ルール設定

```javascript
{
  rules: {
    'smarthr/storybook-require-focus-indicator-test': 'error'
  }
}
```

## ❌ Incorrect

`FocusIndicatorTest` Story が存在しない、または `focusIndicatorTemplate` を使用していない:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from './MyComponent'

const meta = {
  component: MyComponent,
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

// FocusIndicatorTest が存在しない
```

## ✅ Correct

`focusIndicatorTemplate` を使用して `FocusIndicatorTest` Story を追加:

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
  args: {},
}

// ✅ Good: FocusIndicatorTest を追加
export const FocusIndicatorTest: Story = focusIndicatorTemplate(Default)
```

## パッケージのインストール

```bash
npm install --save-dev storybook-focus-indicator
# or
pnpm add -D storybook-focus-indicator
```

詳細な使い方は [storybook-focus-indicator のドキュメント](https://github.com/kufu/tamatebako/tree/master/packages/storybook-focus-indicator) を参照してください。

## 無効化したい場合

### 特定のファイルのみ無効化

フォーカスするべき要素がないStory（静的なテキスト表示のみなど）の場合は、ファイル単位で無効化できます:

```typescript
/* eslint-disable smarthr/storybook-require-focus-indicator-test */
import type { Meta, StoryObj } from '@storybook/react'

// 例: インタラクティブな要素を含まないStory
export const TextOnly: Story = {
  render: () => <div>静的なテキスト表示のみ</div>
}
```

## 関連リンク

- [storybook-focus-indicator パッケージ](https://github.com/kufu/tamatebako/tree/master/packages/storybook-focus-indicator)
- [Storybook Pseudo States Addon](https://storybook.js.org/addons/storybook-addon-pseudo-states)
