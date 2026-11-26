# smarthr/require-safe-browser-translation

ブラウザの自動翻訳機能によるクラッシュを防ぐため、条件によって出入りする「要素で囲まれていない生のテキスト」を検知するルールです。

あわせて、対策として利用する `SafeBrowserTranslation` が適切な位置・方法で使われているかもチェックします。

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

テキストと一緒に出入りする要素で囲まれていれば、Reactが増減させる対象は翻訳の影響を受けない要素ノードになるため、この問題は発生しません。

```jsx
<div>
  <Icon />
  {loading && <SafeBrowserTranslation>処理中</SafeBrowserTranslation>}
</div>
```

## チェック内容

### 条件によって出入りする生のテキスト

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

- `translated.xxx` / `localized.xxx` 形式のプロパティアクセス
  - 翻訳済みの文言をまとめたオブジェクトの属性で、値が文字列であることが分かっているためです

- `name` / `label` / `text` / `title` / `message` / `description`、およびそれらで終わる名称の変数・プロパティアクセス
  - 例: `label`、`userName`、`user.name`、`user?.department?.fullName`
  - 名称から値が文字列であると推測できるためです
  - `rename` や `subtitle` のように、別の単語の末尾に含まれているだけの場合は対象外です
  - 名称のみで判定するため、`isShowName` のように文字列ではない値でも対象になります。その場合は変数名を見直すか、`eslint-disable` で対応してください

上記以外の変数・プロパティアクセス(`value`、`user.id` 等)は、文字列である保証がないためデフォルトでは対象外です。`additionalTextVariableRegex` オプションで指定した場合のみ「生のテキスト」として扱います。

#### 対象外になるケース

- JSX属性値(`aria-current={current ? 'page' : undefined}` 等)
  - 属性はテキストノードを生成せず、ブラウザ翻訳の影響を受けないためです
- 三項演算子のすべての分岐が同じ種類の場合
  - 文字列同士、もしくは同じコンポーネントかつ `key` も同一の場合、Reactはノードを再利用するためマウント/アンマウントが発生しません
  - 同じコンポーネントでも `key` が異なる場合(片方のみ指定、動的な値、スプレッド経由で判定できない場合を含む)は検知します
- 文字列が、型の確定しない式(変数等)とのみ組み合わさっている場合
  - 例: ``{count > max ? `${max}+` : count}``
  - Reactは文字列・数値をどちらも同じテキストノードとして扱うため、要素の出入りが発生せず安全なケースが多いためです
  - `null` / `undefined` / `true` / `false` / 空文字列、もしくはJSX要素が分岐に含まれる場合は、要素の有無そのものが切り替わるため検知します

#### 検知できないケース

以下は構文解析だけでは判定できないため検知できません。レビュー等で確認してください。

- 変数に代入してから条件付きでレンダーするパターン
  - 例: `setText(<Localizer ... />)` と `setText('')` を切り替え、`{text}` でレンダーする場合
- 型の確定しない式が実行時に `null` / `undefined` / `false` になりうる場合
  - 例: `{cond ? 'text' : value}` で `value` が `null` になりうる場合
- Fragmentで囲まれたテキスト
  - 例: `{cond && <>text</>}`
- 出入りする要素の直後にある、常に表示されるテキスト
  - 例: `<button>{icon && <Icon />}保存</button>`
  - Reactは要素を挿入する際、直後のノードを挿入位置の基準にします。基準となるテキストノードがブラウザ翻訳によって置き換えられていると `insertBefore` でクラッシュします
  - この場合は、常に表示されるテキスト側を囲んでください(`<button>{icon && <Icon />}<SafeBrowserTranslation>保存</SafeBrowserTranslation></button>`)

### SafeBrowserTranslationの位置

`SafeBrowserTranslation` は、出入りするテキストを直接囲む位置で利用してください。以下のいずれにも該当しない位置にある場合は検知します。

- 論理演算子(`&&` / `||` / `??`)の右辺
- 三項演算子の分岐
- `map` / `flatMap` メソッドのコールバック関数の戻り値
- `if` / `switch` による条件付きの `return`
- 同じ親の中に、条件分岐・`map` メソッドによって出入りする子要素がある場合
  - 上記「検知できないケース」の、出入りする要素の直後にあるテキストを保護する目的での利用です

Fragmentは要素を生成しないため、Fragment自体の位置で判定します(`{cond && <><SafeBrowserTranslation>text</SafeBrowserTranslation><Icon /></>}` は問題ありません)。

検知された場合は、以下のいずれかで対応してください。

- テキストが出入りしない場合、もしくは親の要素と一緒に出入りする場合は、`SafeBrowserTranslation` が不要なため削除する
  - 例: `<p><SafeBrowserTranslation>text</SafeBrowserTranslation></p>` は、テキストが `p` と一緒に出入りするため `<p>text</p>` で問題ありません
