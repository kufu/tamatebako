module.exports = {
  extends: [
    'stylelint-config-standard'
  ],
  customSyntax: 'postcss-styled-syntax',
  rules: {
    'value-keyword-case': null,
    'function-name-case': null,
    'declaration-empty-line-before': null,
    'selector-attribute-quotes': 'always',
    'font-family-name-quotes': 'always-where-required',
    'color-hex-length': 'short',
    'no-descending-specificity': null,
    'rule-empty-line-before': null,
    'alpha-value-notation': 'number',
    'color-function-notation': 'legacy',
    'selector-class-pattern': null,
    'value-no-vendor-prefix': true,
    'property-no-vendor-prefix': true,
    'no-empty-source': null,
    'declaration-property-value-disallowed-list': [
      {
        'word-break': ['break-all', 'break-word'],
      },
      {
        'message': `"word-break: break-all;" "word-break: break-word" は非推奨なstyleです
 - "break-all" は英単語などが不自然に改行され、非常に読みづらくなるため利用しないでください
 - "break-word" は仕様として非推奨です
   - https://developer.mozilla.org/ja/docs/Web/CSS/word-break#break-word
 - いずれの場合も以下で対応可能です
   - "overflow-wrap: anywhere;" を利用することでなるべく単語を改行せず、かつどうしても横幅に収まらない場合のみ単語内で改行されるようになります
   - "overflow-wrap: anywhere;" だけではうまく改行指定出来ない場合、"word-break: normal;" も同時に指定すると改善する場合があります`
      }
    ]
  }
}
