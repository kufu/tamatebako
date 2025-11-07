const LABELED_INPUTS_REGEX_STR = 'RadioButton(Panel)?(s)?|Check(B|b)ox(es|s)?'
const LABELED_INPUTS_REGEX = new RegExp(`(${LABELED_INPUTS_REGEX_STR})$`)
const FORM_CONTROL_INPUTS_REGEX = new RegExp(`(${LABELED_INPUTS_REGEX_STR}|(Search)?(I|^i)nput(File)?|(T|^t)extarea|(S|^s)elect|Combo(B|b)ox|(Date|Wareki|Time)Picker)$`)
const SEARCH_INPUT_REGEX = /SearchInput$/
const INPUT_REGEX = /(i|I)nput$/
const RADIO_BUTTONS_REGEX = /RadioButton(Panel)?(s)?$/
const CHECKBOX_REGEX = /Check(B|b)ox(s|es)?$/
const SELECT_REGEX = /(S|s)elect(s)?$/
const FROM_CONTROLS_REGEX = /(Form(Control|Group)|(F|^f)ieldset)$/
const FORM_CONTROL_REGEX = /(Form(Control|Group))$/
const FIELDSET_REGEX = /Fieldset$/
const DIALOG_REGEX = /Dialog(WithTrigger)?$/
const SECTIONING_REGEX = /(((A|^a)(rticle|side))|(N|^n)av|(S|^s)ection|^SectioningFragment)$/
const BARE_SECTIONING_TAG_REGEX = /^(article|aside|nav|section)$/
const LAYOUT_COMPONENT_REGEX = /((C(ent|lust)er)|Reel|Sidebar|Stack)$/
const AS_REGEX = /^(as|forwardedAs)$/
const SUFFIX_S_REGEX = /s$/
const az_REGEX = /[a-z]/

const IGNORE_INPUT_CHECK_PARENT_TYPE = /^(Program|ExportNamedDeclaration)$/

const findRoleGroup = (a) => a.name?.name === 'role' && a.value.value === 'group'
const findAsSectioning = (a) => AS_REGEX.test(a.name?.name) && BARE_SECTIONING_TAG_REGEX.test(a.value.value)