- 別の場所にある条件分岐・`map` メソッドによって出入りする場合は、その条件分岐・`map` メソッドの内側に移動する
  - 例: コンポーネントが `SafeBrowserTranslation` を無条件で直接返している場合、そのコンポーネントを条件付きでレンダーしている呼び出し側で囲んでください
  - 呼び出し側でも検知できるよう、当該コンポーネントの名称を `additionalTextComponentRegex` に指定することを推奨します
- stateに保持してから条件付きでレンダーする等、意図的にその位置で利用している場合は、`eslint-disable` で理由を明記する

### SafeBrowserTranslationの属性

`SafeBrowserTranslation` に `key` 以外の属性(スプレッドを含む)が指定されている場合は検知します。

`SafeBrowserTranslation` は「意味づけ・スタイルのための要素ではなく、ブラウザ翻訳対策のための要素である」ことを明確にするためのコンポーネントです。`className` や `aria-*` 等の属性が必要な場合は、意味づけ・スタイルのための要素のため、`span` などの適切な要素に置き換えてください。

`key` は要素を再生成させる目的で指定する場合があるため対象外です。

## 修正方法

1. まずマークアップを見直してください。意味づけ・スタイルのために要素で囲むべきテキストの場合は、適切な要素で囲んでください
   - `span` に限らず、テキストと一緒に出入りする要素であれば問題ありません(`p`、`Text` 等)
2. 現状のマークアップが正しい場合は、smarthr-uiの `SafeBrowserTranslation` で囲んでください
   - `SafeBrowserTranslation` の実体は `span` ですが、これを使うことで「意味づけ・スタイルのための要素ではなく、ブラウザ翻訳対策のための要素である」ことを明確にできます

いずれの場合も、要素は条件分岐の内側に置いてください。条件分岐の外側を囲んでも、テキストノード自体が出入りすることは変わらないため解決しません。

```jsx
// ❌ 条件分岐の外側を囲んでいるため、loadingの切り替えでテキストノードが出入りする
<SafeBrowserTranslation>{loading && '処理中'}</SafeBrowserTranslation>

// ✅ 条件分岐の内側を囲んでいるため、テキストと一緒に要素ごと出入りする
{loading && <SafeBrowserTranslation>処理中</SafeBrowserTranslation>}
```

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
      //   additionalTextVariableRegex: ['^caption$', '\\.kana$'],
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

### additionalTextVariableRegex

デフォルトの対象以外に、値が文字列であることが分かっている変数・プロパティアクセスを「生のテキスト」として扱いたい場合、その名称を正規表現で指定します。

プロパティアクセスは `.` つなぎの文字列に変換した上で判定します。オプショナルチェーン(`user?.name`)は `user.name` として扱います。

| 指定例 | 対象になる式 |
| --- | --- |
| `'^caption$'` | 変数 `caption` のみ |
| `'\\.kana$'` | `.kana` で終わるプロパティアクセス(`user.kana`、`user?.profile?.kana` 等) |
| `'^user\\.kana$'` | `user.kana` のみ |
| `'Caption$'` | 変数 `xxxCaption` と、`.xxxCaption` で終わるプロパティアクセスの両方 |

- `items[0].name` や `getUser().name` のように `.` つなぎで表せない式は対象外です
- マッチした式は文字列リテラルと同じ扱いになります
  - `{cond && caption}` や `{cond ? caption : null}` は検知します
  - `{cond ? caption : '未設定'}` のような文字列同士の切り替えは検知しません
- 実行時に空文字列・`null` 等になりうるかは判定できないため、値が常にテキストとしてレンダーされる前提で検知します

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

// translated.xxx / localized.xxx が条件によって出入りしている
<div>{loading && translated.loadingText}</div>

// additionalTextFunctionRegex: ['^t$']
<div>{loading && t('loading')}</div>

// name / label / text / title / message / description 系の変数・プロパティアクセスが条件によって出入りしている
<div>{loading && label}</div>
<div>{visible ? user.name : null}</div>

// additionalTextVariableRegex: ['^caption$', '\\.kana$']
<div>{loading && caption}</div>
<div>{visible ? user.kana : null}</div>

// SafeBrowserTranslationが、出入りするテキストを直接囲む位置にない
<p><SafeBrowserTranslation>処理中</SafeBrowserTranslation></p>
const LoadingText = () => <SafeBrowserTranslation>処理中</SafeBrowserTranslation>
setText(<SafeBrowserTranslation>処理中</SafeBrowserTranslation>)

// SafeBrowserTranslationにkey以外の属性が指定されている
<div>{loading && <SafeBrowserTranslation className="text">処理中</SafeBrowserTranslation>}</div>
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

// mapメソッドによって出入りするテキストをSafeBrowserTranslationで囲んでいる
<p>{names.map((name) => <SafeBrowserTranslation key={name}>{name}</SafeBrowserTranslation>)}</p>

// 出入りする要素の直後にあるテキストをSafeBrowserTranslationで囲んでいる
<button>
  {icon && <Icon />}
  <SafeBrowserTranslation>保存</SafeBrowserTranslation>
</button>

// 属性が必要な場合はspan等の要素を利用する
<div>{loading && <span className="text">処理中</span>}</div>
```
