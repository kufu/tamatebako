const rule = require('../rules/a11y-input-in-form-control')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})
const noLabeledInput = (name) => `${name} を、smarthr-ui/FormControl もしくはそれを拡張したコンポーネントが囲むようマークアップを変更してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - FormControlで入力要素を囲むことでラベルと入力要素が適切に紐づき、操作性が高まります
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FormControlのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)
 - ${name}が入力要素とラベル・タイトル・説明など含む概念を表示するコンポーネントの場合、コンポーネント名を/(Form(Control|Group)|(F|^f)ieldset)$/とマッチするように修正してください
 - ${name}が入力要素自体を表現するコンポーネントの一部である場合、ルートとなるコンポーネントの名称を/(RadioButton(Panel)?(s)?|Check(B|b)ox(es|s)?|(Search)?(I|^i)nput(File)?|(T|^t)extarea|(S|^s)elect|Combo(B|b)ox|(Date|Wareki|Time)Picker)$/とマッチするように修正してください`
const noLabeledSelect = (name) => `${name} を、smarthr-ui/FormControl もしくはそれを拡張したコンポーネントが囲むようマークアップを変更してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - FormControlで入力要素を囲むことでラベルと入力要素が適切に紐づき、操作性が高まります
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FormControlのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)
 - ${name}が入力要素とラベル・タイトル・説明など含む概念を表示するコンポーネントの場合、コンポーネント名を/(Form(Control|Group)|(F|^f)ieldset)$/とマッチするように修正してください
 - ${name}が入力要素自体を表現するコンポーネントの一部である場合、ルートとなるコンポーネントの名称を/(RadioButton(Panel)?(s)?|Check(B|b)ox(es|s)?|(Search)?(I|^i)nput(File)?|(T|^t)extarea|(S|^s)elect|Combo(B|b)ox|(Date|Wareki|Time)Picker)$/とマッチするように修正してください`
const invalidPureCheckboxInFormControl = (name) => `HogeFormControl が ${name} を含んでいます。smarthr-ui/FormControl を smarthr-ui/Fieldset に変更し、正しくグルーピングされるように修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - 可能なら${name}はsmarthr-ui/Checkboxへの変更を検討してください。難しい場合は ${name} と結びつくlabel要素が必ず存在するよう、マークアップする必要があることに注意してください。`
const invalidCheckboxInFormControl = (name) => `HogeFormControl が ${name} を含んでいます。smarthr-ui/FormControl を smarthr-ui/Fieldset に変更し、正しくグルーピングされるように修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control`
const invalidPureRadioInFormControl = (name) => `HogeFormControl が ${name} を含んでいます。smarthr-ui/FormControl を smarthr-ui/Fieldset に変更し、正しくグルーピングされるように修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - Fieldsetで同じname属性のラジオボタン全てを囲むことで正しくグループ化され、適切なタイトル・説明を追加出来ます
 - 可能なら${name}はsmarthr-ui/RadioButton、smarthr-ui/RadioButtonPanelへの変更を検討してください。難しい場合は ${name} と結びつくlabel要素が必ず存在するよう、マークアップする必要があることに注意してください。`
const invalidRadioInFormControl = (name) => `HogeFormControl が ${name} を含んでいます。smarthr-ui/FormControl を smarthr-ui/Fieldset に変更し、正しくグルーピングされるように修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - Fieldsetで同じname属性のラジオボタン全てを囲むことで正しくグループ化され、適切なタイトル・説明を追加出来ます`
const invalidMultiInputsInFormControl = () => `HogeFormControl が複数の入力要素を含んでいます。ラベルと入力要素の紐づけが正しく行われない可能性があるため、以下の方法のいずれかで修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - 方法1: 郵便番号や電話番号など、本来一つの概念の入力要素を分割して複数の入力要素にしている場合、一つの入力要素にまとめることを検討してください
   - コピーアンドペーストがしやすくなる、ブラウザの自動補完などがより適切に反映されるなど多大なメリットがあります
 - 方法2: HogeFormControlをsmarthr-ui/Fieldset、もしくはそれを拡張したコンポーネントに変更した上で、入力要素を一つずつsmarthr-ui/FormControlで囲むようにマークアップを変更してください
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FormControlのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)
 - 方法3: HogeFormControl が smarthr-ui/FormControl、もしくはそれを拡張しているコンポーネントではない場合、名称を /(Form(Control|Group)|(F|^f)ieldset)$/ にマッチしないものに変更してください`
