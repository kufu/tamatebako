module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testRegex: '.*\\.test\\.tsx?$',
  transformIgnorePatterns: ['node_modules/(?!(?:.pnpm/)?(use-intl|next-intl))'],
}
