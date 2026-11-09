# smarthr/design-system-guideline-prohibit-disabled-while-pending

処理中(pending)状態を`disabled`属性で表現することを禁止するルールです。

## なぜdisabledを禁止するのか

disabled状態は「操作できない理由」を示すための属性で、見た目のコントラストが低く、処理中かどうかがユーザーに伝わりません。<br />
非同期処理の実行中であることを示す場合は、smarthr-ui/Buttonの`loading`属性や、Dialog系コンポーネントの`responseStatus`属性(`{ status: 'processing' }`)を利用し、処理中であることが視覚的に伝わるようにしてください。

参考:
- https://smarthr.design/products/components/button/
- https://smarthr.design/products/design-patterns/feedback/

## チェックする内容

### `type="submit"`のButton系コンポーネントのdisabled属性にpending状態を示す変数が含まれる場合エラー

`pending`、`submit`、`submitting`、`sending`、`saving`、`processing`、`loading`のいずれかを含む変数(大文字小文字は区別しない、部分一致、`isPending`、`pending`、`formIsPending`、`deletePending`、`isSubmit`、`isLoading`等)が`disabled`属性に直接、もしくは`||`で結合された条件の一部として含まれている場合エラーになります。

```jsx
// NG
<Button type="submit" disabled={isPending}>送信</Button>

// OK
<Button type="submit" loading={isPending}>送信</Button>
```

他の無効化理由と混在している場合、pending以外の条件のみ`disabled`に残してください。

```jsx
// NG
<Button type="submit" disabled={isPending || isRouteRefetching}>送信</Button>

// OK
<Button type="submit" loading={isPending} disabled={isRouteRefetching}>送信</Button>
```

`&&`で結合されている場合は対象外です。pending単体では無効化されず、他の条件と両方満たした場合のみ無効化するという別の意図のためです。

```jsx
// isPending単体では無効化されないため対象外
<Button type="submit" disabled={isPending && isRouteRefetching}>送信</Button>
```

このチェックは`type="submit"`が指定されているButton系コンポーネントのみが対象です。また、`Button`で終わるコンポーネント名のみが対象で、htmlの`button`要素は対象外です(loading属性を持たないため)。<br />
既に`loading`属性が設定されている場合はチェック自体をスキップします。

```jsx
// loading属性が既に設定されているため対象外
<Button type="submit" loading={isSaving} disabled={isPending}>送信</Button>
```

### Dialog系コンポーネントのactionButtonのdisabledにpending状態を示す変数が含まれる場合エラー

```jsx
// NG
<ActionDialog actionButton={{ text: '削除', disabled: isPending }} responseStatus={responseStatus} />

// OK
<ActionDialog actionButton={{ text: '削除' }} responseStatus={isPending ? { status: 'processing' } : responseStatus} />
```

`closeButton`のdisabledはこのチェックの対象外です。閉じる操作に処理中(loading)という概念がないため、処理中は閉じられないようにする目的で`disabled`を使い続けて問題ありません。

```jsx
// closeButtonは対象外なのでOK
<ActionDialog closeButton={{ text: undefined, disabled: isPending }} />
```

## rules

```js
{
  rules: {
    'smarthr/design-system-guideline-prohibit-disabled-while-pending': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
<Button type="submit" disabled={isPending}>送信</Button>
<Button type="submit" disabled={isPending || isRouteRefetching}>送信</Button>
<ActionDialog actionButton={{ text: '削除', disabled: isPending }} />
<FormDialog actionButton={{ text: '保存', disabled: isPending || selectedUsers.length === 0 }} />
```

## ✅ Correct

```jsx
<Button type="submit" loading={isPending}>送信</Button>
<Button type="submit" loading={isPending} disabled={isRouteRefetching}>送信</Button>
<ActionDialog actionButton={{ text: '削除' }} responseStatus={isPending ? { status: 'processing' } : responseStatus} />
<FormDialog actionButton={{ text: '保存', disabled: selectedUsers.length === 0 }} responseStatus={isPending ? { status: 'processing' } : responseStatus} />

// closeButtonは対象外
<ActionDialog closeButton={{ text: undefined, disabled: isPending }} />

// type="submit"でないButtonは対象外
<Button disabled={isPending}>送信</Button>
```
