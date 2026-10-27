/**
 * smarthr-ui v93 → v94 移行ルール テストケース
 */

const v93ToV94Options = [{ from: '93', to: '94' }]

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // decoratorsなし
  { code: '<ThCheckbox>Label</ThCheckbox>', options: v93ToV94Options },

  // ThCheckbox以外のコンポーネント（decorators属性があってもエラーにしない）
  { code: '<DropZone decorators={{ selectButtonLabel: () => "Choose" }} />', options: v93ToV94Options },
  { code: '<OtherComponent decorators={{}} />', options: v93ToV94Options },
]

// ============================================================
// invalidテストケース（エラーになり、自動修正されるコード）
// ============================================================

const invalid = [
    // ============================================================
    // ThCheckbox の decorators 属性削除
    // ============================================================

    // 基本パターン
    {
      code: '<ThCheckbox decorators={{ selectAll: () => "全選択" }}>Label</ThCheckbox>',
      output: '<ThCheckbox>Label</ThCheckbox>',
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },

    // 空のdecorators
    {
      code: '<ThCheckbox decorators={{}}>Label</ThCheckbox>',
      output: '<ThCheckbox>Label</ThCheckbox>',
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },

    // 複雑な式
    {
      code: '<ThCheckbox decorators={{ selectAll: () => getLabel() }}>Label</ThCheckbox>',
      output: '<ThCheckbox>Label</ThCheckbox>',
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },

    // テンプレートリテラル
    {
      code: '<ThCheckbox decorators={{ selectAll: () => `Select ${type}` }}>Label</ThCheckbox>',
      output: '<ThCheckbox>Label</ThCheckbox>',
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },

    // 引数あり（v92-to-v93では手動対応だったが、v93-to-v94では全削除なので自動修正）
    {
      code: '<ThCheckbox decorators={{ selectAll: (defaultLabel) => customLabel || defaultLabel }}>Label</ThCheckbox>',
      output: '<ThCheckbox>Label</ThCheckbox>',
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },

    // BlockStatement（v92-to-v93では手動対応だったが、v93-to-v94では全削除なので自動修正）
    {
      code: '<ThCheckbox decorators={{ selectAll: () => { return "Select All" } }}>Label</ThCheckbox>',
      output: '<ThCheckbox>Label</ThCheckbox>',
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },

    // 改行あり
    {
      code: `<ThCheckbox
  decorators={{ selectAll: () => "全選択" }}
>
  Label
</ThCheckbox>`,
      output: `<ThCheckbox
>
  Label
</ThCheckbox>`,
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },

    // 他の属性と混在
    {
      code: '<ThCheckbox name="select" decorators={{ selectAll: () => "全選択" }}>Label</ThCheckbox>',
      output: '<ThCheckbox name="select">Label</ThCheckbox>',
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },

    // decoratorsが最初の属性
    {
      code: '<ThCheckbox decorators={{ selectAll: () => "全選択" }} name="select">Label</ThCheckbox>',
      output: '<ThCheckbox name="select">Label</ThCheckbox>',
      options: v93ToV94Options,
      errors: [
        {
          messageId: 'removeDecorators',
          data: { component: 'ThCheckbox', to: 'v94' },
        },
      ],
    },
]

module.exports = { valid, invalid }
