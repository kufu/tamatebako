# smarthr-ui v98 → v99 移行ガイド

smarthr-ui v99 での破壊的変更に対応する移行ルールです。

## 設定

```json
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "98", "to": "99" }]
  }
}
```

## 対応する変更

### 1. `useIntl()` から日付フォーマット関数が分離

`useIntl()` が持つ責務を整理するため、日付フォーマット機能が `useDateFormat()` に分離されました。

**対象の関数:** `formatDate` / `formatTime` / `formatTimestamp` / `getWeekStartDay`

**Before:**

```tsx
import { useIntl } from 'smarthr-ui'

const { formatDate, formatTime } = useIntl()
```

**After:**

```tsx
import { useDateFormat } from 'smarthr-ui'

const { formatDate, formatTime } = useDateFormat()
```

**自動修正:** ✅ 可能（日付フォーマット関数のみを分割代入している場合）

### 2. `useIntl()` から `availableLocales` が分離

`availableLocales` が `useAvailableLocales()` に分離されました。戻り値はオブジェクトではなく配列そのものになります。

**Before:**

```tsx
import { useIntl } from 'smarthr-ui'

const { availableLocales } = useIntl()
```

**After:**

```tsx
import { useAvailableLocales } from 'smarthr-ui'

const availableLocales = useAvailableLocales()
```

**自動修正:** ✅ 可能（`availableLocales` のみを分割代入している場合）

## 自動修正されないケース

以下のケースは宣言の分割が必要だったり、利用箇所の追跡が必要なため、エラー表示のみを行います。

### `useIntl()` に残るプロパティと併用している場合

```tsx
// ❌ 自動修正されない
const { localize, formatDate } = useIntl()

// ✅ 手動で以下のように書き換えてください
const { localize } = useIntl()
const { formatDate } = useDateFormat()
```

### 日付フォーマット関数と `availableLocales` を併用している場合

移行先のフックが異なるため、自動修正されません。

```tsx
// ❌ 自動修正されない
const { formatDate, availableLocales } = useIntl()

// ✅ 手動で以下のように書き換えてください
const { formatDate } = useDateFormat()
const availableLocales = useAvailableLocales()
```

### rest要素を使っている場合

何が使われるか静的に判断できないため、自動修正されません。

```tsx
// ❌ 自動修正されない
const { formatDate, ...rest } = useIntl()
```

### 分割代入を使っていない場合

```tsx
// ❌ 自動修正されない
useIntl().formatDate(date)

const intl = useIntl()
intl.formatDate(date)

// ✅ 手動で以下のように書き換えてください
const { formatDate } = useDateFormat()
formatDate(date)
```

## `locale` と `localize` は引き続き `useIntl()` から取得できます

```tsx
const { localize, locale } = useIntl() // ✅ 変更なし
```

## 制限事項

### smarthr-ui 由来の `useIntl` のみを対象にします

`react-intl` など他ライブラリの `useIntl` と区別するため、`smarthr-ui`（または `smarthrUiAlias` で指定したパス）から `useIntl` を import しているファイルのみを検査します。

### 未使用の `useIntl` import が残る場合があります

自動修正では、`useIntl` の参照が該当箇所のみの場合に import 文の `useIntl` を移行先のフック名へ置き換えます。

以下のケースでは `useIntl` の import が残るため、不要であれば手動で削除してください。

- 同一ファイル内で `useIntl()` を複数回呼び出しており、そのすべてが移行対象だった場合
- 移行先のフックが既に import 済みだった場合

### escape hatch className の変更はありません

このバージョンの変更はフックのAPI分離のみで、`smarthr-ui-` で始まる className に変更はありません。CSS/SCSS/styled-components の修正は不要です。

## 参考

- [smarthr-ui v99.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v99.0.0)
- [smarthr-ui PR #6484](https://github.com/kufu/smarthr-ui/pull/6484)
