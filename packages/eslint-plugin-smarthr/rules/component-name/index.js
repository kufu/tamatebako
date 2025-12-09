const STYLED_COMPONENTS_METHOD = 'styled'
const STYLED_COMPONENTS = `${STYLED_COMPONENTS_METHOD}-components`

const findInvalidImportNameNode = (s) => s.type === 'ImportDefaultSpecifier' && s.local.name !== STYLED_COMPONENTS_METHOD

const checkImportStyledComponents = (node, context) => {
  if (node.source.value !== STYLED_COMPONENTS) {
    return
  }

  const invalidNameNode = node.specifiers.find(findInvalidImportNameNode)

  if (invalidNameNode) {
    context.report({
      node: invalidNameNode,
      message: `${STYLED_COMPONENTS} をimportする際は、名称が"${STYLED_COMPONENTS_METHOD}" となるようにしてください。例: "import ${STYLED_COMPONENTS_METHOD} from '${STYLED_COMPONENTS}'"
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/component-name`,
    });
  }
}

const getStyledComponentBaseName = (node) => {
  let base = null

  if (!node.init) {
    return base
  }

  const tag = node.init.tag || node.init

  if (tag.object?.name === STYLED_COMPONENTS_METHOD) {
    base = tag.property.name
  } else if (tag.callee) {
    const callee = tag.callee

    switch (STYLED_COMPONENTS_METHOD) {
      case callee.name: {
        const arg = tag.arguments[0]
        base = arg.name || arg.value
        break
      }
      case callee.callee?.name: {
        const arg = callee.arguments[0]
        base = arg.name || arg.value
        break
      }
      case callee.object?.name:
        base = callee.property.name
        break
      case callee.object?.callee?.name:
        const arg = callee.object.arguments[0]
        base = arg.name || arg.value
        break
    }
  }

  return base
}

const EXPECTED_NAMES = {
  '(A|^a)rticle$': 'Article$',
  '(A|^a)side$': 'Aside$',
  '(B|^b)utton$': 'Button$',
  '(Date|Wareki)Picker$': '(Date|Wareki)Picker$',
  '(F|^f)ieldset$': 'Fieldset$',
  '(F|^f)orm$': 'Form$',
  '(Heading|^h(2|3|4|5|6))$': 'Heading$',
  '(I|^i)nput$': 'Input$',
  '(L|^l)abel$': 'Label$',
  '(N|^n)av$': 'Nav$',
  '(Ordered(.*)List|^ol)$': 'Ordered(.*)List$',
  '(PageHeading|^h1)$': 'PageHeading$',
  '(S|^s)ection$': 'Section$',
  '(S|^s)elect$': 'Select$',
  '(T|^t)extarea$': 'Textarea$',
  'AccordionPanel$': 'AccordionPanel$',
  'ActionDialogWithTrigger$': 'ActionDialogWithTrigger$',
  'Anchor$': 'Anchor$',
  'AnchorButton$': 'AnchorButton$',
  'Base$': 'Base$',
  'BaseColumn$': 'BaseColumn$',
  'Center$': 'Center$',
  'Check(B|b)ox$': 'Checkbox$',
  'Check(B|b)ox(e)?s$': 'Checkboxes$',
  'Cluster$': 'Cluster$',
  'Combo(B|b)ox$': 'Combobox$',
  'DialogTrigger$': 'DialogTrigger$',
  'DropZone$': 'DropZone$',
  'DropdownTrigger$': 'DropdownTrigger$',
  'FieldSet$': 'FieldSet$',
  'Fieldsets$': 'Fieldsets$',
  'FilterDropdown$': 'FilterDropdown$',
  'FormControl$': 'FormControl$',
  'FormControls$': 'FormControls$',
  'FormDialog$': 'FormDialog$',
  'FormGroup$': 'FormGroup$',
  'HelpLink$': 'HelpLink$',
  'Icon$': 'Icon$',
  'Image$': 'Image$',
  'Img$': 'Img$',
  'IndexNav$': 'IndexNav$',
  'InputFile$': 'InputFile$',
  'Link$': 'Link$',
  'Message$': 'Message$',
  'ModelessDialog$': 'ModelessDialog$',
  'Pagination$': 'Pagination$',
  'RadioButton$': 'RadioButton$',
  'RadioButtonPanel$': 'RadioButtonPanel$',
  'RadioButtonPanels$': 'RadioButtonPanels$',
  'RadioButtons$': 'RadioButtons$',
  'Reel$': 'Reel$',
  'RemoteDialogTrigger$': 'RemoteDialogTrigger$',
  'RemoteTrigger(.*)FormDialog$': 'RemoteTrigger(.*)FormDialog$',
  'RemoteTrigger(.+)Dialog$': 'RemoteTrigger(.+)Dialog$',
  'RightFixedNote$': 'RightFixedNote$',
  'SearchInput$': 'SearchInput$',
  'SegmentedControl$': 'SegmentedControl$',
  'SideNav$': 'SideNav$',
  'Sidebar$': 'Sidebar$',
  'SmartHRLogo$': 'SmartHRLogo$',
  'Stack$': 'Stack$',
  'Switch$': 'Switch$',
  'TabItem$': 'TabItem$',
  'Text$': 'Text$',
  'TimePicker$': 'TimePicker$',
  '^(img|svg)$': '(Img|Image|Icon)$',
  '^a$': '(Anchor|Link)$',
}

