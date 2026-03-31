# smarthr/format-translate-component

翻訳用コンポーネントを適用する際のルールを定めます。多言語対応を行う際に、翻訳コンポーネントの使用方法を統一することで、翻訳漏れや誤った使用方法を防ぎます。

## なぜ翻訳コンポーネントのルールが必要なのか

多言語対応を行うプロジェクトでは、翻訳コンポーネントの使用方法を統一することが重要です：

- **翻訳の一貫性**: コンポーネントの使用方法を統一することで、翻訳対象のテキストを確実に抽出できます
- **メンテナンス性の向上**: 誤った使用方法を防ぐことで、翻訳システムの保守が容易になります
- **バグの防止**: 空の翻訳コンポーネントや不適切なネストを禁止することで、実行時エラーを防ぎます

## チェック内容

このルールは以下をチェックします：

- 翻訳コンポーネント内に他のコンポーネント（`<Any>`など）が直接含まれていないか
- 翻訳コンポーネントが空でないか
- 翻訳コンポーネント内に自己終了タグのコンポーネントが含まれていないか
- 設定で禁止された属性（例: `data-translate`）が使用されていないか

## options

### componentName

翻訳コンポーネントの名前を指定します（デフォルト: `'Translate'`）

### componentPath

翻訳コンポーネントのimportパスを指定します（オプション）

### prohibitAttributies

使用を禁止する属性名の配列を指定します（オプション）

## rules

```js
{
  rules: {
    'smarthr/format-translate-component': [
      'error', // 'warn', 'off'
      {
        componentName: 'Translate',
        // componentPath: '@/any/path/Translate',
        // prohibitAttributies: ['data-translate'],
      }
    ]
  },
}
```

## ❌ Incorrect

```jsx
<Translate><Any>ほげ</Any></Translate>
```

```jsx
<Translate><Any /></Translate>
```

```jsx
<Translate></Translate>
```

```jsx
// prohibitAttributies: ['data-translate'],
<Any data-translate="true">...</Any>
```

## ✅ Correct

```jsx
<Translate>ほげ</Translate>
```
```jsx
<Translate>ほげ<br />ふが</Translate>
```
```jsx
<Translate>{any}</Translate>
```
```jsx
<Translate dangerouslySetInnerHTML={{ __html: "ほげ" }} />
```
```jsx
// prohibitAttributies: ['data-translate'],
<Any data-hoge="true">...</Any>
```
