module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testRegex: '.*\\.test\\.tsx?$',
  testPathIgnorePatterns: ['/node_modules/', '/packages/storybook-focus-indicator/'],
  transformIgnorePatterns: ['node_modules/(?!(?:.pnpm/)?(use-intl|next-intl|@formatjs|intl-messageformat))'],
}