const unexpectedMessageTemplate = `{{extended}} は smarthr-ui/{{expected}} をextendすることを期待する名称になっています
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/component-name
 - childrenにHeadingを含まない場合、コンポーネントの名称から"{{expected}}"を取り除いてください
 - childrenにHeadingを含み、アウトラインの範囲を指定するためのコンポーネントならば、smarthr-ui/{{expected}}をexendしてください
   - "styled(Xxxx)" 形式の場合、拡張元であるXxxxコンポーネントの名称の末尾に"{{expected}}"を設定し、そのコンポーネント内でsmarthr-ui/{{expected}}を利用してください`
const UNEXPECTED_NAMES = {
  '(Anchor|^a)$': '(Anchor)$',
  '(A|^a)rticle$': ['(Article)$', unexpectedMessageTemplate ],
  '(A|^a)side$': ['(Aside)$', unexpectedMessageTemplate ],
  '(B|^b)utton$': '(Button)$',
  '(Date|Wareki)Picker$': '((Date|Wareki)Picker)$',
  '(F|^f)ieldset$': '(Fieldset)$',
  '(F|^f)orm$': '(Form)$',
  '(Heading|^h(1|2|3|4|5|6))$': '(Heading)$',
  '(Icon|^(img|svg))$': '(Icon)$',
  '(Image|^(img|svg))$': '(Image)$',
  '(Img|^(img|svg))$': '(Img)$',
  '(I|^i)nput$': '(Input)$',
  '(Link|^a)$': '(Link)$',
  '(L|^l)abel$': '(Label)$',
  '(N|^n)av$': ['(Nav)$', unexpectedMessageTemplate ],
  '(Ordered(.*)List|^ol)$': '(Ordered(.*)List)$',
  '(S|^s)ection$': ['(Section)$', unexpectedMessageTemplate ],
  '(S|^s)elect$': '(Select)$',
  '(T|^t)extarea$': '(Textarea)$',
  'Base$': '(Base)$',
  'BaseColumn$': '(BaseColumn)$',
  'Center$': '(Center)$',
  'Check(B|b)ox$': '(Checkbox)$',
  'Check(B|b)ox(e)?s$': '(Checkboxes)$',
  'Cluster$': '(Cluster)$',
  'Combo(B|b)ox$': '(Combobox)$',
  'Fieldsets$': '(Fieldsets)$',
  'FilterDropdown$': '(FilterDropdown)$',
  'FormControl$': '(FormControl)$',
  'FormControls$': '(FormControls)$',
  'FormDialog$': '(FormDialog)$',
  'FormGroup$': '(FormGroup)$',
  'IndexNav$': '(IndexNav)$',
  'InputFile$': '(InputFile)$',
  'RadioButton$': '(RadioButton)$',
  'RadioButtonPanel$': '(RadioButtonPanel)$',
  'RadioButtonPanels$': '(RadioButtonPanels)$',
  'RadioButtons$': '(RadioButtons)$',
  'Reel$': '(Reel)$',
  'RemoteTrigger(.*)FormDialog$': '(RemoteTrigger(.*)FormDialog)$',
  'SearchInput$': '(SearchInput)$',
  'SideNav$': '(SideNav)$',
  'Sidebar$': '(Sidebar)$',
  'Stack$': '(Stack)$',
  'TimePicker$': '(TimePicker)$',
}


