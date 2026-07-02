/**
 * smarthr-ui v95 → v96 移行ルール テストケース
 */

const v95ToV96Options = [{ from: '95', to: '96' }]

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // size属性なし
  { code: '<Chip>label</Chip>', options: v95ToV96Options },

  // 既に "S" を使用
  { code: '<Chip size="S">label</Chip>', options: v95ToV96Options },

  // 他のサイズ値
  { code: '<Chip size="m">label</Chip>', options: v95ToV96Options },

  // 動的な値
  { code: '<Chip size={dynamicSize}>label</Chip>', options: v95ToV96Options },
  { code: '<Chip size={SIZES.SMALL}>label</Chip>', options: v95ToV96Options },

  // JSX式での "s"（文字列リテラルではない）
  { code: '<Chip size={"s"}>label</Chip>', options: v95ToV96Options },

  // 対象外のコンポーネント
  { code: '<OtherComponent size="s" />', options: v95ToV96Options },
]

// ============================================================
// invalidテストケース（エラーになり、自動修正されるコード）
// ============================================================

const invalid = [
  // ============================================================
  // Chip の size 属性: "s" → "S"
  // ============================================================

  // 基本的な使用例
  {
    code: '<Chip size="s">label</Chip>',
    output: '<Chip size="S">label</Chip>',
    options: v95ToV96Options,
    errors: [
      {
        messageId: 'migrateChipSize',
        data: { to: 'v96' },
      },
    ],
  },

  // セルフクロージングタグ
  {
    code: '<Chip size="s" />',
    output: '<Chip size="S" />',
    options: v95ToV96Options,
    errors: [
      {
        messageId: 'migrateChipSize',
        data: { to: 'v96' },
      },
    ],
  },

  // 複数の属性がある場合
  {
    code: '<Chip size="s" disabled>label</Chip>',
    output: '<Chip size="S" disabled>label</Chip>',
    options: v95ToV96Options,
    errors: [
      {
        messageId: 'migrateChipSize',
        data: { to: 'v96' },
      },
    ],
  },

  // spread属性と組み合わせ
  {
    code: '<Chip {...props} size="s">label</Chip>',
    output: '<Chip {...props} size="S">label</Chip>',
    options: v95ToV96Options,
    errors: [
      {
        messageId: 'migrateChipSize',
        data: { to: 'v96' },
      },
    ],
  },

  // 複数行
  {
    code: `<Chip
  size="s"
  disabled
>
  label
</Chip>`,
    output: `<Chip
  size="S"
  disabled
>
  label
</Chip>`,
    options: v95ToV96Options,
    errors: [
      {
        messageId: 'migrateChipSize',
        data: { to: 'v96' },
      },
    ],
  },
]

module.exports = { valid, invalid }
