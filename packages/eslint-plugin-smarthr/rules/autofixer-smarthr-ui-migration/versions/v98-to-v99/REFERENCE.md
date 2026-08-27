# v98-to-v99 実装リファレンス

このドキュメントは v98-to-v99 移行ルールの実装に関する開発者向けの参考資料です。

v98-to-v99 では **フックの戻り値の分割代入を解析して自動修正する** という、これまでのversionにはなかったパターンを扱っています。

## 実装パターン

### 分割代入の解析と分類

`const { formatDate, localize } = useIntl()` のような分割代入は、
プロパティごとに移行先が異なるため、まず分類してから自動修正の可否を判断します。

```javascript
function categorizeProperties(objectPattern) {
  const result = { dateFormat: [], availableLocales: [], others: [], hasRest: false }

  objectPattern.properties.forEach((property) => {
    // `const { ...rest } = useIntl()` は何が使われるか判断できない
    if (property.type === 'RestElement') {
      result.hasRest = true
      return
    }

    // `const { [key]: value } = useIntl()` は静的に判断できない
    if (property.computed || property.key.type !== 'Identifier') {
      result.others.push(property)
      return
    }

    // ... 名前で振り分け
  })

  return result
}
```

**ポイント:**

- `RestElement` と computed key は必ず考慮する（漏らすと誤変換になる）
- `property.key` は元のプロパティ名、`property.value` はローカル変数名
  - `const { availableLocales: locales } = useIntl()` → key=`availableLocales`, value=`locales`

**自動修正の判断:**

| 分割代入の内容                          | 判断                            |
| --------------------------------------- | ------------------------------- |
| 移行対象のみ、かつ移行先が1つ           | ✅ 自動修正                     |
| 移行対象 + `useIntl()` に残るプロパティ | ⚠️ 検出のみ（宣言の分割が必要） |
| 移行先が異なるプロパティの併用          | ⚠️ 検出のみ（宣言の分割が必要） |
| rest要素あり                            | ⚠️ 検出のみ（判断不能）         |

### import文を含む複数fixの適用

呼び出し側だけを書き換えると import が足りずコードが壊れるため、
**1つの `context.report()` の中で import文もまとめて修正します。**

```javascript
fix(fixer) {
  const fixes = [fixer.replaceText(node.init.callee, newHookName)]

  const importFix = createImportFix(...)
  if (importFix) {
    fixes.push(importFix)
  }

  return fixes
}
```

**重要:** 1つのreportが返す複数のfixは、ESLintによって
「最小開始位置〜最大終了位置」を覆う1つのfixにマージされます。

このため、同一ファイルで複数箇所が同じimport文を書き換えようとしても、
マージ後の範囲が必ず重なり、2つ目以降は同一パス内でスキップされます。
スキップされたfixは次のパス（staged fixes）で適用されるため、
**import文への重複挿入は発生しません。**

### import文の更新方針

```javascript
function createImportFix(fixer, importNode, useIntlSpecifier, newHookName, canReplaceUseIntl) {
  // 移行先が既にimport済みなら何もしない
  if (findImportSpecifier(importNode, newHookName)) {
    return null
  }

  // 元のフックが不要になるなら、名前を置き換えるだけで済む
  if (canReplaceUseIntl) {
    return fixer.replaceText(useIntlSpecifier, newHookName)
  }

  // 元のフックが引き続き必要なので追加する
  return fixer.insertTextAfter(useIntlSpecifier, `, ${newHookName}`)
}
```

**ポイント:**

- 「削除 + 追加」ではなく **「置換」** にすることで、カンマの処理が不要になる
- `insertTextAfter(specifier, ', name')` は最後の要素以外に挿入しても構文的に正しい

### スコープを使った参照数の確認

元のフックを import から消して良いかは、参照が1箇所だけかで判断します。

```javascript
function isUseIntlReferencedOnce(sourceCode, node) {
  let scope = sourceCode.getScope(node)

  while (scope) {
    const variable = scope.variables.find((v) => v.name === 'useIntl')

    if (variable) {
      return variable.references.length === 1
    }

    scope = scope.upper
  }

  return false
}
```

**ポイント:**

- `sourceCode.getScope(node)` はESLint 9のAPI（このプラグインは `eslint: ^9` のみサポート）
- import宣言自体は `references` に含まれないため、`length === 1` = 呼び出しが1箇所
- 変数が見つかるまでスコープチェーンを遡る