const SCHEMA = [
  {
    type: 'object',
    properties: {
      additionalInputComponents: { type: 'array', items: { type: 'string' }, default: [] },
      additionalMultiInputComponents: { type: 'array', items: { type: 'string' }, default: [] },
    },
    additionalProperties: false,
  }
]

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const option = context.options[0] || {}
    const additionalInputComponents = option.additionalInputComponents?.length > 0 ? new RegExp(`(${option.additionalInputComponents.join('|')})`) : null
    const additionalMultiInputComponents = option.additionalMultiInputComponents?.length > 0 ? new RegExp(`(${option.additionalMultiInputComponents.join('|')})`) : null

    const checkAdditionalInputComponents = (name) => additionalInputComponents && additionalInputComponents.test(name)
    const checkAdditionalMultiInputComponents = (name) => additionalMultiInputComponents && additionalMultiInputComponents.test(name)

    let formControls = []
    let conditionalformControls = []
    let checkboxFormControls = []

    return {
      JSXOpeningElement: (node) => {
        const nodeName = node.name.name || '';
        const isFormControlInput = FORM_CONTROL_INPUTS_REGEX.test(nodeName)
        const isAdditionalMultiInput = checkAdditionalMultiInputComponents(nodeName)
        let conditionalExpressions = []

        if (isFormControlInput || isAdditionalMultiInput || checkAdditionalInputComponents(nodeName)) {
          let isInMap = false

          // HINT: 検索ボックスの場合、UIの関係上labelを設定出来ないことが多い & smarthr-ui/SearchInputはa11y対策してあるため無視
          if (SEARCH_INPUT_REGEX.test(nodeName)) {
            return
          }

          const isPureInput = INPUT_REGEX.test(nodeName)
          let isPseudoLabel = false
          let isTypeRadio = false
          let isTypeCheck = false

          if (isFormControlInput) {
            for (const i of node.attributes) {
              if (i.name) {
                // HINT: idが設定されている場合、htmlForでlabelと紐づく可能性が高いため無視する
                // aria-label, aria-labelledbyが設定されている場合は疑似ラベルが設定されているため許容する
                switch (i.name.name) {
                  case 'id':
                  case 'aria-label':
                  case 'aria-labelledby':
                    isPseudoLabel = true
                    break
                  case 'type':
                    switch (i.value.value) {
                      case 'radio':
                        isTypeRadio = true
                        break
                      case 'checkbox':
                        isTypeCheck = true
                        break
                      case 'hidden':
                        // HINT: hiddenの場合はラベルなしを許容するため、breakではなくreturnで処理終了させる
                        return
                    }

                    break
                }
              }
            }
          }

          const isPreMultiple = isAdditionalMultiInput || isFormControlInput && SUFFIX_S_REGEX.test(nodeName)
          const isRadio = (isPureInput && isTypeRadio) || RADIO_BUTTONS_REGEX.test(nodeName)
          const isCheckbox = !isRadio && (isPureInput && isTypeCheck || CHECKBOX_REGEX.test(nodeName))

          const wrapComponentName = isRadio ? 'Fieldset' : 'FormControl'
          const search = (n) => {
            switch (n.type) {
              case 'JSXElement': {
                const openingElement = n.openingElement
                const name = openingElement.name.name

                if (name) {
                  if (FROM_CONTROLS_REGEX.test(name)) {
                    const hit = formControls.includes(n)
                    let conditionalHit = false

                    if (!hit) {
                      formControls.push(n)


                      if (isCheckbox) {
                        checkboxFormControls.push(n)
                      }
                    }

                    if (conditionalExpressions.length > 0) {
                      conditionalHit = conditionalformControls.includes(n)

                      if (!conditionalHit) {
                        conditionalformControls.push(n)
                      }
                    }

                    const isMultiInput = isPreMultiple || hit || isInMap
                    const matcherFormControl = name.match(FORM_CONTROL_REGEX)

                    if (matcherFormControl) {
                      if (isRadio || isCheckbox && (isInMap || hit && checkboxFormControls.includes(n))) {
                        const convertComp = isRadio ? 'smarthr-ui/RadioButton、smarthr-ui/RadioButtonPanel' : 'smarthr-ui/Checkbox'

                        context.report({
                          node: n,
                          message: `${name} が ${nodeName} を含んでいます。smarthr-ui/${matcherFormControl[1]} を smarthr-ui/Fieldset に変更し、正しくグルーピングされるように修正してください。${isRadio ? `
 - Fieldsetで同じname属性のラジオボタン全てを囲むことで正しくグループ化され、適切なタイトル・説明を追加出来ます` : ''}${isPureInput ? `
 - 可能なら${nodeName}は${convertComp}への変更を検討してください。難しい場合は ${nodeName} と結びつくlabel要素が必ず存在するよう、マークアップする必要があることに注意してください。` : ''}`,
                        });
                      } else if (isMultiInput && !conditionalHit) {
                        context.report({
                          node: n,
                          message: `${name} が複数の入力要素を含んでいます。ラベルと入力要素の紐づけが正しく行われない可能性があるため、以下の方法のいずれかで修正してください。
 - 方法1: 郵便番号や電話番号など、本来一つの概念の入力要素を分割して複数の入力要素にしている場合、一つの入力要素にまとめることを検討してください
   - コピーアンドペーストがしやすくなる、ブラウザの自動補完などがより適切に反映されるなど多大なメリットがあります
 - 方法2: ${name}をsmarthr-ui/Fieldset、もしくはそれを拡張したコンポーネントに変更した上で、入力要素を一つずつsmarthr-ui/FormControlで囲むようにマークアップを変更してください
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FormControlのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)
 - 方法3: ${name} が smarthr-ui/${matcherFormControl[1]}、もしくはそれを拡張しているコンポーネントではない場合、名称を ${FROM_CONTROLS_REGEX} にマッチしないものに変更してください`,
                        });
                      }
                    // HINT: 何らかの方法でラベルが設定されている場合、無視する
                    } else if (!isRadio && !isCheckbox && !isPseudoLabel) {
                      const isSelect = nodeName.match(SELECT_REGEX)

                      context.report({
                        node: n,
                        message: `${name} が ラベルを持たない入力要素(${nodeName})を含んでいます。入力要素が何であるかを正しく伝えるため、以下の方法のいずれかで修正してください。
 - 方法1: ${name} を smarthr-ui/FormControl、もしくはそれを拡張したコンポーネントに変更してください
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、FormControlのdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)
 - 方法2: ${nodeName} がlabel要素を含むコンポーネントである場合、名称を${FORM_CONTROL_REGEX}にマッチするものに変更してください
   - smarthr-ui/FormControl、smarthr-ui/FormGroup はlabel要素を内包しています
 - 方法3: ${nodeName} がRadioButton、もしくはCheckboxを表すコンポーネントの場合、名称を${LABELED_INPUTS_REGEX}にマッチするものに変更してください
   - smarthr-ui/RadioButton、smarthr-ui/RadioButtonPanel、smarthr-ui/Checkbox はlabel要素を内包しています
 - 方法4: ${name} が smarthr-ui/Fieldset、もしくはそれを拡張しているコンポーネントではない場合、名称を ${FIELDSET_REGEX} にマッチしないものに変更してください
 - 方法5: 別途label要素が存在し、それらと紐づけたい場合はlabel要素のhtmlFor属性、${nodeName}のid属性に同じ文字列を指定してください。この文字列はhtml内で一意である必要があります`,
                      });
                    }

                    return
                  } else {
                    const isSection = name.match(SECTIONING_REGEX)
                    const layoutSectionAttribute = !isSection && name.match(LAYOUT_COMPONENT_REGEX) && openingElement.attributes.find(findAsSectioning)

                    if (isSection || layoutSectionAttribute) {
                      // HINT: smarthr-ui/Checkboxはlabelを単独で持つため、FormControl系でラップをする必要はない
                      // HINT: 擬似的にラベルが設定されている場合、無視する
                      if (!isCheckbox && !isPseudoLabel) {
                        const actualName = isSection ? name : `<${name} ${layoutSectionAttribute.name.name}="${layoutSectionAttribute.value.value}">`
                        const isSelect = !isRadio && SELECT_REGEX.test(nodeName)

                        context.report({
                          node,
                          message: `${nodeName}は${actualName}より先に、smarthr-ui/${wrapComponentName}が入力要素を囲むようマークアップを以下のいずれかの方法で変更してください。
 - 方法1: ${actualName} を${wrapComponentName}、もしくはそれを拡張したコンポーネントに変更してください
   - ${actualName} 内のHeading要素は${wrapComponentName}のtitle属性に変更してください
 - 方法2: ${actualName} と ${nodeName} の間に ${wrapComponentName} が存在するようにマークアップを変更してください
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、${wrapComponentName}のdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)${isRadio ? '' : `
 - 方法3: 別途label要素が存在し、それらと紐づけたい場合はlabel要素のhtmlFor属性、${nodeName}のid属性に同じ文字列を指定してください。この文字列はhtml内で一意である必要があります`}`,
                        });
                      }

                      return
                    }
                  }
                }

                break
              }
              case 'ConditionalExpression': {
                conditionalExpressions.push(n)
                break
              }
              case 'VariableDeclarator': {
                if (n.parent.parent?.type && IGNORE_INPUT_CHECK_PARENT_TYPE.test(n.parent.parent.type)) {
                  const name = n.id.name

                  // 入力要素系コンポーネントの拡張なので対象外
                  if (FORM_CONTROL_INPUTS_REGEX.test(name) || checkAdditionalMultiInputComponents(name) || checkAdditionalInputComponents(name)) {
                    return
                  }
                }

                break
              }
              case 'FunctionDeclaration': {
                if (IGNORE_INPUT_CHECK_PARENT_TYPE.test(n.parent.type)) {
                  const name = n.id.name

                  // 入力要素系コンポーネントの拡張なので対象外
                  if (FORM_CONTROL_INPUTS_REGEX.test(name) || checkAdditionalMultiInputComponents(name) || checkAdditionalInputComponents(name)) {
                    return
                  }
                }
              }
              case 'Program': {
                // HINT: smarthr-ui/Checkboxはlabelを単独で持つため、FormControl系でラップをする必要はない
                // HINT: 擬似的にラベルが設定されている場合、無視する
                if (!isCheckbox && !isPseudoLabel) {
                  const isSelect = !isRadio && SELECT_REGEX.test(nodeName)

                  context.report({
                    node,
                    message: `${nodeName} を、smarthr-ui/${wrapComponentName} もしくはそれを拡張したコンポーネントが囲むようマークアップを変更してください。
 - ${wrapComponentName}で入力要素を囲むことでラベルと入力要素が適切に紐づき、操作性が高まります${isRadio ? `
 - FieldsetでRadioButtonを囲むことでグループ化された入力要素に対して適切なタイトル・説明を追加出来ます` : `
   - 画面上に表示するラベルが存在しない場合でも、必ずその入力要素は何であるか、どんな値を入力すればいいのか？を伝えるため、ラベルの設定は必須です。
     - この場合、${wrapComponentName}のdangerouslyTitleHidden属性をtrueにして、ラベルを非表示にしてください(https://smarthr.design/products/components/form-control/)`}
 - ${nodeName}が入力要素とラベル・タイトル・説明など含む概念を表示するコンポーネントの場合、コンポーネント名を${FROM_CONTROLS_REGEX}とマッチするように修正してください
 - ${nodeName}が入力要素自体を表現するコンポーネントの一部である場合、ルートとなるコンポーネントの名称を${FORM_CONTROL_INPUTS_REGEX}とマッチするように修正してください`,
                  });
                }

                return
              }
              case 'CallExpression':
                if (n.callee.property?.name === 'map') {
                  isInMap = true
                }

                break
            }

            return search(n.parent)
          }

          return search(node.parent.parent)
        }

        const formControlMatcher = nodeName.match(FROM_CONTROLS_REGEX)

        if (formControlMatcher) {
          const isRoleGrouop = node.attributes.find(findRoleGroup)

          if (!nodeName.match(FORM_CONTROL_REGEX) && isRoleGrouop) {
            const component = formControlMatcher[1]
            const actualComponent = az_REGEX.test(component[0]) ? component : `smarthr-ui/${component}`

            const message = `${nodeName}に 'role="group" が設定されています。${actualComponent} をつかってマークアップする場合、'role="group"' は不要です
 - ${nodeName} が ${actualComponent}、もしくはそれを拡張しているコンポーネントではない場合、名称を ${FROM_CONTROLS_REGEX} にマッチしないものに変更してください`
            context.report({
              node,
              message,
            });

            return
          }

          const searchParent = (n) => {
            switch (n.type) {
              case 'JSXElement': {
                const name = n.openingElement.name.name || ''

                // Fieldset > Dialog > Fieldset のようにDialogを挟んだFormControl系のネストは許容する(Portalで実際にはネストしていないため)
                if (DIALOG_REGEX.test(name)) {
                  return
                }

                const matcher = name.match(FROM_CONTROLS_REGEX)
                if (matcher) {
                  // FormControl > FormControl や FormControl > Fieldset のように複数のFormControl系コンポーネントがネストしてしまっているためエラーにする
                  // Fieldset > Fieldset や Fieldset > FormControl のようにFieldsetが親の場合は許容する
                  if (FORM_CONTROL_REGEX.test(name)) {
                    context.report({
                      node: n,
                      message: `${name} が、${nodeName} を子要素として持っており、マークアップとして正しくない状態になっています。以下のいずれかの方法で修正を試みてください。
 - 方法1: 親要素である${name}をsmarthr-ui/${matcher[1]}、もしくはそれを拡張していないコンポーネントでマークアップしてください
   - ${matcher[1]}ではなく、smarthr-ui/Fieldset、もしくはsmarthr-ui/Section + smarthr-ui/Heading などでのマークアップを検討してください
 - 方法2: 親要素である${name}がsmarthr-ui/${matcher[1]}を拡張したコンポーネントではない場合、コンポーネント名を${FORM_CONTROL_REGEX}と一致しない名称に変更してください`,
                    });
                  }

                  return
                }

                break
              }
              case 'Program': {
                return
              }
            }

            return searchParent(n.parent)
          }

          searchParent(node.parent.parent)

          if (!node.selfClosing && isRoleGrouop && FORM_CONTROL_REGEX.test(nodeName)) {
            const searchChildren = (n, count = 0) => {
              switch (n.type) {
                case 'BinaryExpression':
                case 'Identifier':
                case 'JSXEmptyExpression':
                case 'JSXText':
                case 'Literal':
                case 'VariableDeclaration':
                  // これ以上childrenが存在しないため終了
                  return count
                case 'JSXAttribute':
                  return n.value ? searchChildren(n.value, count) : count
                case 'LogicalExpression':
                  return searchChildren(n.right, count)
                case 'ArrowFunctionExpression':
                  return searchChildren(n.body, count)
                case 'MemberExpression':
                  return searchChildren(n.property, count)
                case 'ReturnStatement':
                case 'UnaryExpression':
                  return searchChildren(n.argument, count)
                case 'ChainExpression':
                case 'JSXExpressionContainer':
                  return searchChildren(n.expression, count)
                case 'BlockStatement': {
                  return forInSearchChildren(n.body, count)
                }
                case 'ConditionalExpression': {
                  const conCount = searchChildren(n.consequent, count)

                  if (conCount > 1) {
                    return conCount
                  }

                  const altCount = searchChildren(n.alternate, count)

                  return conCount > altCount ? conCount : altCount
                }
                case 'CallExpression': {
                  const nextCount = forInSearchChildren(n.arguments, count)

                  if (nextCount > count && n.callee.property?.name === 'map') {
                    return Infinity
                  }

                  return nextCount
                }
                case 'JSXFragment':
                  break
                case 'JSXElement': {
                  const name = n.openingElement.name.name || ''

                  if (FIELDSET_REGEX.test(name) || checkAdditionalMultiInputComponents(name)) {
                    // 複数inputが存在する可能性のあるコンポーネントなので無限カウントとする
                    return Infinity
                  }

                  let nextCount = forInSearchChildren(n.openingElement.attributes, count)

                  if (nextCount > 1) {
                    return nextCount
                  }

                  if (
                    FORM_CONTROL_INPUTS_REGEX.test(name) ||
                    FORM_CONTROL_REGEX.test(name) ||
                    checkAdditionalInputComponents(name)
                  ) {
                    nextCount = nextCount + 1
                  }

                  if (nextCount > count) {
                    return nextCount
                  }

                  break
                }
              }

              return n.children ? forInSearchChildren(n.children, count) : count
            }

            const forInSearchChildren = (ary, initCount) => {
              let r = initCount

              for (const i in ary) {
                r += searchChildren(ary[i])

                if (r > 1) {
                  break
                }
              }

              return r
            }

            const result = forInSearchChildren(node.parent.children, 0)

            if (result < 2) {
              context.report({
                node,
                message: `${nodeName}内に入力要素が2個以上存在しないため、'role="group"'を削除してください。'role="group"'は複数の入力要素を一つのグループとして扱うための属性です。
 - ${nodeName}内に2つ以上の入力要素が存在する場合、入力要素を含むコンポーネント名全てを${FORM_CONTROL_INPUTS_REGEX}、もしくは${FROM_CONTROLS_REGEX}にマッチする名称に変更してください`,
              });
            }
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