const noLabeledInputInFieldset = (name) => `HogeFieldset が ラベルを持たない入力要素(${name})を含んでいます。入力要素が何であるかを正しく伝えるため、以下の方法のいずれかで修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - 方法1: HogeFieldset を smarthr-ui/FormControl、もしくはそれを拡張したコンポーネントに変更してください
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FormControlのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)
 - 方法2: ${name} がlabel要素を含むコンポーネントである場合、名称を/(Form(Control|Group))$/にマッチするものに変更してください
   - smarthr-ui/FormControl、smarthr-ui/FormGroup はlabel要素を内包しています
 - 方法3: ${name} がRadioButton、もしくはCheckboxを表すコンポーネントの場合、名称を/(RadioButton(Panel)?(s)?|Check(B|b)ox(es|s)?)$/にマッチするものに変更してください
   - smarthr-ui/RadioButton、smarthr-ui/RadioButtonPanel、smarthr-ui/Checkbox はlabel要素を内包しています
 - 方法4: HogeFieldset が smarthr-ui/Fieldset、もしくはそれを拡張しているコンポーネントではない場合、名称を /Fieldset$/ にマッチしないものに変更してください
 - 方法5: 別途label要素が存在し、それらと紐づけたい場合はlabel要素のhtmlFor属性、${name}のid属性に同じ文字列を指定してください。この文字列はhtml内で一意である必要があります`
const noLabeledInputInFieldsetWithSelect = (name) => `HogeFieldset が ラベルを持たない入力要素(${name})を含んでいます。入力要素が何であるかを正しく伝えるため、以下の方法のいずれかで修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - 方法1: HogeFieldset を smarthr-ui/FormControl、もしくはそれを拡張したコンポーネントに変更してください
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FormControlのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)
 - 方法2: ${name} がlabel要素を含むコンポーネントである場合、名称を/(Form(Control|Group))$/にマッチするものに変更してください
   - smarthr-ui/FormControl、smarthr-ui/FormGroup はlabel要素を内包しています
 - 方法3: ${name} がRadioButton、もしくはCheckboxを表すコンポーネントの場合、名称を/(RadioButton(Panel)?(s)?|Check(B|b)ox(es|s)?)$/にマッチするものに変更してください
   - smarthr-ui/RadioButton、smarthr-ui/RadioButtonPanel、smarthr-ui/Checkbox はlabel要素を内包しています
 - 方法4: HogeFieldset が smarthr-ui/Fieldset、もしくはそれを拡張しているコンポーネントではない場合、名称を /Fieldset$/ にマッチしないものに変更してください
 - 方法5: 別途label要素が存在し、それらと紐づけたい場合はlabel要素のhtmlFor属性、${name}のid属性に同じ文字列を指定してください。この文字列はhtml内で一意である必要があります`
const useFormControlInsteadOfSection = (name, section) => `${name}は${section}より先に、smarthr-ui/FormControlが入力要素を囲むようマークアップを以下のいずれかの方法で変更してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - 方法1: ${section} をFormControl、もしくはそれを拡張したコンポーネントに変更してください
   - ${section} 内のHeading要素はFormControlのtitle属性に変更してください
 - 方法2: ${section} と ${name} の間に FormControl が存在するようにマークアップを変更してください
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FormControlのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)
 - 方法3: 別途label要素が存在し、それらと紐づけたい場合はlabel要素のhtmlFor属性、${name}のid属性に同じ文字列を指定してください。この文字列はhtml内で一意である必要があります`
