# smarthr/a11y-input-has-name-attribute

input, textarea, select など入力要素に name 属性を設定することを強制するルールです。

## なぜ入力要素にname属性を設定する必要があるのか

入力要素にname属性を適切に設定することで、キーボード操作や補完機能が適切に動作するようになります。<br />
例えば入力要素の一種である `input[type="radio"]` は同一のname属性が設定されたものは一つのグループとして扱われ、矢印キーでグループ内を適切に移動できるようになります。<br />
他にはname属性に `address` `zip_code` など住所が連想される単語を含めた場合、ブラウザの補完機能で住所が自動入力される可能性が高まります。

## name属性に設定する文字列のフォーマットについて

なるべく同一のフォーマットをもちいることで自動補完される可能性を上げるためname属性が一定のフォーマットになるようチェックを行っています。<br />
使える文字は以下のとおりです。

- 半角英数の大文字・小文字
- 一部記号(`_` `[` `]`)

## spread-attributesが設定されているなら許容したい場合

下記の様にspread attributesが設定されていれば、name属性が設定されている扱いにしたい場合、lintのoptionとして `checkType` に `allow-spread-attributes` を設定してください。

```jsx
// checkType: 'allow-spread-attributes'
<AnyInput {...args} />
```

便利な設定ではありますが、**name属性が実際に設定されているかは判定出来ていないため、チェック漏れが発生する可能性があります。**  
設定する場合は慎重に検討してください。

## rules

```js
{
  rules: {
    'smarthr/a11y-input-has-name-attribute': [
      'error', // 'warn', 'off'
      // { checkType: 'always' } /* 'always' || 'allow-spread-attributes' */
    ]
  },
}
```

## ❌ Incorrect

```jsx
// name属性が存在しないためNG
<RadioButton />
<Input type="radio" />
<input type="text" />
<Textarea />
<Select />
```

```jsx
// 仮にargsにname属性が存在していてもNG
// checkType: 'always'
<AnyInput {...args} />
```

## ✅ Correct

```jsx
<RadioButton name="hoge" />
<Input type="radio" name="fuga" />
<input type="text" name="any" />
<Textarea name="some" />
<Select name="piyo" />
```

```jsx
// checkType: 'allow-spread-attributes'
<AnyInput {...args} />
```
