# smarthr/design-system-guideline-prohibit-information-panel-in-white-bg

InformationPanelを白背景に配置することを禁止します。

## なぜこのルールが必要か

SmartHR Design Systemのガイドラインに基づき、InformationPanelは白背景に直接配置すべきではありません。

**理由:**

- InformationPanelのレイヤー順序は3です
- Baseのレイヤー順序は1です
- 視覚的に適切な階層関係を保つため、白背景の上に直接配置することは避けるべきです

詳細: https://smarthr.design/products/components/information-panel/#h3-1

## 検出パターン

このルールは以下のパターンを検出します:

### 1. Base内にInformationPanel

```tsx
// ❌ Bad
<Base>
  <InformationPanel>情報</InformationPanel>
</Base>

<Base>
  <div>
    <InformationPanel>情報</InformationPanel>
  </div>
</Base>
```

### 2. Dialog内にInformationPanel（白背景）

contentBgColorが未指定、または"WHITE"が指定されている場合:

```tsx
// ❌ Bad
<ActionDialog>
  <InformationPanel>情報</InformationPanel>
</ActionDialog>

<FormDialog contentBgColor="WHITE">
  <InformationPanel>情報</InformationPanel>
</FormDialog>
```

## 例外

以下の場合はエラーになりません:

### BaseColumn内にある場合

BaseColumnは背景色を持つため、その中にInformationPanelを配置することは問題ありません:

```tsx
// ✅ Good
<Base>
  <BaseColumn>
    <InformationPanel>情報</InformationPanel>
  </BaseColumn>
</Base>
```

### DialogでcontentBgColorが指定されている場合

```tsx
// ✅ Good
<ActionDialog contentBgColor="COLUMN">
  <InformationPanel>情報</InformationPanel>
</ActionDialog>

<FormDialog contentBgColor="OVER_BACKGROUND">
  <InformationPanel>情報</InformationPanel>
</FormDialog>
```

## 正しい使用例

```tsx
// ✅ Good: Stack/Clusterなどレイアウトコンポーネントで包む
<Stack>
  <InformationPanel>情報</InformationPanel>
</Stack>

<Cluster>
  <InformationPanel>情報</InformationPanel>
</Cluster>

// ✅ Good: BaseColumnを使用
<Base>
  <BaseColumn>
    <InformationPanel>情報</InformationPanel>
  </BaseColumn>
</Base>

// ✅ Good: DialogでcontentBgColorを指定
<ActionDialog contentBgColor="COLUMN">
  <InformationPanel>情報</InformationPanel>
</ActionDialog>

// ✅ Good: Base外で使用
<InformationPanel>情報</InformationPanel>
```

## 誤った使用例

```tsx
// ❌ Bad: Base内に直接配置
<Base>
  <InformationPanel>情報</InformationPanel>
</Base>

// ❌ Bad: Base内の他要素の中に配置
<Base>
  <div>
    <InformationPanel>情報</InformationPanel>
  </div>
</Base>

// ❌ Bad: DialogでcontentBgColorが未指定
<ActionDialog>
  <InformationPanel>情報</InformationPanel>
</ActionDialog>

// ❌ Bad: DialogでcontentBgColor="WHITE"
<FormDialog contentBgColor="WHITE">
  <InformationPanel>情報</InformationPanel>
</FormDialog>
```

## よくある間違い

### DialogContents内に配置

DialogContents（Dialog内部のコンテンツ領域）はデフォルトで白背景です。そのため、以下のようなコードはエラーになります:

```tsx
// ❌ Bad
<ActionDialog>
  <InformationPanel>情報</InformationPanel>
</ActionDialog>
```

**解決方法:**

1. contentBgColorを指定する（推奨）
2. BaseColumnで包む

```tsx
// ✅ Good: contentBgColorを指定
<ActionDialog contentBgColor="OVER_BACKGROUND">
  <InformationPanel>情報</InformationPanel>
</ActionDialog>

// ✅ Good: BaseColumnで包む
<ActionDialog>
  <BaseColumn>
    <InformationPanel>情報</InformationPanel>
  </BaseColumn>
</ActionDialog>
```