const useFormControlInsteadOfSectionInRadio = (name, section) => `${name}は${section}より先に、smarthr-ui/Fieldsetが入力要素を囲むようマークアップを以下のいずれかの方法で変更してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - 方法1: ${section} をFieldset、もしくはそれを拡張したコンポーネントに変更してください
   - ${section} 内のHeading要素はFieldsetのtitle属性に変更してください
 - 方法2: ${section} と ${name} の間に Fieldset が存在するようにマークアップを変更してください
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FieldsetのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)`
const invalidFieldsetHasRoleGroup = (fieldset, base) => `${fieldset}に 'role="group" が設定されています。${base} をつかってマークアップする場合、'role="group"' は不要です
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - ${fieldset} が ${base}、もしくはそれを拡張しているコンポーネントではない場合、名称を /(Form(Control|Group)|(F|^f)ieldset)$/ にマッチしないものに変更してください`
const invalidChildreninFormControl = (children) => `FormControl が、${children} を子要素として持っており、マークアップとして正しくない状態になっています。以下のいずれかの方法で修正を試みてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - 方法1: 親要素であるFormControlをsmarthr-ui/FormControl、もしくはそれを拡張していないコンポーネントでマークアップしてください
   - FormControlではなく、smarthr-ui/Fieldset、もしくはsmarthr-ui/Section + smarthr-ui/Heading などでのマークアップを検討してください
 - 方法2: 親要素であるFormControlがsmarthr-ui/FormControlを拡張したコンポーネントではない場合、コンポーネント名を/(Form(Control|Group))$/と一致しない名称に変更してください`
const requireMultiInputInFormControlWithRoleGroup = () => `HogeFormControl内に入力要素が2個以上存在しないため、'role=\"group\"'を削除してください。'role=\"group\"'は複数の入力要素を一つのグループとして扱うための属性です。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control
 - HogeFormControl内に2つ以上の入力要素が存在する場合、入力要素を含むコンポーネント名全てを/(RadioButton(Panel)?(s)?|Check(B|b)ox(es|s)?|(Search)?(I|^i)nput(File)?|(T|^t)extarea|(S|^s)elect|Combo(B|b)ox|(Date|Wareki|Time)Picker)$/、もしくは/(Form(Control|Group)|(F|^f)ieldset)$/にマッチする名称に変更してください`

