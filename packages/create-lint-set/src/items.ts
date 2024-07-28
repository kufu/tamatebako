export type Item = {
  name: string // 識別名
  templateDirName: string // ライブラリ側で持っているテンプレートファイルのディレクトリ。この中のファイルをコピーする形で書き込む
  packages: string[] // インストールする npm パッケージ名
  configFilePattern: RegExp // 対象ディレクトリにすでに config があるかどうかを確認するための正規表現
  npmScriptsSample?: string
}

export const items: Item[] = [
  {
    name: 'eslint',
    templateDirName: 'eslint',
    packages: ['eslint', 'eslint-config-smarthr', 'eslint-plugin-smarthr', 'prettier'],
    configFilePattern: /\.eslintrc.*?/,
    npmScriptsSample: '"eslint": "eslint \'./**/*.ts{,x}\'"',
  },
  {
    name: 'prettier',
    templateDirName: 'prettier',
    packages: ['prettier', 'prettier-config-smarthr'],
    configFilePattern: /\.prettierrc.*?/,
  },
  {
    name: 'stylelint',
    templateDirName: 'stylelint',
    packages: [
      'stylelint',
      'stylelint-config-smarthr',
      'stylelint-config-standard',
      'stylelint-config-styled-components',
      'postcss-styled-syntax'
    ],
    configFilePattern: /\.stylelintrc.*?/,
    npmScriptsSample: '"stylelint": "stylelint \'./**/*.ts{,x}\'',
  },
  {
    name: 'textlint',
    templateDirName: 'textlint',
    packages: ['textlint', 'textlint-plugin-jsx', 'textlint-rule-preset-smarthr'],
    configFilePattern: /\.textlintrc.*?/,
    npmScriptsSample: '"textlint": "textlint \'./**/*.ts{,x}\'',
  },
]
