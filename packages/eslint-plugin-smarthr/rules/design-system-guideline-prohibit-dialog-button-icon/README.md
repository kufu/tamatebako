# smarthr/design-system-guideline-prohibit-dialog-button-icon

Dialogのボタンテキストにアイコンコンポーネント（名前が"Icon"で終わるコンポーネント）を含めることを禁止するルールです。

## なぜアイコンを禁止するのか

デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています。これには以下の理由があります：

### 視認性と理解しやすさ

Dialogのボタンは、ユーザーが次に取るべきアクションを明確に示す必要があります。テキストのみのボタンは：

- **意図が明確**: アイコンの解釈の曖昧さがなく、ボタンの機能が一目で理解できます
- **読みやすさ**: アイコンとテキストが混在すると視覚的なノイズが増え、読みにくくなります
- **アクセシビリティ**: スクリーンリーダーを使用するユーザーにとって、テキストのみの方が理解しやすくなります

### 一貫性の維持

プロジェクト全体でDialogのボタンスタイルを統一することで、ユーザー体験の一貫性が保たれます。

## 対象

- **コンポーネント**: 名前が`Dialog`で終わるすべてのコンポーネント（`ActionDialog`、`FormDialog`、`CustomDialog`等）
- **属性**: `actionText`、`submitLabel`、`submitButton`、`closeButton`、`backButton`
- **検出内容**: 上記属性に名前が`Icon`で終わるコンポーネント（`<Icon />`、`<FaCheckIcon />`等）が含まれている場合

## rules

```js
{
  rules: {
    'smarthr/design-system-guideline-prohibit-dialog-button-icon': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// ActionDialog / FormDialog（actionText）
<ActionDialog actionText={<><Icon name="check" />保存</>} />
<ActionDialog actionText={<Icon name="check" />} />
<FormDialog actionText={<><FaSendIcon />送信</>} />

// FormDialog（submitButton）
<FormDialog submitButton={{ text: <><Icon name="send" />送信</> }} />
<FormDialog submitButton={{ text: <Icon name="send" /> }} />

// RemoteTriggerActionDialog / RemoteTriggerFormDialog
<RemoteTriggerActionDialog actionText={<Icon name="confirm" />} />
<RemoteTriggerFormDialog actionText={<><Icon />登録</>} />

// StepFormDialog
<StepFormDialog submitButton={{ text: <><Icon name="send" />送信</> }} />
<StepFormDialog closeButton={{ text: <Icon name="close" /> }} />
<StepFormDialog backButton={{ text: <><Icon />戻る</> }} />
```

## ✅ Correct

```jsx
// テキストのみを使用
<ActionDialog actionText="保存" />
<FormDialog actionText="送信" />
<FormDialog submitButton={{ text: "送信" }} />
<RemoteTriggerActionDialog actionText="確認" />
<RemoteTriggerFormDialog actionText="登録" />

// 変数も可（文字列の場合）
<ActionDialog actionText={t('save')} />
<FormDialog actionText={submitText} />
<FormDialog submitButton={{ text: submitText }} />

// StepFormDialog
<StepFormDialog submitButton={{ text: "送信" }} />
<StepFormDialog submitButton={{ text: submitText }} />
<StepFormDialog closeButton={{ text: "閉じる" }} />
<StepFormDialog backButton={{ text: "戻る" }} />
```
