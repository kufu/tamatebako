# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.6.3](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.6.2...eslint-plugin-smarthr-v6.6.3) (2026-03-23)


### Bug Fixes

* a11y-anchor-has-href-attributeルールでTemplateLiteralに対応 ([#1138](https://github.com/kufu/tamatebako/issues/1138)) ([25e06f3](https://github.com/kufu/tamatebako/commit/25e06f392e5a8c432056b219ae2bb24d61939a5c))
* a11y-aria-labelledbyルールでJSXExpressionContainerに対応 ([#1137](https://github.com/kufu/tamatebako/issues/1137)) ([15632dd](https://github.com/kufu/tamatebako/commit/15632dd7f3f1ed4fcc611c3fb73344a250e834f0))
* a11y-clickable-element-has-textルールでJSXExpressionContainerとTemplateLiteralに対応 ([#1140](https://github.com/kufu/tamatebako/issues/1140)) ([6abb67b](https://github.com/kufu/tamatebako/commit/6abb67bfe4f97b0599abd484c5a4d233fa83bd10))
* a11y-input-has-name-attributeルールでJSXExpressionContainerに対応 ([#1141](https://github.com/kufu/tamatebako/issues/1141)) ([b51052e](https://github.com/kufu/tamatebako/commit/b51052ea67bd8ec67635286a62c007b0a278c9cf))
* require-i18n-textルールでTemplateLiteralに対応 ([#1139](https://github.com/kufu/tamatebako/issues/1139)) ([908c365](https://github.com/kufu/tamatebako/commit/908c3655728dfe46270894c1cfa7aa360c76b2e4))

## [6.6.2](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.6.1...eslint-plugin-smarthr-v6.6.2) (2026-03-13)


### Bug Fixes

* **a11y-trigger-has-button:** 対象となるTriggerの範囲指定ミスを修正 ([#1128](https://github.com/kufu/tamatebako/issues/1128)) ([a337f46](https://github.com/kufu/tamatebako/commit/a337f46ac58eab53d3f1d4ea5c6afc99e485b5ac))

## [6.6.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.6.0...eslint-plugin-smarthr-v6.6.1) (2026-03-13)


### Bug Fixes

* **best-practice-for-unnessesary-early-return:** 分割されたif条件の判定が誤っていたため修正 ([#1125](https://github.com/kufu/tamatebako/issues/1125)) ([0ff77d6](https://github.com/kufu/tamatebako/commit/0ff77d621e1bd2132cbb7878743e2067e0a47879))

## [6.6.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.5.0...eslint-plugin-smarthr-v6.6.0) (2026-03-11)


### Features

* **a11y-trigger-has-button:** DisclosureTriggerに対応 ([#1116](https://github.com/kufu/tamatebako/issues/1116)) ([a9ebca9](https://github.com/kufu/tamatebako/commit/a9ebca94bfec8efb35e1f52fc007a1521358efce))

## [6.5.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.4.0...eslint-plugin-smarthr-v6.5.0) (2026-03-04)


### Features

* a11y-aria-labelledby ruleを追加 ([#1099](https://github.com/kufu/tamatebako/issues/1099)) ([31d4649](https://github.com/kufu/tamatebako/commit/31d4649793c8befe9c7198c667f5e951b1b8b83c))

## [6.4.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.3.0...eslint-plugin-smarthr-v6.4.0) (2026-02-16)


### Features

* **best-practice-for-unnesessary-early-return:** 早期return直後に単独のifが存在する場合、一つのifにまとめるように促すチェックを追加 ([#1082](https://github.com/kufu/tamatebako/issues/1082)) ([e7a6d70](https://github.com/kufu/tamatebako/commit/e7a6d709a5e633c0fbb65f9f0331746cfd752124))


### Bug Fixes

* **best-practice-for-layouts:** flatMapメソッドの場合も正しくチェックできるように修正する ([#1079](https://github.com/kufu/tamatebako/issues/1079)) ([838af61](https://github.com/kufu/tamatebako/commit/838af61523370a321fc95272aca742072a04c235))

## [6.3.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.2.3...eslint-plugin-smarthr-v6.3.0) (2026-02-06)


### Features

* **a11y-heading-in-sectioning-content:** tag属性がunrecommendedTagにrenameされたためチェック対象を調整 ([#1066](https://github.com/kufu/tamatebako/issues/1066)) ([5b524f3](https://github.com/kufu/tamatebako/commit/5b524f3a712e48953ec6aad18028f3f19d6b86ca))


### Bug Fixes

* selectorでhas(&gt;...)をやめ、直接属性で絞り込むように調整 ([#1069](https://github.com/kufu/tamatebako/issues/1069)) ([540426f](https://github.com/kufu/tamatebako/commit/540426f0ea90ba9b8cd67242067dcc8e4c855b5f))

## [6.2.3](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.2.2...eslint-plugin-smarthr-v6.2.3) (2026-02-05)


### Bug Fixes

* eslintのセレクタエンジンのアップデートにより、&gt;の前後のスペースが必須になったため修正 ([#1055](https://github.com/kufu/tamatebako/issues/1055)) ([d885f3c](https://github.com/kufu/tamatebako/commit/d885f3cde328abc119c0e4798c399cbdd1b4907a))

## [6.2.2](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.2.1...eslint-plugin-smarthr-v6.2.2) (2026-02-05)


### Bug Fixes

* **a11y-anchor-has-href-attribute:** href属性に空文字・#が指定されていることをチェックするselectorの記述がinvalidになる場合があるため変更 ([#1049](https://github.com/kufu/tamatebako/issues/1049)) ([fa210cb](https://github.com/kufu/tamatebako/commit/fa210cb4d691bfd402ed86210a7552fe3b001c3a))

## [6.2.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.2.0...eslint-plugin-smarthr-v6.2.1) (2026-02-02)


### Bug Fixes

* **best-practice-for-interactive-element:** button要素に対してrole="menuitem"の設定を許容する ([#1038](https://github.com/kufu/tamatebako/issues/1038)) ([022b22f](https://github.com/kufu/tamatebako/commit/022b22f5432cd5cc7afd54525dd66c3e0e5d3d49))

## [6.2.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.1.0...eslint-plugin-smarthr-v6.2.0) (2026-01-29)


### Features

* **best-practice-for-interactive-element:** 特定の要素・コンポーネントに対してrole属性の設定を共用する条件を追加 ([#1031](https://github.com/kufu/tamatebako/issues/1031)) ([1bf4c67](https://github.com/kufu/tamatebako/commit/1bf4c679e767edf169de53c89d7ac69c4873b1e1))

## [6.1.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.0.2...eslint-plugin-smarthr-v6.1.0) (2026-01-29)


### Features

* **best-practice-for-interactive-element:** delegateでイベントを受け取ることを明確にするようコード修正を促すように修正 ([#1027](https://github.com/kufu/tamatebako/issues/1027)) ([476c858](https://github.com/kufu/tamatebako/commit/476c858d87a581a33e764ac1aa9aafee29805217))

## [6.0.2](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.0.1...eslint-plugin-smarthr-v6.0.2) (2026-01-29)


### Bug Fixes

* **best-practice-for-interactive-element:** 属性にインタラクティブなコンポーネントを設定している場合、onXxxが誤検知されてしまうバグを修正 ([#1023](https://github.com/kufu/tamatebako/issues/1023)) ([81563cd](https://github.com/kufu/tamatebako/commit/81563cd2fa13ae9f53306d592b2f86e17e1f790c))

## [6.0.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v6.0.0...eslint-plugin-smarthr-v6.0.1) (2026-01-28)


### Bug Fixes

* **best-practice-for-interactive-element:** as属性でインタラクティブなコンポーネントに変更した場合、onXxxのチェックが誤検知する問題を修正 ([#1019](https://github.com/kufu/tamatebako/issues/1019)) ([8ba4343](https://github.com/kufu/tamatebako/commit/8ba4343b87b8acb8fee374946dd18c848839e6a9))

## [6.0.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v5.0.0...eslint-plugin-smarthr-v6.0.0) (2026-01-28)


### ⚠ BREAKING CHANGES

* **a11y-delegate-element-has-role-presentation:** ルールを削除します ([#1015](https://github.com/kufu/tamatebako/issues/1015))

### Features

* **a11y-delegate-element-has-role-presentation:** ルールを削除します ([#1015](https://github.com/kufu/tamatebako/issues/1015)) ([4c5c7ab](https://github.com/kufu/tamatebako/commit/4c5c7ab43ab7a52f749963aa7b7cb359e6f623d5))
* best-practice-for-interactive-elementを追加 ([#1014](https://github.com/kufu/tamatebako/issues/1014)) ([e0a171b](https://github.com/kufu/tamatebako/commit/e0a171b056d8dbe775e3697633136e60c84afe5d))

## [5.0.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v4.0.2...eslint-plugin-smarthr-v5.0.0) (2026-01-08)


### ⚠ BREAKING CHANGES

* **best-practice-for-spread-syntax:** best-practice-for-spread-syntaxのチェック対象をObject内のスプレッド構文に広げ、autofixするように修正 ([#1009](https://github.com/kufu/tamatebako/issues/1009))

### Features

* **best-practice-for-spread-syntax:** best-practice-for-spread-syntaxのチェック対象をObject内のスプレッド構文に広げ、autofixするように修正 ([#1009](https://github.com/kufu/tamatebako/issues/1009)) ([d334970](https://github.com/kufu/tamatebako/commit/d33497002710301b738f7e16382540a5ba35d36f))

## [4.0.2](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v4.0.1...eslint-plugin-smarthr-v4.0.2) (2026-01-07)


### Bug Fixes

* best-practice-for-spread-syntaxのcheckTypeをalways以外を指定した場合、チェック対象のコードによってエラーが発生する問題を修正 ([#1005](https://github.com/kufu/tamatebako/issues/1005)) ([ebd7b71](https://github.com/kufu/tamatebako/commit/ebd7b714a4e31f3875f5c3d9ad6a16bfb6e31634))

## [4.0.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v4.0.0...eslint-plugin-smarthr-v4.0.1) (2026-01-04)


### Bug Fixes

* **best-practice-for-spread-syntax:** 関数に対してspread syntaxで引数を渡すパターンが誤検知される問題を修正 ([#999](https://github.com/kufu/tamatebako/issues/999)) ([3f4a163](https://github.com/kufu/tamatebako/commit/3f4a163b183305922651612d7945434dcb5fa991))

## [4.0.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.5.1...eslint-plugin-smarthr-v4.0.0) (2026-01-04)


### ⚠ BREAKING CHANGES

* **jsx-start-with-spread-attributes:** best-practice-for-spread-syntaxにrenameし、objectに展開する場合もチェックするように修正 ([#992](https://github.com/kufu/tamatebako/issues/992))

### Features

* **jsx-start-with-spread-attributes:** best-practice-for-spread-syntaxにrenameし、objectに展開する場合もチェックするように修正 ([#992](https://github.com/kufu/tamatebako/issues/992)) ([b5cde40](https://github.com/kufu/tamatebako/commit/b5cde40cc85e74babe76cd00c4b639d91e142abc))

## [3.5.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.5.0...eslint-plugin-smarthr-v3.5.1) (2025-12-31)


### Bug Fixes

* best-practice-for-rest-parameters で残余引数をarrow functionでreturnする場合誤検知されていた問題を修正 ([#988](https://github.com/kufu/tamatebako/issues/988)) ([4353323](https://github.com/kufu/tamatebako/commit/4353323e1cc37761dbc841023f5b1575ca3e38cc))
* best-practice-for-rest-parameters で残余引数をreturnする場合誤検知されていた問題を修正 ([#986](https://github.com/kufu/tamatebako/issues/986)) ([9ff646c](https://github.com/kufu/tamatebako/commit/9ff646c10c6ca9c28eff111b837fa6030003ac2a))

## [3.5.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.4.0...eslint-plugin-smarthr-v3.5.0) (2025-12-26)


### Features

* smarthr/best-practice-for-optional-chaining を追加 ([#979](https://github.com/kufu/tamatebako/issues/979)) ([ff18a55](https://github.com/kufu/tamatebako/commit/ff18a55970f026c2d828cf22f99e9969d90d7d82))
* smarthr/best-practice-for-unnesessary-early-return を追加 ([#977](https://github.com/kufu/tamatebako/issues/977)) ([cd0b1a2](https://github.com/kufu/tamatebako/commit/cd0b1a205e82f01ce2be4fe43b69555d86ab5fd1))

## [3.4.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.3.2...eslint-plugin-smarthr-v3.4.0) (2025-12-24)


### Features

* best-practice-for-rest-parameters の残余引数の命名規則をrestもしくはxxxRestにすることを促すように修正 ([#973](https://github.com/kufu/tamatebako/issues/973)) ([3824818](https://github.com/kufu/tamatebako/commit/3824818a68d0ab6b2b2dc04ff5292f9d8be03d9b))

## [3.3.2](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.3.1...eslint-plugin-smarthr-v3.3.2) (2025-12-23)


### Bug Fixes

* best-practice-for-rest-parametersの誤検知を修正し、エラー文言を条件に合わせて出し分けるように修正 ([#967](https://github.com/kufu/tamatebako/issues/967)) ([cf71e12](https://github.com/kufu/tamatebako/commit/cf71e1256ef6453fe99080829e6969cea88d5a92))

## [3.3.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.3.0...eslint-plugin-smarthr-v3.3.1) (2025-12-19)


### Bug Fixes

* smarthr/best-practice-for-rest-parametersの誤検知を修正 ([#959](https://github.com/kufu/tamatebako/issues/959)) ([12d2018](https://github.com/kufu/tamatebako/commit/12d20189c5f697b74751169925a063b8c67b4edb))

## [3.3.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.2.0...eslint-plugin-smarthr-v3.3.0) (2025-12-18)


### Features

* best-practice-for-rest-parametersを追加 ([#953](https://github.com/kufu/tamatebako/issues/953)) ([093f8f2](https://github.com/kufu/tamatebako/commit/093f8f258b65a746cc10ae90696827600ca45dfc))

## [3.2.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.1.0...eslint-plugin-smarthr-v3.2.0) (2025-12-15)


### Features

* best-practice-for-prohibit-import-smarthr-ui-local を追加 ([#946](https://github.com/kufu/tamatebako/issues/946)) ([1be8bf8](https://github.com/kufu/tamatebako/commit/1be8bf82aa97ccca9dba60277f50c5247ad2b664))

## [3.1.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v3.0.0...eslint-plugin-smarthr-v3.1.0) (2025-12-10)


### Features

* best-practice-for-layoutsにradio, checkに対するチェックを追加 ([#937](https://github.com/kufu/tamatebako/issues/937)) ([97a393a](https://github.com/kufu/tamatebako/commit/97a393a9ae2a4cdfbfe8b82aba8cf15f22991e45))

## [3.0.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v2.5.0...eslint-plugin-smarthr-v3.0.0) (2025-12-08)


### ⚠ BREAKING CHANGES

* a11y-required-layout-as-attributeを削除する ([#919](https://github.com/kufu/tamatebako/issues/919))

### Features

* a11y-required-layout-as-attributeを削除する ([#919](https://github.com/kufu/tamatebako/issues/919)) ([fbf6897](https://github.com/kufu/tamatebako/commit/fbf68978c6b2590cf031cdea6badb9edf7faab96))


### Bug Fixes

* require-i18n-textで特定の文字列の場合、修正対象にしないように調整 ([#924](https://github.com/kufu/tamatebako/issues/924)) ([ddfb24b](https://github.com/kufu/tamatebako/commit/ddfb24b82a784312eb4750e87fbcd7c1374d6fcf))

## [2.5.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v2.4.0...eslint-plugin-smarthr-v2.5.0) (2025-12-04)


### Features

* lintのエラーメッセージに仕様詳細へのリンクを追加 ([#918](https://github.com/kufu/tamatebako/issues/918)) ([4f6dd2f](https://github.com/kufu/tamatebako/commit/4f6dd2fdca759b7b04c885196fe2b2e2a05c0c96))

## [2.4.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v2.3.0...eslint-plugin-smarthr-v2.4.0) (2025-12-02)


### Features

* Modalというコンポーネントの作成を禁止し、Dialogという名称に統一させる ([#915](https://github.com/kufu/tamatebako/issues/915)) ([208c2a0](https://github.com/kufu/tamatebako/commit/208c2a06034bcf24bfe1a3dd0d8633b0c546db11))


### Bug Fixes

* a11y-prohibit-checkbox-or-radio-in-table-cellのautofixを削除 & childrenを持つ場合に警告されないよう修正 ([#914](https://github.com/kufu/tamatebako/issues/914)) ([3962fda](https://github.com/kufu/tamatebako/commit/3962fda01a1966c9624d5cd7056d807f86ccb5bc))
* trim-props でTemplateLiteralがネストしている場合のチェックを修正 ([#912](https://github.com/kufu/tamatebako/issues/912)) ([2d090c4](https://github.com/kufu/tamatebako/commit/2d090c4ef6d1ac4c9537fdb13a0198552456c10c))

## [2.3.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v2.2.1...eslint-plugin-smarthr-v2.3.0) (2025-12-01)


### Features

* best-practice-for-layout にHeading, FormControl, Fieldsetのタイトル部分でLayout系コンポーネントの仕様を制限するチェックを追加 ([#906](https://github.com/kufu/tamatebako/issues/906)) ([631aeca](https://github.com/kufu/tamatebako/commit/631aecaa20c834b6d603e31af95f2aaee9694bd0))

## [2.2.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v2.2.0...eslint-plugin-smarthr-v2.2.1) (2025-11-18)


### Bug Fixes

* a11y-anchor-has-href-attributeがhrefにメソッドが指定されている場合に誤検知することがある問題を修正 ([#905](https://github.com/kufu/tamatebako/issues/905)) ([6ebd6ec](https://github.com/kufu/tamatebako/commit/6ebd6ecc074a7088652697dcb6bfb60b63a13fc4))
* a11y-input-has-name-attributeでtemplate literalの場合、誤検知してしまう問題を修正 ([#904](https://github.com/kufu/tamatebako/issues/904)) ([d440e86](https://github.com/kufu/tamatebako/commit/d440e8675bf600dbe8a51e496d7076bcf617336f))

## [2.2.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v2.1.0...eslint-plugin-smarthr-v2.2.0) (2025-11-07)


### Features

* a11y-help-link-with-support-hrefで対象となる変数名のバグを修正 ([#890](https://github.com/kufu/tamatebako/issues/890)) ([c9c4984](https://github.com/kufu/tamatebako/commit/c9c49848293fd88640e886c6586ae8d92a99f40c))
* trim-propsでtemplate literalもautofixの対象にする ([#884](https://github.com/kufu/tamatebako/issues/884)) ([4072950](https://github.com/kufu/tamatebako/commit/40729507f5084308128ca39d5887ee81f2f67dd5))

## [2.1.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v2.0.0...eslint-plugin-smarthr-v2.1.0) (2025-10-29)


### Features

* prohibit-export-array-typeの型チェックをArray&lt;any&gt;の場合も対象にする ([#869](https://github.com/kufu/tamatebako/issues/869)) ([ee4a647](https://github.com/kufu/tamatebako/commit/ee4a64755c36880d8f43c31ebd47244d71ea2fe9))
* コンポーネントの子要素やプロパティの文字列リテラルを多言語化の観点で検査するルールを追加 ([#815](https://github.com/kufu/tamatebako/issues/815)) ([9dc8bda](https://github.com/kufu/tamatebako/commit/9dc8bda98d1a978dd0e4d61b91c858ef1c117d9c))

## [2.0.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.11.0...eslint-plugin-smarthr-v2.0.0) (2025-10-16)


### ⚠ BREAKING CHANGES

* eslint rule の smarthr/a11y-replace-unreadable-symbolを削除 ([#850](https://github.com/kufu/tamatebako/issues/850))

### Code Refactoring

* eslint rule の smarthr/a11y-replace-unreadable-symbolを削除 ([#850](https://github.com/kufu/tamatebako/issues/850)) ([68336f8](https://github.com/kufu/tamatebako/commit/68336f8df42fcfe0c3a8375671377cc62b2be711))

## [1.11.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.10.0...eslint-plugin-smarthr-v1.11.0) (2025-10-01)


### Features

* a11y-input-in-form-controlのaria-label,aria-labelledbyが設定されている場合、FormControlでラップしなくてもよしとする ([#795](https://github.com/kufu/tamatebako/issues/795)) ([443892f](https://github.com/kufu/tamatebako/commit/443892ffb39732157d77a179484da3f529e43885))

## [1.10.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.9.0...eslint-plugin-smarthr-v1.10.0) (2025-10-01)


### Features

* セル内のCheckboxおよびRadioButtonを禁止するルールを追加 ([#792](https://github.com/kufu/tamatebako/issues/792)) ([17ab980](https://github.com/kufu/tamatebako/commit/17ab98018c81a81376ac213e3309e60080ed9326))

## [1.9.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.8.1...eslint-plugin-smarthr-v1.9.0) (2025-09-08)


### Features

* a11y-input-form-controlのラベル設定チェックのロジックを変更する ([#753](https://github.com/kufu/tamatebako/issues/753)) ([f4b5308](https://github.com/kufu/tamatebako/commit/f4b5308911c45862670eca58abffeeb75d20c16e))

## [1.8.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.8.0...eslint-plugin-smarthr-v1.8.1) (2025-06-12)


### Bug Fixes

* a11y-anchor-has-href-attribute での特殊分岐条件を react-router-dom から react-router に変更 ([#678](https://github.com/kufu/tamatebako/issues/678)) ([5941384](https://github.com/kufu/tamatebako/commit/59413842b5b7e5ca6ee88a511792ae6a81be988b))
* a11y-delegate-element-has-role-presentationでインタラクティブな要素を判定する際、コンポーネント名が複数形でも許容する ([#679](https://github.com/kufu/tamatebako/issues/679)) ([67567bd](https://github.com/kufu/tamatebako/commit/67567bde757624ed46649fb0401e24dc904865ba))
* a11y-heading-in-sectioning-contentでNavにaria-labelが設定されている場合を許容する ([#680](https://github.com/kufu/tamatebako/issues/680)) ([12f26be](https://github.com/kufu/tamatebako/commit/12f26be9d461d1580711263ae974ed948c74fc1d))

## [1.8.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.7.0...eslint-plugin-smarthr-v1.8.0) (2025-06-09)


### Features

* best-practice-for-layoutsで &lt;any&gt;{hoge}&lt;/any&gt; など子要素が変数のみの場合を許容する ([#668](https://github.com/kufu/tamatebako/issues/668)) ([7d03ff1](https://github.com/kufu/tamatebako/commit/7d03ff150833f673b9c2afe8e86adfdaee150d72))
* format-translate-component rule で RangeSeparator を許容する ([#667](https://github.com/kufu/tamatebako/issues/667)) ([951bee2](https://github.com/kufu/tamatebako/commit/951bee2f376ddf48c5e9a0b13eb50b2daeeec7f9))

## [1.7.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.6.0...eslint-plugin-smarthr-v1.7.0) (2025-06-02)


### Features

* a11y-help-link-with-support-href を追加 ([#646](https://github.com/kufu/tamatebako/issues/646)) ([662ca33](https://github.com/kufu/tamatebako/commit/662ca33120acac3fb9acdc7331d187fba9be86ef))
* best-practice-for-nested-attributes-array-index ruleを追加 ([#648](https://github.com/kufu/tamatebako/issues/648)) ([8774d84](https://github.com/kufu/tamatebako/commit/8774d84f46fcaff9360aa76cb3773f644d6d5529))

## [1.6.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.5.1...eslint-plugin-smarthr-v1.6.0) (2025-05-20)


### Features

* best-practice-for-async-current-targetルールを追加 ([#625](https://github.com/kufu/tamatebako/issues/625)) ([8cc72b4](https://github.com/kufu/tamatebako/commit/8cc72b4d4d552ed1efa9cfe7fbec04de0fcc369e))

## [1.5.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.5.0...eslint-plugin-smarthr-v1.5.1) (2025-05-12)


### Bug Fixes

* require-barrel-import のロジックミスを修正する ([#619](https://github.com/kufu/tamatebako/issues/619)) ([60b21f7](https://github.com/kufu/tamatebako/commit/60b21f7949aa21e85b944825f9a55dda380943fa))

## [1.5.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.4.2...eslint-plugin-smarthr-v1.5.0) (2025-05-12)


### Features

* 個別のルールで行っていたコンポーネントの命名規則チェックをcomponent-name ルールとして統一する ([#610](https://github.com/kufu/tamatebako/issues/610)) ([a73b7e7](https://github.com/kufu/tamatebako/commit/a73b7e7e305bbc84fe7001ca9ed040c3889550f4))

## [1.4.2](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.4.1...eslint-plugin-smarthr-v1.4.2) (2025-03-27)


### Bug Fixes

* smarthr-uiのCheckbox,Comboboxに対応する ([#550](https://github.com/kufu/tamatebako/issues/550)) ([3978a12](https://github.com/kufu/tamatebako/commit/3978a120e4be158a4e9bd602bb1055b55600a41b))

## [1.4.1](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.4.0...eslint-plugin-smarthr-v1.4.1) (2025-03-25)


### Bug Fixes

* tailwind-variantsでtv以外のimportを行った際、エラーになる問題を修正する ([#536](https://github.com/kufu/tamatebako/issues/536)) ([83efcf6](https://github.com/kufu/tamatebako/commit/83efcf671938ca471265af9c05bd47fbcce55fb9))

## [1.4.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.3.0...eslint-plugin-smarthr-v1.4.0) (2025-03-06)


### Features

* best-practice-for-tailwind-prohibit-root-margin ([#523](https://github.com/kufu/tamatebako/issues/523)) ([b14700a](https://github.com/kufu/tamatebako/commit/b14700a17b1c5496e50c6c920f0281bf3ec1d7da))

## [1.3.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.2.0...eslint-plugin-smarthr-v1.3.0) (2025-02-21)


### Features

* tailwind-variantsの使い方をチェックするルールを追加 ([#480](https://github.com/kufu/tamatebako/issues/480)) ([1501f05](https://github.com/kufu/tamatebako/commit/1501f05e84492e7671a4dc95ef08b15360a1c309))


### Bug Fixes

* [a11y-input-has-name-attribute]Inputにreact-hook-formのregisterが指定されている場合はエラーにならないようにする ([#490](https://github.com/kufu/tamatebako/issues/490)) ([2fc6abe](https://github.com/kufu/tamatebako/commit/2fc6abe9515a06dbf7e823da556e045402298a1b))

## [1.2.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.1.0...eslint-plugin-smarthr-v1.2.0) (2025-01-09)


### Features

* a11y系のルールをsmarthr-ui/WarekiPickerに対応させる ([#471](https://github.com/kufu/tamatebako/issues/471)) ([a52995c](https://github.com/kufu/tamatebako/commit/a52995cb999de2942989eac00bbc299922cf6208))

## [1.1.0](https://github.com/kufu/tamatebako/compare/eslint-plugin-smarthr-v1.0.0...eslint-plugin-smarthr-v1.1.0) (2025-01-08)


### Features

* a11y-input-in-form-controlでtype="hidden"の場合の判定を追加 ([#455](https://github.com/kufu/tamatebako/issues/455)) ([4ff63b9](https://github.com/kufu/tamatebako/commit/4ff63b90b5cba5df34fe5ffc0fb25cbd1ed8a2b3))

## [1.0.0](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.20...v1.0.0) (2024-12-12)


### ⚠ BREAKING CHANGES

ESLint v9 及び FlatConfig への対応をしました。

これにともない、ESLint v8 以下及び LegacyConfig では利用できなくなりました。

* ESLint v9 ([#154](https://github.com/kufu/eslint-plugin-smarthr/issues/154)) ([a0b79fd](https://github.com/kufu/eslint-plugin-smarthr/commit/a0b79fd39fcab103008f9a257fb29d7d0e9c662b))

### [0.5.20](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.18...v0.5.20) (2024-11-25)


### Bug Fixes

* エラーメッセージ生成ミスを修正 ([#152](https://github.com/kufu/eslint-plugin-smarthr/issues/152)) ([17b8bd0](https://github.com/kufu/eslint-plugin-smarthr/commit/17b8bd03f6bd7c0587618f280c943517308710b2))

### [0.5.19](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.18...v0.5.19) (2024-11-25)


### Bug Fixes

* エラーメッセージ生成ミスを修正 ([4ea11f1](https://github.com/kufu/eslint-plugin-smarthr/commit/4ea11f18028de2fe87842476f92325f48f8bbf49))

### [0.5.18](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.17...v0.5.18) (2024-11-25)


### Features

* a11y-requried-layout-as-attribute ルールを追加する ([#150](https://github.com/kufu/eslint-plugin-smarthr/issues/150)) ([96e0970](https://github.com/kufu/eslint-plugin-smarthr/commit/96e09702ea59cfcd5a173e187300b9054047b65c))


### Bug Fixes

* a11y-form-control-in-form でFilterDropdownをformとして扱うように修正 ([#151](https://github.com/kufu/eslint-plugin-smarthr/issues/151)) ([9d86ef8](https://github.com/kufu/eslint-plugin-smarthr/commit/9d86ef885b607582324df24e5743d42533108db3))

### [0.5.17](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.16...v0.5.17) (2024-11-04)


### Features

* a11y-prohibit-heading-in-formを追加 ([#148](https://github.com/kufu/eslint-plugin-smarthr/issues/148)) ([973f681](https://github.com/kufu/eslint-plugin-smarthr/commit/973f681fd3538224e7312b6eb38ea43e6fb17cc5))

### [0.5.16](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.15...v0.5.16) (2024-10-25)

### [0.5.15](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.14...v0.5.15) (2024-09-10)


### Features

* a11y系ルールの対象にsmarthr-ui/TimePickerを追加する ([#146](https://github.com/kufu/eslint-plugin-smarthr/issues/146)) ([90d9bf4](https://github.com/kufu/eslint-plugin-smarthr/commit/90d9bf42d770026e7ebc9442096e677fab298841))


### Bug Fixes

* README.md内のIncorrect examplesを修正 ([fe0f7d2](https://github.com/kufu/eslint-plugin-smarthr/commit/fe0f7d2b8bf9773a8ff7e962084093bc6441bcda))

### [0.5.14](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.11...v0.5.14) (2024-07-02)


### Features

* best-practice-for-data-test-attributeを追加 ([#141](https://github.com/kufu/eslint-plugin-smarthr/issues/141)) ([30a8f00](https://github.com/kufu/eslint-plugin-smarthr/commit/30a8f003e1cdb79c709390be0322703e74de284d))
* ButtonやTextLinkコンポーネントにprefix, suffixの両属性を同時に設定できないルールを追加 ([1eb7568](https://github.com/kufu/eslint-plugin-smarthr/commit/1eb75680a1125391106994532b58cc0591853711))


### Bug Fixes

* a11y-clickable-element-has-text でtext属性を持つコンポーネントが存在する場合、真となるように修正 ([#143](https://github.com/kufu/eslint-plugin-smarthr/issues/143)) ([46b7048](https://github.com/kufu/eslint-plugin-smarthr/commit/46b7048dc3bb5a29455e205fabdd584fa478d2f1))

### [0.5.13](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.12...v0.5.13) (2024-06-21)


### Features

* ButtonやTextLinkコンポーネントにprefix, suffixの両属性を同時に設定できないルールを追加 ([1eb7568](https://github.com/kufu/eslint-plugin-smarthr/commit/1eb75680a1125391106994532b58cc0591853711))

### [0.5.12](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.11...v0.5.12) (2024-06-10)


### Features

* best-practice-for-data-test-attributeを追加 ([#141](https://github.com/kufu/eslint-plugin-smarthr/issues/141)) ([30a8f00](https://github.com/kufu/eslint-plugin-smarthr/commit/30a8f003e1cdb79c709390be0322703e74de284d))

### [0.5.11](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.9...v0.5.11) (2024-06-06)


### Bug Fixes

*  <FormControl> 内に三項演算子がある場合に、入力要素が複数あると誤認されないようにする ([#139](https://github.com/kufu/eslint-plugin-smarthr/issues/139)) ([8a234c7](https://github.com/kufu/eslint-plugin-smarthr/commit/8a234c73e140725ff1926d4d23f64c263e46d5d6))
* 適切にonClick属性を利用しているケースを通したい！ ([cc71417](https://github.com/kufu/eslint-plugin-smarthr/commit/cc7141768f222f45ffbff1aa1dadec1fcfb83dd2))

### [0.5.10](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.9...v0.5.10) (2024-04-26)


### Bug Fixes

*  <FormControl> 内に三項演算子がある場合に、入力要素が複数あると誤認されないようにする ([#139](https://github.com/kufu/eslint-plugin-smarthr/issues/139)) ([8a234c7](https://github.com/kufu/eslint-plugin-smarthr/commit/8a234c73e140725ff1926d4d23f64c263e46d5d6))

### [0.5.9](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.7...v0.5.9) (2024-04-22)


### Features

* a11y-prohibit-input-maxlength-attribute ([#135](https://github.com/kufu/eslint-plugin-smarthr/issues/135)) ([9f9d010](https://github.com/kufu/eslint-plugin-smarthr/commit/9f9d010e819d936fe5f55556a8f65e6485c552ce))
* a11y系コンポーネントでBase,BaseColumnにas="section"などSectioningContentが指定された場合、outlineが切られていると判断するよう修正 ([#138](https://github.com/kufu/eslint-plugin-smarthr/issues/138)) ([7b62c62](https://github.com/kufu/eslint-plugin-smarthr/commit/7b62c6293cf057e97616992dd30fcf67b758f32f))
* best-practice-for-layouts に <Stack align="center"> を <Center> に置き換えることを促すチェックを追加 ([#133](https://github.com/kufu/eslint-plugin-smarthr/issues/133)) ([5835530](https://github.com/kufu/eslint-plugin-smarthr/commit/58355308bf9a5d18d2d731e699c54806af969ed9))
* best-practice-for-layoutsでStackコンポーネントにgap={0}が指定されている場合、適切に置き換え・または削除を促すように修正 ([#137](https://github.com/kufu/eslint-plugin-smarthr/issues/137)) ([2a11919](https://github.com/kufu/eslint-plugin-smarthr/commit/2a11919ffa20ddbbc6a59210ec14d81d2d510cda))

### [0.5.8](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.7...v0.5.8) (2024-04-09)


### Features

* a11y-prohibit-input-maxlength-attribute ([#135](https://github.com/kufu/eslint-plugin-smarthr/issues/135)) ([9f9d010](https://github.com/kufu/eslint-plugin-smarthr/commit/9f9d010e819d936fe5f55556a8f65e6485c552ce))
* best-practice-for-layouts に <Stack align="center"> を <Center> に置き換えることを促すチェックを追加 ([#133](https://github.com/kufu/eslint-plugin-smarthr/issues/133)) ([5835530](https://github.com/kufu/eslint-plugin-smarthr/commit/58355308bf9a5d18d2d731e699c54806af969ed9))

### [0.5.7](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.6...v0.5.7) (2024-04-01)


### Features

* a11y-delegate-element-has-role-presentationでas, forwardedAsにform, fieldsetが指定されている場合、インタファクティブな要素として扱うように修正 ([#132](https://github.com/kufu/eslint-plugin-smarthr/issues/132)) ([3d629fa](https://github.com/kufu/eslint-plugin-smarthr/commit/3d629fa73e7346c229831a0075478fcbfe582de1))
* a11y-replace-unreadable-symbol ([#128](https://github.com/kufu/eslint-plugin-smarthr/issues/128)) ([9410ff9](https://github.com/kufu/eslint-plugin-smarthr/commit/9410ff9ad9ed5a0d18945e3567a1fee8c056f822))

### [0.5.6](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.5...v0.5.6) (2024-03-29)


### Bug Fixes

* best-practice-for-layoutsで "a?.map(function)" のようにchainを使っている場合正しく検知できなかった問題を修正 ([#131](https://github.com/kufu/eslint-plugin-smarthr/issues/131)) ([80da1ca](https://github.com/kufu/eslint-plugin-smarthr/commit/80da1caa3d9b8cf9e3fc9d9cfd3f1b0e28be9e29))

### [0.5.5](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.4...v0.5.5) (2024-03-29)


### Bug Fixes

* a11y-heading-in-sectioning-contentでHeadingコンポーネントにtag属性を変数で設定した場合、jsエラーが起きるバグを修正 ([#130](https://github.com/kufu/eslint-plugin-smarthr/issues/130)) ([f927ecd](https://github.com/kufu/eslint-plugin-smarthr/commit/f927ecd80245f6976de9b561c07229cf3038f121))

### [0.5.4](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.3...v0.5.4) (2024-03-29)


### Features

* a11y-heading-in-sectioning-contentで title, もしくはheading属性がSectioningContent系コンポーネントに設定されている場合、headingがあると判定するように修正 ([#129](https://github.com/kufu/eslint-plugin-smarthr/issues/129)) ([93bbd19](https://github.com/kufu/eslint-plugin-smarthr/commit/93bbd1907cd7f28510dde1ddc93a16d0c92a2c9b))

### [0.5.3](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.2...v0.5.3) (2024-03-26)


### Features

* a11y-heading-in-sectioning-contentでHeadingを持たないSectioning Contentを検知するように修正 ([#124](https://github.com/kufu/eslint-plugin-smarthr/issues/124)) ([8b96de0](https://github.com/kufu/eslint-plugin-smarthr/commit/8b96de0c9a474b0c8d72a4b9c3b3b351d2cfb4e5))
* smarthr-ui/Layouts系コンポーネントの利用方法をチェックする best-practice-for-layouts ルールを追加する ([#126](https://github.com/kufu/eslint-plugin-smarthr/issues/126)) ([e0324e4](https://github.com/kufu/eslint-plugin-smarthr/commit/e0324e4ffab0413e61811cf7cf7f129c0602e0f0))


### Bug Fixes

* a11y-input-in-form-control で Clusterを拡張する際のチェックを追加 ([#125](https://github.com/kufu/eslint-plugin-smarthr/issues/125)) ([f723e24](https://github.com/kufu/eslint-plugin-smarthr/commit/f723e24db86c1095178bb1f28636147e7b619bf2))
* a11y-numbered-text-within-olのチェックで、属性の値でstyleに数値を指定しているような値の場合、無視する ([#123](https://github.com/kufu/eslint-plugin-smarthr/issues/123)) ([77a6278](https://github.com/kufu/eslint-plugin-smarthr/commit/77a6278ff8ec58c99843746442e1f3c0e54574c5))

### [0.5.2](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.1...v0.5.2) (2024-03-17)

### [0.5.1](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.5.0...v0.5.1) (2024-03-17)


### Features

* a11y-form-control-in-formルールを追加 ([#121](https://github.com/kufu/eslint-plugin-smarthr/issues/121)) ([a6270f9](https://github.com/kufu/eslint-plugin-smarthr/commit/a6270f9f22832a8ccaeef3b63e35da84b6e13e68))

## [0.5.0](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.4.2...v0.5.0) (2024-03-11)


### ⚠ BREAKING CHANGES

* spread attributesが指定されている場合、ruleをcorrectにする smartr オプションを allow-spread-attributes オプションにリネームする (#119)

### Bug Fixes

* spread attributesが指定されている場合、ruleをcorrectにする smartr オプションを allow-spread-attributes オプションにリネームする ([#119](https://github.com/kufu/eslint-plugin-smarthr/issues/119)) ([25752bb](https://github.com/kufu/eslint-plugin-smarthr/commit/25752bb8e77cf170779de3746b9dbbc3997be09d))

### [0.4.2](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.4.1...v0.4.2) (2024-03-03)


### Features

* best-practice-for-button-elementを追加 ([#115](https://github.com/kufu/eslint-plugin-smarthr/issues/115)) ([c19ab10](https://github.com/kufu/eslint-plugin-smarthr/commit/c19ab1062d00aa000cfcf9b86535af21b47a0ead))


### Bug Fixes

* a11y-numbered-text-within-ol でwidthの値が誤検知されてしまう場合に対応する ([#117](https://github.com/kufu/eslint-plugin-smarthr/issues/117)) ([3741d54](https://github.com/kufu/eslint-plugin-smarthr/commit/3741d5412f62ac04286e0626e37d2ca3c57c4f60))

### [0.4.1](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.4.0...v0.4.1) (2024-02-21)


### Features

* a11y-numbered-text-within-olを追加する ([#105](https://github.com/kufu/eslint-plugin-smarthr/issues/105)) ([167b92f](https://github.com/kufu/eslint-plugin-smarthr/commit/167b92f0f29db8ee9a446d25e09e04a7b11ce340))
* ComboBoxなどのinputAttributesでtitle属性が指定された場合、擬似的にラベルが付いていると判定するように修正 ([#113](https://github.com/kufu/eslint-plugin-smarthr/issues/113)) ([5f3b594](https://github.com/kufu/eslint-plugin-smarthr/commit/5f3b5943ec64a18d094a9c66627ad1db2bbabe08))

## [0.4.0](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.27...v0.4.0) (2024-02-05)


### ⚠ BREAKING CHANGES

* 利用者がいなくなったsmarthr/redundant-nameを削除する (#111)

### Features

* a11y-input-in-form-controlでlabelが設定されている可能性が高いRadio, Checkboxの複数形コンポーネントを正しく判定できるようにする ([#112](https://github.com/kufu/eslint-plugin-smarthr/issues/112)) ([77ee8f4](https://github.com/kufu/eslint-plugin-smarthr/commit/77ee8f4cac883eb0a198875305a416f0172a584e))


### Bug Fixes

* 利用者がいなくなったsmarthr/redundant-nameを削除する ([#111](https://github.com/kufu/eslint-plugin-smarthr/issues/111)) ([2bc1011](https://github.com/kufu/eslint-plugin-smarthr/commit/2bc10118cc0a18366300c3816f091060d2a0677d))

### [0.3.27](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.26...v0.3.27) (2024-01-28)


### Features

* a11y系コンポーネントで入力要素の拡張コンポーネントの判定をfunctionを使っている場合にも正しく判定できるように修正 ([#108](https://github.com/kufu/eslint-plugin-smarthr/issues/108)) ([c929760](https://github.com/kufu/eslint-plugin-smarthr/commit/c929760b3d8e166e7e3f7befcf048fa28cc48042))

### [0.3.26](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.25...v0.3.26) (2024-01-24)


### Bug Fixes

* a11y-prohibit-useless-sectioning-fragmentの属性チェックのバグを修正 ([#107](https://github.com/kufu/eslint-plugin-smarthr/issues/107)) ([b42bdd9](https://github.com/kufu/eslint-plugin-smarthr/commit/b42bdd9e11258a6a32e13647c0c764065b5bac64))

### [0.3.25](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.24...v0.3.25) (2024-01-23)


### Features

* a11y-input-in-form-controlを追加する ([#98](https://github.com/kufu/eslint-plugin-smarthr/issues/98)) ([fb7e77d](https://github.com/kufu/eslint-plugin-smarthr/commit/fb7e77d8c3ac73f57425d094a240d998ff78a51d))
* a11y-prohibit-useless-sectioning-fragmentを追加する ([#106](https://github.com/kufu/eslint-plugin-smarthr/issues/106)) ([994c040](https://github.com/kufu/eslint-plugin-smarthr/commit/994c04027892a5fe50fb71ba8b5941401f12c02c))

### [0.3.24](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.23...v0.3.24) (2024-01-19)

### [0.3.23](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.22...v0.3.23) (2024-01-16)


### Bug Fixes

* import内で型の場合はtype kindを設定することでasでの命名縛りを回避できるように修正 ([#102](https://github.com/kufu/eslint-plugin-smarthr/issues/102)) ([689d7da](https://github.com/kufu/eslint-plugin-smarthr/commit/689d7da9e899b2801ae2dfdfd465f6cfcc277e85))

### [0.3.22](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.21...v0.3.22) (2024-01-16)


### Bug Fixes

* a11y-heading-in-sectioning-contentのLayout系コンポーネントのas属性をチェックする際の処理がエラーハンドリング出来ていなかったため対応 ([#101](https://github.com/kufu/eslint-plugin-smarthr/issues/101)) ([f77d686](https://github.com/kufu/eslint-plugin-smarthr/commit/f77d686cbe4f5061b1371c04cc0b84d058c41a34))

### [0.3.21](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.20...v0.3.21) (2024-01-16)


### Features

* a11y-heading-in-sectioning-content の Layout[as={sectioningContentTag}] への対応 ([#91](https://github.com/kufu/eslint-plugin-smarthr/issues/91)) ([62bb051](https://github.com/kufu/eslint-plugin-smarthr/commit/62bb0510d0e91db063a9bd09dab4fbeff6a2844e))


### Bug Fixes

* a11y-delegate-element-has-role-presentationでインタラクティブな要素のチェック処理を厳密に行う ([#100](https://github.com/kufu/eslint-plugin-smarthr/issues/100)) ([e715bff](https://github.com/kufu/eslint-plugin-smarthr/commit/e715bff6a95ab2cbf3652b44f999ad4c98ccb621))
* import時のrenameの際、typeの場合はチェックを無視する設定を追加 ([#99](https://github.com/kufu/eslint-plugin-smarthr/issues/99)) ([cae899f](https://github.com/kufu/eslint-plugin-smarthr/commit/cae899ff2b012e93b2651c971034553cefeef10e))

### [0.3.20](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.19...v0.3.20) (2024-01-02)

### [0.3.19](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.18...v0.3.19) (2024-01-01)


### Bug Fixes

* a11y-delegate-element-has-role-presentation のインタラクティブな要素の判定を調整する ([#96](https://github.com/kufu/eslint-plugin-smarthr/issues/96)) ([63c9bda](https://github.com/kufu/eslint-plugin-smarthr/commit/63c9bda3b5d52baa3c1c2fd183ebee06d3a429d2))

### [0.3.18](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.17...v0.3.18) (2023-12-30)


### Features

* a11y-delegate-element-has-role-presentation でインタラクティブな要素として扱われるコンポーネントを追加する ([#95](https://github.com/kufu/eslint-plugin-smarthr/issues/95)) ([7d2b66d](https://github.com/kufu/eslint-plugin-smarthr/commit/7d2b66d7f998e78e767a8d1353a6beac5312027c))

### [0.3.17](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.16...v0.3.17) (2023-12-30)


### Bug Fixes

* a11y-delegate-element-has-role-presentationのインタラクティブなコンポーネントであることの判定で、小文字始まりのコンポーネントの場合判定ミスされるバグを修正 ([#94](https://github.com/kufu/eslint-plugin-smarthr/issues/94)) ([50a8296](https://github.com/kufu/eslint-plugin-smarthr/commit/50a8296b6d22c5a6475469b1ed2ea1a46234f6fd))

### [0.3.16](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.15...v0.3.16) (2023-12-30)


### Features

* a11y-delegate-element-has-role-presantation を追加 ([#92](https://github.com/kufu/eslint-plugin-smarthr/issues/92)) ([c211ffb](https://github.com/kufu/eslint-plugin-smarthr/commit/c211ffb7e698d010ca639d0bdda9ea82cb31033a))

### [0.3.15](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.14...v0.3.15) (2023-11-29)


### Features

* a11y系ruleに "import時のasでのrename内容をチェックする" 処理を追加 ([#90](https://github.com/kufu/eslint-plugin-smarthr/issues/90)) ([2eab779](https://github.com/kufu/eslint-plugin-smarthr/commit/2eab77960985e7c52bd262ff674ae31cb2c6008e))

### [0.3.14](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.13...v0.3.14) (2023-11-05)


### Bug Fixes

* styled-components/attrsメソッドを利用している場合、継承時の名称チェック対象外になっていたため修正 ([#89](https://github.com/kufu/eslint-plugin-smarthr/issues/89)) ([93b72f2](https://github.com/kufu/eslint-plugin-smarthr/commit/93b72f23f0bcc507976793c63955cff13313e79f))

### [0.3.13](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.12...v0.3.13) (2023-10-16)


### Features

* a11-heading-in-sectioning-contentのtag属性不要チェックのエラー位置を、タグの開始行ではなく属性の記述されている行に変更する ([#86](https://github.com/kufu/eslint-plugin-smarthr/issues/86)) ([e25080a](https://github.com/kufu/eslint-plugin-smarthr/commit/e25080a461ddce87eaaf20cd0c7ef290fd321836))

### [0.3.12](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.11...v0.3.12) (2023-10-12)


### Features

* a11y-heading-in-sectioning-contentに"SectioningContent内のsmarthr-ui/Heading系コンポーネントにtag属性が設定されている場合エラー"になる機能を追加 ([#85](https://github.com/kufu/eslint-plugin-smarthr/issues/85)) ([c34b4f4](https://github.com/kufu/eslint-plugin-smarthr/commit/c34b4f43da89d7baf48c2536dcd381327064ef75))
* a11y-image-has-alt-attributeでaria-describedbyが設定されている場合、エラーにならないように修正 ([#84](https://github.com/kufu/eslint-plugin-smarthr/issues/84)) ([046ee0f](https://github.com/kufu/eslint-plugin-smarthr/commit/046ee0f082381627343371235102304a3f2a0938))

### [0.3.11](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.10...v0.3.11) (2023-09-27)

### [0.3.10](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.9...v0.3.10) (2023-09-20)


### Features

* a11y-heading-in-sectioning-contentでSectioningContentと予想される名前だがそれらの拡張ではないコンポーネントはエラーとする ([#77](https://github.com/kufu/eslint-plugin-smarthr/issues/77)) ([f7248d5](https://github.com/kufu/eslint-plugin-smarthr/commit/f7248d597cb06ba0bab1d3f0d51956efefd04aac))
* a11y-xxx-has-yyy-attributeにcheckTypeオプションを追加 ([#81](https://github.com/kufu/eslint-plugin-smarthr/issues/81)) ([94a511a](https://github.com/kufu/eslint-plugin-smarthr/commit/94a511a412e62431282eb1980941862313dfb777))
* a11y系ruleにstyled-componentsで既存のコンポーネントなどを拡張する際、誤検知が発生しそうな名称が設定されている場合はエラーにする機能を追加 ([#80](https://github.com/kufu/eslint-plugin-smarthr/issues/80)) ([727ff3f](https://github.com/kufu/eslint-plugin-smarthr/commit/727ff3fc6116fca017f8c3a3e62af569b76863da))

### [0.3.9](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.8...v0.3.9) (2023-09-04)


### Features

* `new Date("YYYY/MM/DD")` のように日付文字列を直接設定している場合 `new Date(YYYY, MM - 1, DD)` に置き換えるfixerを追加 ([#76](https://github.com/kufu/eslint-plugin-smarthr/issues/76)) ([16a689a](https://github.com/kufu/eslint-plugin-smarthr/commit/16a689a6fe9ef240baaf66bcac08992328a64c4e))

### [0.3.8](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.7...v0.3.8) (2023-09-01)


### Features

* a11y-anchor-has-href-attribute の next, react-router-dom用オプションをpackage.jsonを解析して自動設定するように修正 ([#71](https://github.com/kufu/eslint-plugin-smarthr/issues/71)) ([8321433](https://github.com/kufu/eslint-plugin-smarthr/commit/832143385dd92bfd6fe45acd959038deea5cd1fe))
* a11y-anchor-has-href-attributeをhref="" や href="#" の場合、エラーとなるように修正 ([#75](https://github.com/kufu/eslint-plugin-smarthr/issues/75)) ([738ab65](https://github.com/kufu/eslint-plugin-smarthr/commit/738ab6598111dcf573a35d24f9d1baeda0506b4f))

### [0.3.7](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.6...v0.3.7) (2023-08-24)


### Features

* a11y-clickable-element-has-text のチェック時、リンク内部に名称の末尾がTextがつくコンポーネントがある場合、チェックを通過するように修正 ([#69](https://github.com/kufu/eslint-plugin-smarthr/issues/69)) ([182b5d5](https://github.com/kufu/eslint-plugin-smarthr/commit/182b5d5e52c1faee26011572c48271e4c03512e1))

### [0.3.6](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.5...v0.3.6) (2023-08-20)


### Features

* .eslintrc.js などの設定からparserOptions.project が設定されている場合、tsconfig.jsonの読み込み先を変更する ([#68](https://github.com/kufu/eslint-plugin-smarthr/issues/68)) ([3897faf](https://github.com/kufu/eslint-plugin-smarthr/commit/3897fafbf3bf8ccdc42a06700ff832ec97dc7ff1))

### [0.3.5](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.4...v0.3.5) (2023-07-28)


### Bug Fixes

* a11y-heading-in-sectioning-content で Heading系コンポーネントの拡張をexportしている場合、正しく除外されないバグを修正 ([#67](https://github.com/kufu/eslint-plugin-smarthr/issues/67)) ([a4b8e6d](https://github.com/kufu/eslint-plugin-smarthr/commit/a4b8e6d1081b1e96ad574153805f86d5f7551c5e))

### [0.3.4](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.3...v0.3.4) (2023-07-18)


### Features

* a11y-heading-in-sectioning-content を smarthr-ui/PageHeading に対応させる ([#66](https://github.com/kufu/eslint-plugin-smarthr/issues/66)) ([5abc13c](https://github.com/kufu/eslint-plugin-smarthr/commit/5abc13c73f57242fbe8b6016bc6e598fd0403f1c))

### [0.3.3](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.2...v0.3.3) (2023-07-10)


### Bug Fixes

* a11y-heading-in-sectioning-contentのHeadingアウトライン未指定の誤検知を修正する ([#65](https://github.com/kufu/eslint-plugin-smarthr/issues/65)) ([2cbf6aa](https://github.com/kufu/eslint-plugin-smarthr/commit/2cbf6aaff61f7846a80a895ed4e5e63ff9674c87))

### [0.3.2](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.1...v0.3.2) (2023-07-07)


### Features

* a11y-heading-in-sectioning-contentを追加 ([#64](https://github.com/kufu/eslint-plugin-smarthr/issues/64)) ([49dc559](https://github.com/kufu/eslint-plugin-smarthr/commit/49dc5591e50ae4b3e496e69faca061c2ca2ca579))


### Bug Fixes

* replacePathsの生成時、tsconfigにcompilerOptions.pathsが設定されていなければエラーになるように修正 ([#63](https://github.com/kufu/eslint-plugin-smarthr/issues/63)) ([cbb4306](https://github.com/kufu/eslint-plugin-smarthr/commit/cbb43061482d5f363c20ca1316aae9e62f2359fa))

### [0.3.1](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.3.0...v0.3.1) (2023-05-12)

## [0.3.0](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.25...v0.3.0) (2023-04-14)


### ⚠ BREAKING CHANGES

* best-practice-for-remote-trigger-dialog にリネーム & 特定パターンでバグが起きる問題を修正する (#61)

### Bug Fixes

* best-practice-for-remote-trigger-dialog にリネーム & 特定パターンでバグが起きる問題を修正する ([#61](https://github.com/kufu/eslint-plugin-smarthr/issues/61)) ([0ad3601](https://github.com/kufu/eslint-plugin-smarthr/commit/0ad3601caa941946a0f30aacc2f010cd478b6133))

### [0.2.25](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.24...v0.2.25) (2023-04-04)


### Features

* best-practice-for-remote-trigger-action-dialog ルールを追加 ([#60](https://github.com/kufu/eslint-plugin-smarthr/issues/60)) ([d2bbeef](https://github.com/kufu/eslint-plugin-smarthr/commit/d2bbeeff4d2f48133b2b44f956985cf18aae9800))

### [0.2.24](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.23...v0.2.24) (2023-03-10)


### Features

* next.js, react-routerのLinkコンポーネントに対応するオプションを追加 ([#59](https://github.com/kufu/eslint-plugin-smarthr/issues/59)) ([88996e8](https://github.com/kufu/eslint-plugin-smarthr/commit/88996e88dfd4c14bfaaa36594663737d47f1f029))

### [0.2.23](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.22...v0.2.23) (2023-03-09)

### [0.2.22](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.21...v0.2.22) (2023-01-27)


### Features

* a11y-anchor-has-href-attribute を追加 ([#57](https://github.com/kufu/eslint-plugin-smarthr/issues/57)) ([83856b1](https://github.com/kufu/eslint-plugin-smarthr/commit/83856b18907772828b69de70c30315b3ff4986c1))

### [0.2.21](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.20...v0.2.21) (2023-01-19)


### Features

* a11y系ruleのコンポーネント名チェックが漏れているパターンが存在したため調整 ([#56](https://github.com/kufu/eslint-plugin-smarthr/issues/56)) ([e628426](https://github.com/kufu/eslint-plugin-smarthr/commit/e628426596e97548580780632046c2154583af3e))

### [0.2.20](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.19...v0.2.20) (2023-01-18)


### Features

* a11y-input-has-name-attribute を DropZoneも対象になるように修正 ([#55](https://github.com/kufu/eslint-plugin-smarthr/issues/55)) ([73c30ce](https://github.com/kufu/eslint-plugin-smarthr/commit/73c30ce350e69c72e00112994a3cbe9cbbcfc52c))

### [0.2.19](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.18...v0.2.19) (2023-01-17)


### Features

* a11y-input-has-name-attributeの対象となるコンポーネントを追加(InputFile, CheckBox, ComboBox, DatePicker) ([ed14952](https://github.com/kufu/eslint-plugin-smarthr/commit/ed14952996902e9d2e4c7deb7b5107e7a57b41d6))

### [0.2.18](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.17...v0.2.18) (2023-01-15)


### Features

* redundant-name にignores オプションを追加 ([#53](https://github.com/kufu/eslint-plugin-smarthr/issues/53)) ([638ed8f](https://github.com/kufu/eslint-plugin-smarthr/commit/638ed8fe6aad0b246ff13630359b60eb34ec4012))


### Bug Fixes

* ディレクトリの削除もれ対応 ([#52](https://github.com/kufu/eslint-plugin-smarthr/issues/52)) ([afefcae](https://github.com/kufu/eslint-plugin-smarthr/commit/afefcaef7dbd52daf6dac2c095d0c58c56cbbed5))

### [0.2.17](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.15...v0.2.17) (2023-01-12)


### Features

* a11y-radio-has-name-attributeをinput, select, textareaに対してname属性を必須にするルール a11y-input-has-name-attribute に変更する ([#50](https://github.com/kufu/eslint-plugin-smarthr/issues/50)) ([f278bf8](https://github.com/kufu/eslint-plugin-smarthr/commit/f278bf8f094dab8b01b492ca24444f5ab3812b09))
* ラジオボタンにnameを強制するルールを追加 ([97792cf](https://github.com/kufu/eslint-plugin-smarthr/commit/97792cf276e3400cb6e01a01ef4cf104de5db190))


### Bug Fixes

* no-import-other-domain、require-barrel-import でignoresオプションを指定するとエラーが発生する問題を修正する ([#49](https://github.com/kufu/eslint-plugin-smarthr/issues/49)) ([8526236](https://github.com/kufu/eslint-plugin-smarthr/commit/85262365d105c1afa4fd53662825c4c51cb84531))
* prohibit-path-within-template-literalのpathオブジェクト名の解析の際、エラーになるパターンがあったため修正する ([#48](https://github.com/kufu/eslint-plugin-smarthr/issues/48)) ([715e485](https://github.com/kufu/eslint-plugin-smarthr/commit/715e485f3679e4ca2eb9675b67b8f452f9707096))

### [0.2.16](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.15...v0.2.16) (2022-12-21)


### Features

* ラジオボタンにnameを強制するルールを追加 ([97792cf](https://github.com/kufu/eslint-plugin-smarthr/commit/97792cf276e3400cb6e01a01ef4cf104de5db190))


### Bug Fixes

* no-import-other-domain、require-barrel-import でignoresオプションを指定するとエラーが発生する問題を修正する ([#49](https://github.com/kufu/eslint-plugin-smarthr/issues/49)) ([8526236](https://github.com/kufu/eslint-plugin-smarthr/commit/85262365d105c1afa4fd53662825c4c51cb84531))
* prohibit-path-within-template-literalのpathオブジェクト名の解析の際、エラーになるパターンがあったため修正する ([#48](https://github.com/kufu/eslint-plugin-smarthr/issues/48)) ([715e485](https://github.com/kufu/eslint-plugin-smarthr/commit/715e485f3679e4ca2eb9675b67b8f452f9707096))

### [0.2.15](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.12...v0.2.15) (2022-12-15)


### Features

* add prohibit-path-within-template-literal rule. ([#46](https://github.com/kufu/eslint-plugin-smarthr/issues/46)) ([1ea51a9](https://github.com/kufu/eslint-plugin-smarthr/commit/1ea51a95f0720e34729959dbc27b33a91ec2d73e))
* ignores option for no-import-other-domain and require-barrel-import ([#45](https://github.com/kufu/eslint-plugin-smarthr/issues/45)) ([559fdcf](https://github.com/kufu/eslint-plugin-smarthr/commit/559fdcf9d075e5fe29a48ab2f2d4f1e5d1a33201))


### Bug Fixes

* redundant-nameのarrowedNameなどで利用するファイルパスが削られすぎていたため、指定が行いにくい問題を修正する ([#43](https://github.com/kufu/eslint-plugin-smarthr/issues/43)) ([6de9618](https://github.com/kufu/eslint-plugin-smarthr/commit/6de961831a9f9e0e93eeeebb80e56ecb60d9a2ff))

### [0.2.14](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.13...v0.2.14) (2022-12-13)

### Features
* trim-propsルールを追加 ([#44](https://github.com/kufu/eslint-plugin-smarthr/pull/44))

### [0.2.13](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.12...v0.2.13) (2022-12-07)


### Bug Fixes

* redundant-nameのarrowedNameなどで利用するファイルパスが削られすぎていたため、指定が行いにくい問題を修正する ([#43](https://github.com/kufu/eslint-plugin-smarthr/issues/43)) ([6de9618](https://github.com/kufu/eslint-plugin-smarthr/commit/6de961831a9f9e0e93eeeebb80e56ecb60d9a2ff))

### [0.2.12](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.11...v0.2.12) (2022-12-07)


### Bug Fixes

* ファイルが複数の.を保つ場合（例 xxx.test.tsx）正常に動作しないバグを修正する ([#42](https://github.com/kufu/eslint-plugin-smarthr/issues/42)) ([23eb5b5](https://github.com/kufu/eslint-plugin-smarthr/commit/23eb5b51039085d3239adca42c65395b81869f9d))

### [0.2.11](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.10...v0.2.11) (2022-12-07)


### Bug Fixes

* redundant-nameの省略文字列がファイルパスによって正常に生成できないバグを修正 ([49eb1d9](https://github.com/kufu/eslint-plugin-smarthr/commit/49eb1d9ad1e9c153b7cb150190a81e5fae6bedf6))

### [0.2.10](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.9...v0.2.10) (2022-11-22)

### Features

* a11y-prohibit-input-placeholder を最新のComboBoxに対応させる ([#39](https://github.com/kufu/eslint-plugin-smarthr/issues/39)) ([682281c](https://github.com/kufu/eslint-plugin-smarthr/pull/39/commits/682281cd0f6ed73b4ec1295f34680bd9576ba831))
* placeholder禁止対象にdate pickerが含まれていなかったため対応 ([#39](https://github.com/kufu/eslint-plugin-smarthr/issues/39)) ([abf89f0](https://github.com/kufu/eslint-plugin-smarthr/pull/39/commits/abf89f0fe5a88b4d03fdbd0e1ed344bae1c6397a))


### Bug Fixes

* a11y-image-has-alt-attribute が svg > image を誤検知してしまうバグを修正する ([#40](https://github.com/kufu/eslint-plugin-smarthr/issues/40)) ([1f21879](https://github.com/kufu/eslint-plugin-smarthr/commit/1f21879a0309bfec15cfa186db4f6203cd80cc14))

### [0.2.9](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.8...v0.2.9) (2022-10-19)


### Features

* a11y-prohibit-input-placeholder を SearchInputに対応させる ([#38](https://github.com/kufu/eslint-plugin-smarthr/issues/38)) ([60de76b](https://github.com/kufu/eslint-plugin-smarthr/commit/60de76b58731436fe924a8a99da2242404141381))
* add require-declaration rule ([#34](https://github.com/kufu/eslint-plugin-smarthr/issues/34)) ([5dc6d44](https://github.com/kufu/eslint-plugin-smarthr/commit/5dc6d444e63f452f933bf6937207cfe23787732f))
* placeholder非推奨の対象に FieldSet, ComboBox も含める ([#35](https://github.com/kufu/eslint-plugin-smarthr/issues/35)) ([0e8d1d0](https://github.com/kufu/eslint-plugin-smarthr/commit/0e8d1d03377476fbd58adce17455e96533db69fa))


### Bug Fixes

* a11y-clickable-element-has-textのバグを修正する ([#36](https://github.com/kufu/eslint-plugin-smarthr/issues/36)) ([4efc23d](https://github.com/kufu/eslint-plugin-smarthr/commit/4efc23d33ba6eec2c454b323f561de3f7a678fab))

### [0.2.8](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.7...v0.2.8) (2022-10-05)


### Bug Fixes

* チェックするファイルのdirを取得するロジックから正規表現を取り除く ([#33](https://github.com/kufu/eslint-plugin-smarthr/issues/33)) ([c89548e](https://github.com/kufu/eslint-plugin-smarthr/commit/c89548e465e1f5aec49c6e1fc3b66c5bfefa6281))

### [0.2.7](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.5...v0.2.7) (2022-10-03)


### Features

* add a11y-prohibit-input-placeholder rule. ([#32](https://github.com/kufu/eslint-plugin-smarthr/issues/32)) ([a6033b9](https://github.com/kufu/eslint-plugin-smarthr/commit/a6033b94ba4f4c014caab0746ab151331e45daf0))
* 修正しなければ問題が起きる可能性があるruleのmeta.typeをproblemに修正 ([#31](https://github.com/kufu/eslint-plugin-smarthr/issues/31)) ([e3980e5](https://github.com/kufu/eslint-plugin-smarthr/commit/e3980e5dd226f229aa21c57b81dd2460b9b0d8c9))

### [0.2.6](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.5...v0.2.6) (2022-09-08)

### Features

* 修正しなければ問題が起きる可能性があるruleのmeta.typeをproblemに修正 ([#31](https://github.com/kufu/eslint-plugin-smarthr/pull/31))

### [0.2.5](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.4...v0.2.5) (2022-09-08)


### Bug Fixes

* require-import, prohibit-import: report message の一部でテンプレート文字列がそのまま出力されてしまう事があるバグを修正 ([#29](https://github.com/kufu/eslint-plugin-smarthr/issues/29)) ([b805f90](https://github.com/kufu/eslint-plugin-smarthr/commit/b805f90cd39b1aa4b95cbfbd983c5ff1c61f8afe))
* 画像系コンポーネントが代替テキスト属性を持つかチェックする際にエラーになるパターンを修正 ([#30](https://github.com/kufu/eslint-plugin-smarthr/issues/30)) ([bcd1044](https://github.com/kufu/eslint-plugin-smarthr/commit/bcd1044d7532531015a279520ed8eda582227492))

### [0.2.4](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.3...v0.2.4) (2022-08-30)


### Features

* ruleを更新する ([#27](https://github.com/kufu/eslint-plugin-smarthr/issues/27)) ([1ec7783](https://github.com/kufu/eslint-plugin-smarthr/commit/1ec7783395c9dafa547c453724f3671df489997b))

### [0.2.3](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.2...v0.2.3) (2022-08-26)


### Bug Fixes

* a11y-xxxx: styled(Hoge)の実行結果を変数に代入しないパターンに対応する ([#26](https://github.com/kufu/eslint-plugin-smarthr/issues/26)) ([0bb0259](https://github.com/kufu/eslint-plugin-smarthr/commit/0bb02595a3be35802c1fe8bc41011fd1e55bf319))

### [0.2.2](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.1...v0.2.2) (2022-08-18)


### Bug Fixes

* redundant-name rule の allowedNames オプションが適用されないバグがあったため修正する ([#23](https://github.com/kufu/eslint-plugin-smarthr/issues/23)) ([86a7bc5](https://github.com/kufu/eslint-plugin-smarthr/commit/86a7bc548398261885f31c75b56d8edffe5017c3))

### [0.2.1](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.2.0...v0.2.1) (2022-08-15)


### Features

* 新しいルールの追加 (require-export, prohibit-file-name, prohibit-export-array-type, best-practice-for-date ) ([#22](https://github.com/kufu/eslint-plugin-smarthr/issues/22)) ([ddb7433](https://github.com/kufu/eslint-plugin-smarthr/commit/ddb7433c0f26d64043cdcec353143240eceeccee))

### [0.2.0](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.1.2...v0.2.0) (2022-07-05)

### ⚠ BREAKING CHANGES

* BREAKING CHANGE: a11-xxxx-has-text を a11-clickable-element-has-text に統一する ([#16](https://github.com/kufu/eslint-plugin-smarthr/pull/16)


### [0.1.3](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.1.2...v0.1.3) (2022-07-05)


### Features

* add rules format-translate-component ([#19](https://github.com/kufu/eslint-plugin-smarthr/issues/19)) ([a429e9e](https://github.com/kufu/eslint-plugin-smarthr/commit/a429e9ef31779deb8f08499cfb8cbf00322c58b8))
* リンク要素内にテキストが設定されていない場合、エラーとなるルールを追加する ([#15](https://github.com/kufu/eslint-plugin-smarthr/issues/15)) ([4bbb9c1](https://github.com/kufu/eslint-plugin-smarthr/commit/4bbb9c1204a8edd068fabcdca497d94ecc1db4a4))


### Bug Fixes

* redundant-nameのバグを修正する ([#20](https://github.com/kufu/eslint-plugin-smarthr/issues/20)) ([b733f18](https://github.com/kufu/eslint-plugin-smarthr/commit/b733f1835293c3b478f6d9bb3ebe944041c67038))

### [0.1.2](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.1.1...v0.1.2) (2022-03-09)


### Bug Fixes

* require-barrel-import修正（barrelファイルが複数存在する場合、一番親に当たるファイルを検知する） ([#14](https://github.com/kufu/eslint-plugin-smarthr/issues/14)) ([87a6724](https://github.com/kufu/eslint-plugin-smarthr/commit/87a67240f31c9408faad6784741bbf6a2f7ef47b))

### [0.1.1](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.1.0...v0.1.1) (2022-03-08)


### Features

* add require-barrel-import rule ([#13](https://github.com/kufu/eslint-plugin-smarthr/issues/13)) ([79ee88d](https://github.com/kufu/eslint-plugin-smarthr/commit/79ee88d355e01bb8344dc95bd65157e2fbcf916e))

## [0.1.0](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.0.1...v0.1.0) (2022-02-09)


### ⚠ BREAKING CHANGES

* BREAKING CHANGE: add require-import & update prohibit-import (#12) ([e6c5c44](https://github.com/kufu/eslint-plugin-smarthr/commit/e6c5c445a21620d4b796ded00a685e5da367c7bb)), closes [#12](https://github.com/kufu/eslint-plugin-smarthr/issues/12)

### [0.0.1](https://github.com/kufu/eslint-plugin-smarthr/compare/v0.0.0...v0.0.1) (2022-02-08)


### Features

* add type property function params redundant ([758df90](https://github.com/kufu/eslint-plugin-smarthr/commit/758df90f89bd27dd589aeeb55165e27c8e072b08))
* redundant-name の修正候補を操作できるように改修 ([20991e8](https://github.com/kufu/eslint-plugin-smarthr/commit/20991e874890556e84e7c682e789e4b2650a85b0))


## 0.0.0 (2022-01-25)


### Features

* LICENSE を追加 ([6497921](https://github.com/kufu/eslint-plugin-smarthr/commit/64979217ce4223d0a1a32981cf7c74ddbfec06ba))
* リリース用の処理を追加 ([c606864](https://github.com/kufu/eslint-plugin-smarthr/commit/c60686471044b7f0cbc6218f3609236819da22fb))


### Bug Fixes

* fs と path は node のデフォルトの物を使うべきなので dependencies から削除 ([979a4f4](https://github.com/kufu/eslint-plugin-smarthr/commit/979a4f430663defda37aacc829dd7d32a6d1b5a5))
* jsx-start-with-spread-attributes ([3936797](https://github.com/kufu/eslint-plugin-smarthr/commit/393679761ded4d45dee7eb5783b60db804889727))
* node_modules を gitignore ([bcfb637](https://github.com/kufu/eslint-plugin-smarthr/commit/bcfb63718e02c31d0459dfeb6e689b0c2f27820d))
* process.env.PWD -> process.cwd() ([1368464](https://github.com/kufu/eslint-plugin-smarthr/commit/13684649eeda1d50f4b940c4891a0b44f32a12ee))
* redundant-nameのdisabled周りのバグを修正 ([93ff112](https://github.com/kufu/eslint-plugin-smarthr/commit/93ff112a83328539ff8ec4738e48164144a973b5))
* リリースに向けて package.json 上の不要な記述を削除 ([29e4e44](https://github.com/kufu/eslint-plugin-smarthr/commit/29e4e440236fb07ccefb607c4c7b359ec6267f35))
