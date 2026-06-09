/**
 * smarthr-ui v92 → v93 移行ルール テストケース
 */

const v92ToV93Options = [{ from: '92', to: '93' }]

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // decorators属性なし
  { code: `<DropZone />`, options: v92ToV93Options },
  { code: `<DropZone selectButtonLabel="Choose File" />`, options: v92ToV93Options },

  // DropZone以外のコンポーネント（decorators属性があってもエラーにしない）
  { code: `<OtherComponent decorators={{ key: () => 'value' }} />`, options: v92ToV93Options },
]

// ============================================================
// invalidテストケース（エラーになり、自動修正されるコード）
// ============================================================

const invalid = [
  // ============================================================
  // 1. DropZone - selectButtonLabel 自動移行
  // ============================================================

  // 文字列リテラル
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => 'Choose File' }} />`,
    output: `<DropZone selectButtonLabel="Choose File" />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
  },
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => "選択" }} />`,
    output: `<DropZone selectButtonLabel="選択" />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
  },

  // 変数参照
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => buttonLabel }} />`,
    output: `<DropZone selectButtonLabel={buttonLabel} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
  },

  // 関数呼び出し
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => getLabel() }} />`,
    output: `<DropZone selectButtonLabel={getLabel()} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
  },

  // テンプレートリテラル
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => \`Select \${fileType}\` }} />`,
    output: `<DropZone selectButtonLabel={\`Select \${fileType}\`} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
  },

  // 三項演算子
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => isJapanese ? '選択' : 'Choose' }} />`,
    output: `<DropZone selectButtonLabel={isJapanese ? '選択' : 'Choose'} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
  },

  // 複数の属性がある場合
  {
    code: `<DropZone accept="image/*" decorators={{ selectButtonLabel: () => 'Choose' }} multiple />`,
    output: `<DropZone selectButtonLabel="Choose" accept="image/*" multiple />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
  },

  // ============================================================
  // 2. DropZone - selectButtonLabel なし（decorators削除のみ）
  // ============================================================

  {
    code: `<DropZone decorators={{}} />`,
    output: `<DropZone />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
  },

  // ============================================================
  // 3. DropZone - 手動対応が必要（エラーのみ、outputなし）
  // ============================================================

  // returnあり（BlockStatement）
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => { return 'Choose' } }} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
  },

  // 引数あり
  {
    code: `<DropZone decorators={{ selectButtonLabel: (defaultLabel) => defaultLabel }} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
  },

  // spread syntax
  {
    code: `<DropZone decorators={{ ...baseDecorators, selectButtonLabel: () => 'Choose' }} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
  },
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => 'Choose', ...rest }} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
  },

  // selectButtonLabel以外のキーがある
  {
    code: `<DropZone decorators={{ selectButtonLabel: () => 'Choose', otherKey: () => 'value' }} />`,
    options: v92ToV93Options,
    errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
  },
]

module.exports = {
  valid,
  invalid,
}
