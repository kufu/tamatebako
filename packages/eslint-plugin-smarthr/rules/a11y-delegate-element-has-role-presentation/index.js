const INTERACTIVE_COMPONENT_NAMES = `(${[
  '(B|b)utton(s)?',
  '(Check|Combo)(B|b)ox(es|s)?',
  '(Date(timeLocal)?|Time|Month|Wareki)Picker(s)?',
  '(I|i)nput(File)?(s)?',
  '(S|s)elect(s)?',
  '(T|t)extarea(s)?',
  '(ActionDialogWith|RemoteDialog)Trigger(s)?',
  'AccordionPanel(s)?',
  '^a',
  'Anchor',
  'Link(s)?',
  'DropZone(s)?',
  'Field(S|s)et(s)?',
  'FilterDropdown(s)?',
  '(F|f)orm(Control|Group|Dialog)?(s)?',
  'Pagination(s)?',
  'RadioButton(Panel)?(s)?',
  'RemoteTrigger(.+)Dialog(s)?',
  'RightFixedNote(s)?',
  'SegmentedControl(s)?',
  'SideNav(s)?',
  'Switch(s)?',
  'TabItem(s)?',
].join('|')})$`
const INTERACTIVE_ON_REGEX = /^on(Change|Input|Focus|Blur|(Double)?Click|Key(Down|Up|Press)|Mouse(Enter|Over|Down|Up|Leave)|Select|Submit)$/
const MEANED_ROLE_REGEX = /^(combobox|group|slider|toolbar)$/
const INTERACTIVE_NODE_TYPE_REGEX = /^(JSXElement|JSXExpressionContainer|ConditionalExpression)$/
const AS_REGEX = /^(as|forwardedAs)$/
const AS_VALUE_REGEX = /^(form|fieldset)$/

const messageNonInteractiveEventHandler = (nodeName, interactiveComponentRegex, onAttrs) => {
  const onAttrsText = onAttrs.join(', ')

  return `${nodeName} に${onAttrsText}を設定するとブラウザが正しく解釈が行えず、ユーザーが利用することが出来ない場合があるため、以下のいずれかの対応をおこなってください。
 - 方法1:  ${nodeName}がinput、buttonやaなどのインタラクティブな要素の場合、コンポーネント名の末尾をインタラクティブなコンポーネントであることがわかる名称に変更してください
   - "${interactiveComponentRegex}" の正規表現にmatchするコンポーネントに差し替える、もしくは名称を変更してください
 - 方法2: ${onAttrsText} がコンポーネント内の特定のインタラクティブな要素に設定される場合、名称を具体的なものに変更してください
   - 属性名を"${INTERACTIVE_ON_REGEX}"に一致しないものに変更してください
   - 例: 対象コンポーネント内に '追加ボタン' が存在する場合、'onClick' という属性名を 'onClickAddButton' に変更する
 - 方法3: インタラクティブな親要素、もしくは子要素が存在する場合、直接${onAttrsText}を設定することを検討してください
 - 方法4: インタラクティブな親要素、もしくは子要素が存在しない場合、インタラクティブな要素を必ず持つようにマークアップを修正後、${onAttrsText}の設定要素を検討してください
 - 方法5: インタラクティブな子要素から発生したイベントをキャッチすることが目的で${onAttrsText}を設定している場合、'role="presentation"' を設定してください
   - 'role="presentation"' を設定した要素はマークアップとしての意味がなくなるため、div・span などマークアップとしての意味を持たない要素に設定してください
   - 'role="presentation"' を設定する適切な要素が存在しない場合、div、またはspanでイベントが発生する要素を囲んだ上でrole属性を設定してください`
}
const messageRolePresentationNotHasInteractive = (nodeName, interactiveComponentRegex, onAttrs, roleMean) => `${nodeName}に 'role="${roleMean}"' が設定されているにも関わらず、子要素にinput、buttonやaなどのインタラクティブな要素が見つからないため、ブラウザが正しく解釈が行えず、ユーザーが利用することが出来ない場合があるため、以下のいずれかの対応をおこなってください。
 - 方法1: 子要素にインタラクティブな要素が存在するにも関わらずこのエラーが表示されている場合、子要素の名称を変更してください
   - "${interactiveComponentRegex}" の正規表現にmatchするよう、インタラクティブな子要素全てを差し替える、もしくは名称を変更してください
 - 方法2: ${nodeName}自体がインタラクティブな要素の場合、'role="presentation"'を削除した上で名称を変更してください
   - "${interactiveComponentRegex}" の正規表現にmatchするよう、${nodeName}の名称を変更してください
 - 方法3: 子要素にインタラクティブな要素が存在し、${onAttrs.join(', ')}全属性をそれらの要素に移動させられる場合、'role="presentation"'を消した上で実施してください`
