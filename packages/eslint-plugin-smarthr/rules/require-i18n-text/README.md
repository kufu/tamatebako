# smarthr/require-i18n-text

JSX/TSXファイル内で文字列リテラルが直接指定されていないかをチェックするルールです。多言語化対応での翻訳対応漏れを防ぐために使用します。

## なぜi18n対応が必要なのか

多言語対応を行うアプリケーションでは、すべてのユーザー向けテキストを翻訳可能な形式で管理する必要があります：

### 翻訳漏れの防止

文字列リテラルを直接JSX内に記述すると、翻訳対象のテキストを見落としやすくなります。このルールを使用することで：

- すべてのユーザー向けテキストが翻訳関数を通すことを強制
- 新機能追加時の翻訳漏れを防止
- 翻訳が必要なテキストを自動的に検出

### 一貫性の確保

プロジェクト全体で統一された多言語化の手法を適用することで、コードの保守性が向上します。すべてのテキストが同じパターンで管理されるため、翻訳作業も効率化されます。

### メンテナンス性の向上

翻訳関数を使用することで：

- テキストの変更が一箇所で管理できる
- 同じテキストを複数箇所で使用する場合の重複を防げる
- 翻訳ファイルの管理が容易になる

## チェック内容

このルールは以下をチェックします：

- HTML要素の属性に文字列リテラルが直接指定されていないか
- カスタムコンポーネントの属性に文字列リテラルが直接指定されていないか
- 子要素に文字列リテラルが直接指定されていないか

なお、数値リテラル、真偽値、空文字列は検査対象外です。

## options

### elements

HTML要素とカスタムコンポーネントごとに検査対象とする属性名を指定します。オブジェクトのキーに要素名/コンポーネント名、値に属性名の配列を指定します。

**デフォルト**: `{ '*': ['alt', 'aria-label', 'term', 'title'] }`

オプションを指定しない場合、デフォルトでi18n候補属性がすべての要素で検査されます。

#### ワイルドカード `'*'` の使用

`'*'` をキーとして使用すると、すべての要素（HTML要素とカスタムコンポーネント両方）に対して属性をチェックできます。個別の要素設定がある場合は、そちらが優先されます。

```js
{
  elements: {
    // すべての要素で title をチェック
    '*': ['title'],
    // img要素は alt も追加でチェック
    'img': ['alt', 'title'],
    // Icon は除外（空配列で上書き）
    'Icon': []
  }
}
```

#### デフォルト設定の上書き

ワイルドカード `'*'` を明示的に設定すると、デフォルト設定を上書きできます。

```js
{
  elements: {
    // デフォルトを上書き
    '*': ['data-tooltip'],
    // 個別設定も可能
    'Button': ['label']
  }
}
```

## rules

```js
{
  rules: {
    'smarthr/require-i18n-text': [
      'error', // 'warn', 'off'
      {
        elements: {
          // HTML要素
          'img': ['alt', 'title'],
          'input': ['placeholder', 'title'],
          'button': ['title', 'aria-label'],

          // カスタムコンポーネント
          'Button': ['label', 'errorMessage'],
          'Input': ['placeholder', 'helperText'],
          'Dialog': ['title', 'description'],

          // すべての要素に適用
          '*': ['data-tooltip']
        }
      }
    ]
  },
}
```

## ❌ Incorrect

```jsx
// HTML要素の属性に文字列リテラルを直接指定
<img alt="Profile picture" />
<input placeholder="Enter your name" />
<button title="Close dialog" />

// カスタムコンポーネントの属性に文字列リテラルを直接指定
<Button label="Submit" />
<Input helperText="Required field" />

// 子要素に文字列リテラルを直接指定
<div>Hello World</div>
<Button>Submit</Button>
<p>Welcome to our application</p>
```

## ✅ Correct

```jsx
// 翻訳関数を使用
<img alt={t('profile_picture')} />
<input placeholder={t('enter_your_name')} />
<button title={t('close_dialog')} />

// カスタムコンポーネントでも翻訳関数を使用
<Button label={t('submit')} />
<Input helperText={t('required_field')} />

// 子要素でも翻訳関数を使用
<div>{t('hello_world')}</div>
<Button>{t('submit')}</Button>
<p>{t('welcome_message')}</p>

// 数値リテラル、真偽値、空文字列は検査対象外
<div>{123}</div>
<Button disabled={true} />
<input value="" />

// 検査対象外の属性（設定していない属性）
<input name="username" />
<div id="main-content" />
```
