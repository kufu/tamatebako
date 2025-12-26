# smarthr/best-practice-for-optional-chaining

- optional chaining(xxx?.yyy記法)を使うことを促すルールです

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-optional-chaining': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
if (action) action()
```

```jsx
if (obj.action) {
  obj.action(hoge, fuga)
}
```


## ✅ Correct

```jsx
action?.()
```

```jsx
obj.action?.(hoge, fuga)
```

```jsx
// 実行する関数と無関係の条件の場合は許容
if (any) {
  action()
}
```

```jsx
// 実行する関数の存在チェック以外が条件に含まれている場合は許容
if (action && any) {
  action()
}
```

```jsx
// if - else などifに他条件が連なる場合は許容
if (action) {
  action()
} else {
  ...
}
```