ruleTester.run('a11y-input-in-form-control', rule, {
  valid: [
    { code: '<input type="hidden" />' },
    { code: '<HogeFormGroup />' },
    { code: '<HogeFormControl />' },
    { code: '<HogeFieldset />' },
    { code: '<HogeFormGroup><input /></HogeFormGroup>' },
    { code: '<HogeFormGroup><input title="any" /></HogeFormGroup>' },
    { code: '<HogeFormGroup><Input type="checkbox" /></HogeFormGroup>' },
    { code: '<HogeFormGroup><CheckBox /></HogeFormGroup>' },
    { code: '<HogeFormControl><HogeSelect /></HogeFormControl>' },
    { code: '<HogeFormControl><HogeComboBox title="any" /></HogeFormControl>' },
    { code: '<HogeFieldset><Input type="checkbox" /><Input type="checkbox" /></HogeFieldset>' },
    { code: '<HogeFieldset><HogeCheckBox /><HogeCheckBox /></HogeFieldset>' },
    { code: '<HogeFieldset><input type="radio" /></HogeFieldset>' },
    { code: '<HogeFieldset><RadioButton /></HogeFieldset>' },
    { code: '<HogeFieldset><HogeRadioButtonPanel /></HogeFieldset>' },
    { code: '<FugaSection><HogeFormControl><HogeInput /></HogeFormControl></FugaSection>' },
    { code: '<Stack as="section"><HogeFormControl><HogeInput /></HogeFormControl></Stack>' },
    { code: `const AnyComboBox = () => <input />` },
    { code: `export const AnyComboBox = () => <input />` },
    { code: `function AnySingleCombobox() { return <SingleCombobox /> }` },
    { code: `export function AnySingleCombobox() { return <SingleCombobox /> }` },
    { code: `<Fieldset><HogeFieldset /><HogeFormControl /></Fieldset>` },
    { code: '<HogeFieldset><HogeCheckBox /><HogeInput id="any" /></HogeFieldset>' },
    { code: '<FugaSection><HogeInput id="any" /></FugaSection>' },
    { code: '<HogeTextarea id="any" />' },
    { code: '<Fieldset><HogeRadioButtons /></Fieldset>' },
    { code: '<Fieldset><HogeRadioButtonPanels /></Fieldset>' },
    { code: '<Fieldset><HogeCheckBoxs /></Fieldset>' },
    { code: '<Fieldset><HogeCheckBoxes /></Fieldset>' },
    { code: '<HogeFormControl>{ dateInput ? <DateInput /> : <Input /> }</HogeFormControl>'},
    { code: '<Input aria-label="hoge" />' },
    { code: '<Select aria-labelledby="hoge" />' },
  ],
  invalid: [
    { code: `<input />`, errors: [ { message: noLabeledInput('input') } ] },
    { code: `<HogeInput />`, errors: [ { message: noLabeledInput('HogeInput') } ] },
    { code: '<textarea />', errors: [ { message: noLabeledInput('textarea') } ] },
    { code: '<HogeTextarea />', errors: [ { message: noLabeledInput('HogeTextarea') } ] },
    { code: '<select />', errors: [ { message: noLabeledSelect('select') } ] },
    { code: '<HogeSelect />', errors: [ { message: noLabeledSelect('HogeSelect') } ] },
    { code: '<HogeInputFile />', errors: [ { message: noLabeledInput('HogeInputFile') } ] },
    { code: '<HogeCombobox />', errors: [ { message: noLabeledInput('HogeCombobox') } ] },
    { code: '<HogeCombobox inputAttributes={{ any }} />', errors: [ { message: noLabeledInput('HogeCombobox') } ] },
    { code: '<HogeDatePicker />', errors: [ { message: noLabeledInput('HogeDatePicker') } ] },
    { code: '<HogeWarekiPicker />', errors: [ { message: noLabeledInput('HogeWarekiPicker') } ] },
    { code: '<HogeFormControl><Input type="checkbox" /><Input type="checkbox" /></HogeFormControl>', errors: [ { message: invalidPureCheckboxInFormControl('Input') } ] },
    { code: '<HogeFormControl><HogeCheckBox /><Input /></HogeFormControl>', errors: [ { message: invalidMultiInputsInFormControl() } ] },
    { code: '<HogeFormControl><HogeCheckBox /><HogeCheckBox /></HogeFormControl>', errors: [ { message: invalidCheckboxInFormControl('HogeCheckBox') } ] },
    { code: '<HogeFormControl><input type="radio" /></HogeFormControl>', errors: [ { message: invalidPureRadioInFormControl('input') } ] },
    { code: '<HogeFormControl><RadioButton /></HogeFormControl>', errors: [ { message: invalidRadioInFormControl('RadioButton') } ] },
    { code: '<HogeFormControl><HogeRadioButtonPanel /></HogeFormControl>', errors: [ { message: invalidRadioInFormControl('HogeRadioButtonPanel') } ] },
    { code: '<HogeFieldset><HogeCheckBox /><HogeInput /></HogeFieldset>', errors: [ { message: noLabeledInputInFieldset('HogeInput') } ] },
    { code: '<HogeFieldset><HogeCheckBox /><HogeSelect /></HogeFieldset>', errors: [ { message: noLabeledInputInFieldsetWithSelect('HogeSelect') } ] },
    { code: '<FugaSection><HogeInput /></FugaSection>', errors: [ { message: useFormControlInsteadOfSection('HogeInput', 'FugaSection') } ] },
    { code: '<Stack as="section"><HogeInput /></Stack>', errors: [ { message: useFormControlInsteadOfSection('HogeInput', '<Stack as="section">') } ] },
    { code: '<Center forwardedAs="aside"><HogeInput /></Center>', errors: [ { message: useFormControlInsteadOfSection('HogeInput', '<Center forwardedAs="aside">') } ] },
    { code: '<FugaSection><HogeRadioButton /></FugaSection>', errors: [ { message: useFormControlInsteadOfSectionInRadio('HogeRadioButton', 'FugaSection') } ] },
    { code: `const AnyHoge = () => <input />`, errors: [ { message: noLabeledInput('input') } ] },
    { code: '<HogeFieldset role="group"><HogeFormControl /><HogeRadioButton /></HogeFieldset>', errors: [ { message: invalidFieldsetHasRoleGroup('HogeFieldset', 'smarthr-ui/Fieldset') } ] },
    { code: '<fieldset role="group"><HogeFormControl /><HogeRadioButton /></fieldset>', errors: [ { message: invalidFieldsetHasRoleGroup('fieldset', 'fieldset') } ] },
    { code: '<FormControl><HogeFieldset /></FormControl>', errors: [ { message: invalidChildreninFormControl('HogeFieldset') } ] },
    { code: '<FormControl><HogeFormControl /></FormControl>', errors: [ { message: invalidChildreninFormControl('HogeFormControl') } ] },
    { code: '<HogeFormControl role="group"><HogeInput /></HogeFormControl>', errors: [ { message: requireMultiInputInFormControlWithRoleGroup() } ] },
    { code: '<HogeFormControl><HogeRadioButtons /></HogeFormControl>', errors: [ { message: invalidRadioInFormControl('HogeRadioButtons') } ] },
    { code: '<HogeFormControl><HogeCheckBoxs /></HogeFormControl>', errors: [ { message: invalidMultiInputsInFormControl() } ] },
    { code: '<HogeFormControl><HogeCheckBoxes /></HogeFormControl>', errors: [ { message: invalidMultiInputsInFormControl() } ] },
    { code: "<HogeFormControl>{ dateInput ? <DateInput /> : <Input /> }<CheckBox /></HogeFormControl>", errors: [ { message: invalidMultiInputsInFormControl() } ]},
    { code: "<HogeFormControl><CheckBox />{ dateInput ? <DateInput /> : <Input /> }</HogeFormControl>", errors: [ { message: invalidMultiInputsInFormControl() } ]},
    { code: '<input title="any"/>', errors: [ { message: noLabeledInput('input') } ] },
    { code: '<HogeInput title="any"/>', errors: [ { message: noLabeledInput('HogeInput') } ] },
    { code: '<textarea title="any"/>', errors: [ { message: noLabeledInput('textarea') } ] },
    { code: '<HogeTextarea title="any"/>', errors: [ { message: noLabeledInput('HogeTextarea') } ] },
    { code: '<select title="any"/>', errors: [ { message: noLabeledSelect('select') } ] },
    { code: '<HogeSelect title="any"/>', errors: [ { message: noLabeledSelect('HogeSelect') } ] },
    { code: '<HogeInputFile title="any"/>', errors: [ { message: noLabeledInput('HogeInputFile') } ] },
    { code: '<HogeComboBox title="any"/>', errors: [ { message: noLabeledInput('HogeComboBox') } ] },
    { code: '<HogeDatePicker title="any"/>', errors: [ { message: noLabeledInput('HogeDatePicker') } ] },
    { code: '<HogeWarekiPicker title="any"/>', errors: [ { message: noLabeledInput('HogeWarekiPicker') } ] },
    { code: '<HogeFieldset><HogeCheckBox /><HogeInput title="any" /></HogeFieldset>', errors: [ { message: noLabeledInputInFieldset('HogeInput') } ] },
    { code: '<FugaSection><HogeInput title="any" /></FugaSection>', errors: [ { message: useFormControlInsteadOfSection('HogeInput', 'FugaSection') } ] },
    { code: '<HogeTextarea title="any" />', errors: [ { message: noLabeledInput('HogeTextarea') } ] },
    { code: '<HogeComboBox inputAttributes={{ title: "any" }} />', errors: [ { message: noLabeledInput('HogeComboBox') } ] },
    { code: '<HogeComboBox inputAttributes={{ title }} />', errors: [ { message: noLabeledInput('HogeComboBox') } ] },
    { code: '<HogeFormControl role="group"><HogeInput /><HogeSelect /></HogeFormControl>', errors: [ { message: invalidMultiInputsInFormControl() } ] },
  ]
})
