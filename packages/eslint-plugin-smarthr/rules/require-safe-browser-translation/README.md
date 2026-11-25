# smarthr/require-safe-browser-translation

ブラウザの自動翻訳機能によるクラッシュを防ぐため、条件によって出入りする「要素で囲まれていない生のテキスト」を検知するルールです。

## なぜ必要なのか

ブラウザの自動翻訳機能(Google翻訳等)は、ページ内のテキストノードを別の要素(`<font>`等)に置き換えます。その後、条件によって当該テキストがアンマウントされると、Reactは既に存在しないテキストノードを操作しようとして `removeChild` / `insertBefore` で `NotFoundError` を起こし、画面全体がクラッシュします。

- https://github.com/facebook/react/issues/11538

```jsx
// loadingがtrue → falseに切り替わる際、翻訳によって置き換えられた「処理中」のテキストノードを削除できずクラッシュする
<div>
  <Icon />
  {loading && '処理中'}
</div>
```

テキストが要素で囲まれていれば、Reactが増減させる対象は翻訳の影響を受けない要素ノードになるため、この問題は発生しません。

```jsx
<div>
  <Icon />
  {loading && <SafeBrowserTranslation>処理中</SafeBrowserTranslation>}
</div>
```

## チェック内容

JSXの子要素(children)の位置にある式のうち、以下のパターンを検知します。

- `{cond && 生のテキスト}`
- `{cond ? 生のテキスト : X}` (逆の並び、ネストした三項演算子、`{cond && (cond2 ? 生のテキスト : X)}` も含む)

「生のテキスト」として扱うのは以下です。

- 文字列リテラル・テンプレートリテラル
  - 空文字列(`''`、` `` `)は何もレンダーされないため対象外です
- `Localizer` / `FormattedMessage` 要素
  - 実体としてテキストノードしか生成しないコンポーネントです
- `localize(...)` / `formatMessage(...)` の呼び出し結果
  - `intl.formatMessage(...)` のようなメンバー式経由の呼び出しも含みます

### 対象外になるケース

- JSX属性値(`aria-current={current ? 'page' : undefined}` 等)
  - 属性はテキストノードを生成せず、ブラウザ翻訳の影響を受けないためです
- 三項演算子のすべての分岐が同じ種類の場合
  - 文字列同士、もしくは同じコンポーネントかつ `key` も同一の場合、Reactはノードを再利用するためマウント/アンマウントが発生しません
  - 同じコンポーネントでも `key` が異なる場合(片方のみ指定、動的な値、スプレッド経由で判定できない場合を含む)は検知します
- 文字列が、型の確定しない式(変数等)とのみ組み合わさっている場合
  - 例: ``{count > max ? `${max}+` : count}``
  - Reactは文字列・数値をどちらも同じテキストノードとして扱うため、要素の出入りが発生せず安全なケースが多いためです
  - `null` / `undefined` / `true` / `false` / 空文字列、もしくはJSX要素が分岐に含まれる場合は、要素の有無そのものが切り替わるため検知します

### 検知できないケース

以下は構文解析だけでは判定できないため検知できません。レビュー等で確認してください。

- 変数に代入してから条件付きでレンダーするパターン
  - 例: `setText(<Localizer ... />)` と `setText('')` を切り替え、`{text}` でレンダーする場合
- 型の確定しない式が実行時に `null` / `undefined` / `false` になりうる場合
  - 例: `{cond ? 'text' : value}` で `value` が `null` になりうる場合
- Fragmentで囲まれたテキスト
  - 例: `{cond && <>text</>}`

## 修正方法

1. まずマークアップを見直してください。意味づけ・スタイルのために要素で囲むべきテキストの場合は、適切な要素で囲んでください
   - `span` に限らず、要素で囲まれていれば問題ありません(`p`、`Text` 等)
2. 現状のマークアップが正しい場合は、smarthr-uiの `SafeBrowserTranslation` で囲んでください
   - `SafeBrowserTranslation` の実体は `span` ですが、これを使うことで「意味づけ・スタイルのための要素ではなく、ブラウザ翻訳対策のための要素である」ことを明確にできます

### 利用しているsmarthr-uiにSafeBrowserTranslationが存在しない場合

smarthr-uiを更新するまでの間、プロダクト内で同名のコンポーネントを定義して利用してください。smarthr-uiの更新後は、smarthr-uiからのimportに置き換えてください。

```tsx
export const SafeBrowserTranslation = 'span' as const
```

## rules

```js
{
  rules: {
    'smarthr/require-safe-browser-translation': [
      'error', // 'warn', 'off'
      // {
      //   additionalTextComponentRegex: ['^Trans$'],
      //   additionalTextFunctionRegex: ['^t$'],
      // },
    ],
  },
}
```

## options

### additionalTextComponentRegex

`Localizer` / `FormattedMessage` 以外に「実体としてテキストノードしか生成しないコンポーネント」が存在する場合、その名称を正規表現で指定します。

### additionalTextFunctionRegex

`localize` / `formatMessage` 以外に「戻り値が常に文字列になる関数(翻訳関数等)」が存在する場合、その名称を正規表現で指定します。メンバー式経由の呼び出し(`i18n.t(...)`)はプロパティ名で判定します。

## ❌ Incorrect

```jsx
// 文字列リテラルが条件によって出入りしている
<div>{checked && '選択済み'}</div>
<div>{checked ? '選択済み' : null}</div>

// Localizer要素が条件によって出入りしている
<div>{loading && <Localizer id="x" defaultText="処理中" />}</div>
<div>{loading ? <Localizer id="x" defaultText="処理中" /> : <Icon />}</div>

// 翻訳関数の呼び出し結果が条件によって出入りしている
<div>{loading && localize({ id: 'x', defaultText: '処理中' })}</div>

// 同じコンポーネントでもkeyが異なる場合、Reactは要素を再利用しない
<div>
  {exceeded ? <Localizer key="a" id="a" defaultText="a" /> : <Localizer key="b" id="b" defaultText="b" />}
</div>

// additionalTextFunctionRegex: ['^t$']
<div>{loading && t('loading')}</div>
```

## ✅ Correct

```jsx
// 意味づけ・スタイルのための要素で囲まれている
<div>{checked && <p>選択済み</p>}</div>
<div>{loading && <Text color="TEXT_GREY"><Localizer id="x" defaultText="処理中" /></Text>}</div>

// マークアップとしては要素が不要な箇所は、SafeBrowserTranslationで囲む
<div>
  <Icon />
  {loading && (
    <SafeBrowserTranslation>
      <Localizer id="x" defaultText="処理中" />
    </SafeBrowserTranslation>
  )}
</div>

// すべての分岐が同じ種類のため、要素の出入りが発生しない
<div>{checked ? '選択済み' : '無選択'}</div>
<div>{exceeded ? <Localizer id="a" defaultText="a" /> : <Localizer id="b" defaultText="b" />}</div>

// JSX属性値は対象外
<a aria-current={current ? 'page' : undefined} />
```
