# smarthr/a11y-anchor-has-href-attribute

a, Anchor, Link コンポーネントに href 属性を設定することを促すルールです

## なぜa要素にhref属性を設定するべきなのか

href属性が設定されていないa要素は**遷移先が存在しない無効化されたリンク**という扱いになります。  
これはbutton要素で例えるなら**disalbed属性が設定された状態のbutton要素**と同等です。

またhref属性がないa要素ではtab移動の対象にならない・コンテキストメニュー(右クリックメニュー)から別タブで開く機能が使えない、などのデメリットが発生します。  
これらの機能は **href属性が存在する == 有効なリンクである** ことから有効になります。

逆説的に**設定したいhref属性が存在しない場合、a要素ではなくbutton要素を利用する**ように心がけてください。  
a要素はあくまでURL遷移を表現するための要素であるため、それ以外の処理のトリガーとして利用するならばbutton要素のほうが適切です。

また**遷移先が存在しない無効化されたリンク**を表現したい場合、明示的に`href={undefined}`を設定することを推奨しています。

## react-router, next/Linkを利用している場合

react-router, next/Linkを利用している場合、href属性と同等の機能を提供する別属性が存在するため、自動的にチェック方法が切り替わります。  
利用しているか否かの判定にはpackage.jsonが利用され、dependenciesに `react-router` もしくは `next` が存在するかどうかで判断されます。

### react-routerを利用している場合

a要素にto属性が指定されている場合、href属性が指定されているものとして許容します。

```jsx
// react-routerを利用している場合、かつto属性を設定しているためOK
<Link to={hoge}>any</Link>
```

### next/Linkを利用している場合


next/link コンポーネント直下のa要素にhref属性が指定されていないことを許容します。

```jsx
// next/Linkを利用している場合、子のaにhref属性がなくてもOK
<Link href={hoge}><a>any</a></Link>
```

## spread-attributesが設定されているなら許容したい場合

下記の様にspread attributesが設定されていれば、href属性が設定されている扱いにしたい場合、lintのoptionとして `checkType` に `allow-spread-attributes` を設定してください。

```jsx
// checkType: 'allow-spread-attributes'
<XxxAnchor {...args} />
<XxxLink {...args} any="any" />
```

便利な設定ではありますが、**href属性が実際に設定されているかは判定出来ていないため、チェック漏れが発生する可能性があります。**  
設定する場合は慎重に検討してください。

## rules

```js
{
  rules: {
    'smarthr/a11y-anchor-has-href-attribute': [
      'error', // 'warn', 'off'
      // { checkType: 'always' } /* 'always' || 'allow-spread-attributes' */
    ]
  },
}
```

## ❌ Incorrect

```jsx
// a要素と思われるコンポーネントにhref属性が設定されていないためNG
<a>any</a>
<XxxAnchor>any</XxxAnchor>
<XxxLink>any</XxxLink>
<XxxLink href>any</XxxLink>
```

```jsx
// spread attributesでhref属性が含まれていてもデフォルト設定ではNGになる
<XxxAnchor {...args} />
<XxxLink {...args} any="any" />
```

## ✅ Correct

```jsx
// a要素と思われるコンポーネントにhref属性が設定されているのでOK
<a href="https://www.google.com/search">any</a>
<XxxAnchor href={hoge}>any</XxxAnchor>
<XxxLink href={undefined}>any</XxxLink>
```

```jsx
// react-routerを利用している場合、かつto属性を設定しているためOK
<Link to={hoge}>any</Link>
```

```jsx
// next/Linkを利用している場合、子のaにhref属性がなくてもOK
<Link href={hoge}><a>any</a></Link>
```

```jsx
// checkType: 'allow-spread-attributes' を指定している場合、
// 仮にspread attributes内にhrefが含まれていなくてもOKになるため注意
<XxxAnchor {...args} />
<XxxLink {...args} any="any" />
```