### 同名フックの誤検出を防ぐ

`useIntl` は `react-intl` にも存在するため、
**smarthr-ui から import しているファイルのみ**を対象にします。

```javascript
const smarthrUi = { importNode: null, useIntlSpecifier: null }

const checkers = {
  Program(node) {
    const importNode = findSmarthrUiImport(node, validSources)
    // ...
    smarthrUi.useIntlSpecifier = importNode ? findImportSpecifier(importNode, 'useIntl') : null
  },

  "VariableDeclarator[init.callee.name='useIntl']"(node) {
    if (!smarthrUi.useIntlSpecifier) return
    // ...
  },
}
```

**ポイント:**

- `Program` は最初に訪問されるため、後続のチェッカーから安全に参照できる
- ファイル単位の状態は `createCheckers` のクロージャに持つ

### 変数経由の利用の検出

`const intl = useIntl()` のように受けている場合、
プロパティアクセスを追跡しないと移行対象か判断できません。

```javascript
const variable = sourceCode.getScope(node).variables.find((v) => v.name === node.id.name)

const usesMovedProp = variable.references.some((reference) => {
  const parent = reference.identifier.parent

  return (
    parent &&
    parent.type === 'MemberExpression' &&
    !parent.computed &&
    parent.property.type === 'Identifier' &&
    MOVED_PROPS.includes(parent.property.name)
  )
})
```

**ポイント:**

- 移行対象のプロパティを使っていない場合は報告しない（誤検出の防止）
- `reference.identifier.parent` でアクセス形態を判定する

## エラーメッセージ設計

### 自動修正できる場合

「注意: このエラーは手動修正後も消えません」は**不要**です（修正すれば消えるため）。

```javascript
migrateUseIntlDateFormat:
  'smarthr-ui {{to}} では useIntl() から日付フォーマット関数（{{props}}）が分離されました。useDateFormat() を使用してください。詳細: {{readmeUrl}}',
```

### 自動修正できない場合

v97-to-v98 と同様に、以下を含めます。

1. 何が変更されたか
2. 代替方法
3. エラーの持続性（「このエラーは手動修正後も消えません」）
4. 対応完了後の手順（設定の削除）
5. README.mdへのリンク

## テストケース設計

### valid（エラーにならない）

- 移行後の書き方
- `useIntl()` に残るプロパティのみを使用しているケース
- **他ライブラリの同名フック**（`react-intl` の `useIntl`）
- **import自体がないケース**

### invalid（エラーになる）

自動修正あり:

- 単一プロパティ / 全プロパティ
- 他のimportが並んでいるケース（`import { Button, useIntl }`）
- 元のフックが他でも使われているケース（import追加になる）
- 移行先が既にimport済みのケース（import変更なし）
- リネームを伴う分割代入（`{ formatDate: format }`）

自動修正なし:

- 残るプロパティとの混在
- 移行先が異なるプロパティの併用
- rest要素
- 分割代入以外（直接メンバーアクセス / 変数経由）

## トラブルシューティング

### メッセージが見つからないエラーが出る

**症状:** `messageId "xxx" was not found` でテストが落ちる

**原因:** 親の `index.js` の `meta.messages` にversionモジュールのmessagesを展開し忘れている

**対策:** `VERSION_MODULES` への登録と**両方**を更新する

```javascript
// 1. VERSION_MODULES への登録
const VERSION_MODULES = {
  'v98-v99': v98ToV99,
}

// 2. meta.messages への展開（忘れやすい）
messages: {
  ...v98ToV99.messages,
}
```

### `unsupportedVersion` のテストが落ちる

**症状:** 既存の「未サポートバージョン」テストが 0 errors になる

**原因:** そのテストが、今回追加したバージョンを「未サポート」の例として使っていた

**対策:** テストのオプションを、まだ実装していないバージョンに更新する

```javascript
// 変更前（v98-v99 を追加したことでサポート済みになった）
options: [{ from: '98', to: '99' }],

// 変更後
options: [{ from: '99', to: '100' }],
```

### 自動修正後もエラーが残る

**症状:** 自動修正されるはずのコードでエラーが消えない

**原因:** import文のfixが他のreportと衝突してスキップされている

**対策:** ESLintのstaged fixesにより次のパスで適用されるため、通常は問題ない。
`RuleTester` は**1パスしか実行しない**ため、テストの `output` は1パス後の結果を書く。
