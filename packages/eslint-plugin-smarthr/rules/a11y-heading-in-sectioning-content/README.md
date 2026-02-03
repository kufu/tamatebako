# smarthr/a11y-heading-in-sectioning-content

HeadingコンポーネントをSectioningContent(Article, Aside, Nav, Section) のいずれかで囲むことを促すルールで<br />
同時にSectioningContentはHeadingを内包しているか、もチェックします


## なぜHeadingとSectioningContentはセットで記述する必要があるのか？

詳細は[SmartHR Tech Blog](https://tech.smarthr.jp/entry/2025/06/19/094801)を参照してください。<br />
メリットのみを記述すると以下のとおりです。

- article, aside, nav, section で Heading とHeadingの対象となる範囲を囲むとブラウザが正確に解釈できるようになるメリットがあります
- smarthr-ui/SectioningContentで smarthr-ui/Headingを囲むことで、Headingのレベル(h1~h6)を自動的に計算するメリットもあります

## SectioningContentとして扱うコンポーネントについて

このルールではsmarthr-ui/Layout系コンポーネント(Center, Reel, Sidebar, Stack)にas属性・forwardedAs属性で'section', 'article', 'aside', 'nav' のいずれかの要素が指定されている場合、SectioningContentとして扱います。<br />
Layout系コンポーネントがSectioningContentとして扱われている場合、smarthr-uiの内部実装レベルでもSectioningContentとして扱われるため、前述のHeadingのレベルの自動計算が有効になります。

## section要素などbuildinのSectiongContentに属する要素の利用について

前述のHeadingレベルの自動計算はsmarthr-ui/SectiongContentとsmarthr-ui/Layoutでas・forwardedAs属性を指定した場合のみ有効になる機能です。<br />
buildinの `article` `aside` `nav` `section` 要素はheadingの対象となる範囲は正しく表せますが、Headingレベルの自動計算は行えません。

そのため、**`article` `aside` `nav` `section` 要素はsmarthr-uiの `Article` `Aside` `Nav` `Section` コンポーネントに置き換えてください。**

## PageHeadingのチェックについて

PageHeadingはh1要素を表現するコンポーネントです。<br />
h1要素は基本的に記述されてるhtml全体に対する見出しとなります。<br />
そのため**SectioningContentでh1要素を囲むと見出しの範囲外として解釈された範囲はどの見出しにも属さないことになる**ため、エラーとしています。

```jsx
// h1をSectioningContentで囲むと...
...
<body>
  <Section>
    <PageHeading />
    {anyContent}
  </Section>
  {/* ↓このコンポーネントはどの見出しにも属さないことになる */}
  <OtherContent />
</body>
```

上記例の場合、OtherContentがh1の範囲外になり、htmlのアウトラインが乱れてしまいます。<br />
PageHeadingをSectioningContentで囲まない場合、html全体の見出しとなるため、アウトラインは乱れません。

```jsx
// h1をSectioningContentで囲まなければhtml全体のアウトラインが整う
...
<body>
  <PageHeading />
  {anyContent}
  {/* ↓このコンポーネントはどの見出しにも属さないことになる */}
  <OtherContent />
</body>
```

また前述の通り、PageHeadingは記述されたhtml全体の見出しのため、基本的に1htmlにつき1つのみ記述出来ます。<br />
そのためこのルールでは**おなじコンポーネント内で複数のPageHeadingが存在する場合エラー**になります。

```jsx
<>
  <HogePageHeading />
  ...
  <FugaPageHeading />
  ...
</>
```

このチェックは条件分岐によって結果としては一つしかPageHeadingが出力されない場合でもエラーになるため注意が必要です。

```jsx
<>
  {hoge ? (
    <PageHeading>{hoge}</PageHeading>
  ) : (
    <PageHeading>{fuga}</PageHeading>
  )}
</>
```

下記の様にPageHeadingは単一の記述になるようにまとめることを推奨します。

```jsx
<>
  <PageHeading>{hoge || fuga}</PageHeading>
</>
```




## rules

```js
{
  rules: {
    'smarthr/a11y-heading-in-sectioning-content': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// Headingがsmarthr-ui/SectioningContent(Article, Aside, Nav, Section)のいずれかで囲まれていないためNG
<div>
  <Heading>
    hoge
  </Heading>
</div>
```

```jsx
// Headingに当たる要素がないためNG
<Aside>
  <AnyContent />
</Aside>
```

```jsx
// buildinのSectioningContentではなくsmarthr-ui/SectioningContentで囲まなければ
// Headingレベルの自動計算が有効にならないためNG
<section>
  <Heading>
    hoge
  </Heading>
</section>
```

```jsx
// PageHeadingはSectiongContentでラップするとoutlineが乱れる可能性があるためNG
<Section>
  <PageHeading>
    hoge
  </PageHeading>
</Section>
```

```jsx
// 同じファイル内に複数のPageHeadingが存在するとNG
<>
  {hoge ? (
    <PageHeading>
      hoge
    </PageHeading>
  ) : (
    <PageHeading>
      fuga
    </PageHeading>
  )}
</>
```

## ✅ Correct

```jsx
// SectioningContentにはHeadingを含む必要がある
<Section>
  <Heading>hoge</Heading>
  <Section>
    <Heading>fuga</Heading>
  </Section>
</Section>
```

```jsx
// PageHeadingはSectioningContentで囲まない
<>
  <PageHeading>Page Name.</PageHeading>
  <Section>
    <Heading>hoge</Heading>
  </Section>
  <Center as="aside">
    <Heading>piyo</Heading>
  </Center>
</>
```

```jsx
// PageHeadingはコンポーネント内で単一にする
<>
  <PageHeading>{hoge || fuga}</PageHeading>
</>
```
