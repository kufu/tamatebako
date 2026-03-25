# smarthr/prohibit-export-array-type

配列の型をexport出来ないように制御するルールです。利用するファイルで `ItemProps[]` のように配列指定を強制する目的などで利用できます。

## なぜ配列型のexportを禁止するのか

配列型を直接exportすると、型の再利用性と柔軟性が低下します：

- **型の意図が不明確**: `Items` という型名だけでは、それが配列型（`Item[]`）なのか、オブジェクト型（`{ list: Item[], total: number }`）なのか判断できず、使用する側で混乱が生じる可能性があります
- **柔軟性の低下**: 配列型を直接exportすると、将来的に型を拡張したり変更したりする際の柔軟性が失われます
- **使用箇所での明示性**: `Item[]` と記述することで、配列であることが明確になり、コードの可読性が向上します

このルールを適用することで、基本となる型（`Item`）のみをexportし、使用する側で `Item[]` のように明示的に配列として扱うことを強制できます。

## rules

```js
{
  rules: {
    'smarthr/prohibit-export-array-type': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```js
type Item = { attr: string }
export type Items = Item[]
```

## ✅ Correct


```js
export type Item = { attr: string }
```
