# smarthr/design-system-guideline-prohibit-icon-in-dialog-button

Dialogのボタンテキストにアイコン（JSX要素）を含めることを禁止するルールです。

## なぜアイコンを禁止するのか

デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています。これには以下の理由があります：

### 視認性と理解しやすさ

Dialogのボタンは、ユーザーが次に取るべきアクションを明確に示す必要があります。テキストのみのボタンは：

- **意図が明確**: アイコンの解釈の曖昧さがなく、ボタンの機能が一目で理解できます
- **読みやすさ**: アイコンとテキストが混在すると視覚的なノイズが増え、読みにくくなります
- **アクセシビリティ**: スクリーンリーダーを使用するユーザーにとって、テキストのみの方が理解しやすくなります

### 一貫性の維持

プロジェクト全体でDialogのボタンスタイルを統一することで、ユーザー体験の一貫性が保たれます。

## 対象コンポーネント

このルールは以下のDialogコンポーネントのボタンテキストをチェックします：

- `ActionDialog` - actionText属性
- `FormDialog` - actionText属性
- `RemoteTriggerActionDialog` - actionText属性
- `RemoteTriggerFormDialog` - actionText属性
- `StepFormDialog` - submitLabel属性（旧API）、submitButton.text / closeButton.text / backButton.text（新API）

## チェックする内容

ボタンテキストを指定する属性にJSX要素（Icon、Fragment等）が含まれている場合にエラーとなります。

```jsx
// NG: actionTextにアイコンを含む
<ActionDialog actionText={<><Icon name="check" />保存</>} />
<FormDialog actionText={<Icon name="send" />} />

// NG: submitLabelにアイコンを含む（StepFormDialog旧API）
<StepFormDialog submitLabel={<><Icon name="next" />次へ</>} />

// NG: submitButton.textにアイコンを含む（StepFormDialog新API）
<StepFormDialog submitButton={{ text: <><Icon name="send" />送信</> }} />
<StepFormDialog closeButton={{ text: <Icon name="close" /> }} />
```

## rules

```js
{
  rules: {
    'smarthr/design-system-guideline-prohibit-icon-in-dialog-button': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// ActionDialog / FormDialog
<ActionDialog actionText={<><Icon name="check" />保存</>} />
<ActionDialog actionText={<Icon name="check" />} />
<FormDialog actionText={<><FaSendIcon />送信</>} />

// RemoteTriggerActionDialog / RemoteTriggerFormDialog
<RemoteTriggerActionDialog actionText={<Icon name="confirm" />} />
<RemoteTriggerFormDialog actionText={<><Icon />登録</>} />

// StepFormDialog（旧API）
<StepFormDialog submitLabel={<><Icon name="next" />次へ</>} />
<StepFormDialog submitLabel={<Icon name="next" />} />

// StepFormDialog（新API）
<StepFormDialog submitButton={{ text: <><Icon name="send" />送信</> }} />
<StepFormDialog closeButton={{ text: <Icon name="close" /> }} />
<StepFormDialog backButton={{ text: <><Icon />戻る</> }} />
```

## ✅ Correct

```jsx
// テキストのみを使用
<ActionDialog actionText="保存" />
<FormDialog actionText="送信" />
<RemoteTriggerActionDialog actionText="確認" />
<RemoteTriggerFormDialog actionText="登録" />

// 変数も可（文字列の場合）
<ActionDialog actionText={t('save')} />
<FormDialog actionText={submitText} />

// StepFormDialog（旧API）
<StepFormDialog submitLabel="次へ" />
<StepFormDialog submitLabel={nextLabel} />

// StepFormDialog（新API）
<StepFormDialog submitButton={{ text: "送信" }} />
<StepFormDialog submitButton={{ text: submitText }} />
<StepFormDialog closeButton={{ text: "閉じる" }} />
<StepFormDialog backButton={{ text: "戻る" }} />
```