const messageInteractiveHasRolePresentation = (nodeName, interactiveComponentRegex) => `${nodeName}はinput、buttonやaなどのインタラクティブな要素にもかかわらず 'role="presentation"' が設定されているため、ブラウザが正しく解釈が行えず、ユーザーが利用することが出来ない場合があるため、以下のいずれかの対応をおこなってください。
 - 方法1: 'role="presentation"' を削除してください
 - 方法2: ${nodeName}の名称を "${interactiveComponentRegex}" とマッチしない名称に変更してください`

const SCHEMA = [
  {
    type: 'object',
    properties: {
      additionalInteractiveComponentRegex: { type: 'array', items: { type: 'string' } },
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
    const options = context.options[0]
    const interactiveComponentRegex = new RegExp(`(${INTERACTIVE_COMPONENT_NAMES}${options?.additionalInteractiveComponentRegex ? `|${options.additionalInteractiveComponentRegex.join('|')}` : ''})`)
    const findInteractiveNode = (ec) => ec && INTERACTIVE_NODE_TYPE_REGEX.test(ec.type) && isHasInteractive(ec)
    const isHasInteractive = (c) => {
      switch (c.type) {
        case 'JSXElement': {
          const name = c.openingElement.name.name

          if (name && interactiveComponentRegex.test(name)) {
            return true
          } else if (c.children.length > 0) {
            return !!c.children.find(isHasInteractive)
          }
        }
        case 'JSXExpressionContainer':
        case 'ConditionalExpression': {
          let e = c

          if (c.expression) {
            e = c.expression
          }

          return !![e.right, e.consequent, e.alternate].find(findInteractiveNode)
        }
      }

      return false
    }

    return {
      JSXOpeningElement: (node) => {
        const nodeName = node.name.name || '';

        let onAttrs = []
        let roleMean = undefined
        let isRolePresentation = false
        let isAsInteractive = false

        node.attributes.forEach((a) => {
          const aName = a.name?.name || ''

          if (INTERACTIVE_ON_REGEX.test(aName)) {
            onAttrs.push(aName)
          } else if (AS_REGEX.test(aName) && AS_VALUE_REGEX.test(a.value?.value || '')) {
            isAsInteractive = true
          } else if (aName === 'role') {
            const v = a.value?.value || ''

            if (v === 'presentation') {
              isRolePresentation = true
              roleMean = v
            } else if (MEANED_ROLE_REGEX.test(v)) {
              roleMean = v
            }
          }
        })

        if (isAsInteractive || interactiveComponentRegex.test(nodeName)) {
          if (isRolePresentation) {
            context.report({
              node,
              message: messageInteractiveHasRolePresentation(nodeName, interactiveComponentRegex)
            })
          }
        } else if (onAttrs.length > 0) {
          // HINT: role="presentation"以外で意味があるroleが設定されている場合はエラーにしない
          // 基本的にsmarthr-uiでroleの設定などは巻き取る &&　そもそもroleを設定するよりタグを適切にマークアップすることが優先されるため
          // エラーなどには表示しない
          if (!roleMean) {
            context.report({
              node,
              message: messageNonInteractiveEventHandler(nodeName, interactiveComponentRegex, onAttrs),
            });
          // HINT: role='slider' はインタラクティブな要素扱いとするため除外する
          } else if (roleMean !== 'slider') {
            const searchChildren = (n) => {
              switch (n.type) {
                case 'BinaryExpression':
                case 'Identifier':
                case 'JSXEmptyExpression':
                case 'JSXText':
                case 'Literal':
                case 'VariableDeclaration':
                  // これ以上childrenが存在しないため終了
                  return false
                case 'JSXAttribute':
                  return n.value ? searchChildren(n.value) : false
                case 'LogicalExpression':
                  return searchChildren(n.right)
                case 'ArrowFunctionExpression':
                  return searchChildren(n.body)
                case 'MemberExpression':
                  return searchChildren(n.property)
                case 'ReturnStatement':
                case 'UnaryExpression':
                  return searchChildren(n.argument)
                case 'ChainExpression':
                case 'JSXExpressionContainer':
                  return searchChildren(n.expression)
                case 'BlockStatement':
                  return forInSearchChildren(n.body)
                case 'ConditionalExpression':
                  return searchChildren(n.consequent) || searchChildren(n.alternate)
                case 'CallExpression': {
                  return forInSearchChildren(n.arguments)
                }
                case 'JSXFragment':
                  break
                case 'JSXElement': {
                  const name = n.openingElement.name.name || ''

                  if (
                    interactiveComponentRegex.test(name) ||
                    forInSearchChildren(n.openingElement.attributes)
                  ) {
                    return true
                  }

                  break
                }
              }

              return n.children ? forInSearchChildren(n.children) : false
            }

            const forInSearchChildren = (ary) => {
              for (const i in ary) {
                if (searchChildren(ary[i])) {
                  return true
                }
              }

              return false
            }

            if (!forInSearchChildren(node.parent.children)) {
              context.report({
                node,
                message: messageRolePresentationNotHasInteractive(nodeName, interactiveComponentRegex, onAttrs, roleMean)
              })
            }
          }
        }
      },
    };
  },
};
module.exports.schema = SCHEMA;