const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const entriesesTagNames = Object.entries(EXPECTED_NAMES).map(([b, e]) => [ new RegExp(b), new RegExp(e) ])
    const entriesesUnTagNames = UNEXPECTED_NAMES ? Object.entries(UNEXPECTED_NAMES).map(([b, e]) => {
      const [ auctualE, messageTemplate ] = Array.isArray(e) ? e : [e, '']

      return [ new RegExp(b), new RegExp(auctualE), messageTemplate ]
    }) : []


    const checkImportedNameToLocalName = (node, base, extended, isImport) => {
      entriesesTagNames.forEach(([b, e]) => {
        if (base.match(b) && !extended.match(e)) {
          context.report({
            node,
            message: `${extended}を正規表現 "${e.toString()}" がmatchする名称に変更してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/component-name${isImport ? `
 - ${base}が型の場合、'import type { ${base} as ${extended} }' もしくは 'import { type ${base} as ${extended} }' のように明示的に型であることを宣言してください。名称変更が不要になります` : ''}`,
          });
        }
      })
    }

    return {
      ImportDeclaration: (node) => {
        checkImportStyledComponents(node, context)

        if (node.importKind !== 'type') {
          node.specifiers.forEach((s) => {
            if (s.importKind !== 'type' && s.imported && s.imported.name !== s.local.name) {
              checkImportedNameToLocalName(node, s.imported.name, s.local.name, true)
            }
          })
        }
      },
      VariableDeclarator: (node) => {
        const base = getStyledComponentBaseName(node)

        if (base) {
          const extended = node.id.name

          checkImportedNameToLocalName(node, base, extended)

          entriesesUnTagNames.forEach(([b, e, m]) => {
            const matcher = extended.match(e)

            if (matcher && !base.match(b)) {
              const expected = matcher[1]
              const isBareTag = base === base.toLowerCase()
              const sampleFixBase = `styled${isBareTag ? `.${base}` : `(${base})`}`

              context.report({
                node,
                message: m ? m
                .replaceAll('{{extended}}', extended)
                .replaceAll('{{expected}}', expected) : `${extended} は ${b.toString()} にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/component-name
 - ${extended} の名称の末尾が"${expected}" という文字列ではない状態にしつつ、"${base}"を継承していることをわかる名称に変更してください
 - もしくは"${base}"を"${extended}"の継承元であることがわかるような${isBareTag ? '適切なタグや別コンポーネントに差し替えてください' : '名称に変更するか、適切な別コンポーネントに差し替えてください'}
   - 修正例1: const ${extended.replace(expected, '')}Xxxx = ${sampleFixBase}
   - 修正例2: const ${extended}Xxxx = ${sampleFixBase}
   - 修正例3: const ${extended} = styled(Xxxx${expected})`
              })
            }
          })
        }
      },
      'VariableDeclarator[id.name=/Modal/]': (node) => {
        context.report({
          node,
          message: `コンポーネント名や変数名に"Modal"という名称は使わず、"Dialog"に統一してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/component-name
 - Modalとは形容詞であり、かつ"現在の操作から切り離して専用の操作を行わせる" という意味合いを持ちます
   - そのためDialogでなければ正しくない場合がありえます(smarthr-ui/ModelessDialogのように元々の操作も行えるDialogなどが該当)
   - DialogはModalなダイアログ、Modelessなダイアログすべてを含有した名称のため、統一することを推奨しています`
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
