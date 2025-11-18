const rule = require('../rules/best-practice-for-layouts')
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
const errorMessage = (type, name) => `${name}には子要素が一つしか無いため、${type}でマークアップする意味がありません。
 - styleを確認し、div・spanなど、別要素でマークアップし直すか、${name}を削除してください
 - as, forwardedAsなどでSectioningContent系要素に変更している場合、対応するsmarthr-ui/Section, Aside, Nav, Article のいずれかに差し替えてください`

ruleTester.run('best-practice-for-button-element', rule, {
  valid: [
    { code: `<Center />` },
    { code: `<Cluster />` },
    { code: `<Stack />` },
    { code: `<HogeCenter />` },
    { code: `<HogeCluster />` },
    { code: `<HogeStack />` },
    { code: `<Center><Hoge /></Center>` },
    { code: `<Center><Hoge /><Hoge /></Center>` },
    { code: `<Stack><Hoge /><Hoge /></Stack>` },
    { code: `<Stack>{a}<Hoge /></Stack>` },
    { code: `<AnyStack>{a.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a?.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a.b?.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a?.b?.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a && <><Hoge /><Hoge /></>}</AnyStack>` },
    { code: `<AnyStack>{a && a.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a && a.b.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a || <><Hoge /><Hoge /></>}</AnyStack>` },
    { code: `<AnyStack>{a || a.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a || a.b.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a ? a.b.map(action) : <Hoge />}</AnyStack>` },
    { code: `<AnyStack>{a ? <Hoge /> : a.b.map(action)}</AnyStack>` },
    { code: `<AnyStack>{a ? <Hoge /> : a ? <Hoge /> : a.b.map(action)}</AnyStack>` },
    { code: `<Cluster><Hoge /><Hoge /></Cluster>` },
    { code: `<Cluster>{a}<Hoge /></Cluster>` },
    { code: `<AnyCluster>{a.map(action)}</AnyCluster>` },
    { code: `<AnyCluster>{a && <><Hoge /><Hoge /></>}</AnyCluster>` },
    { code: `<AnyCluster>{a && a.map(action)}</AnyCluster>` },
    { code: `<AnyCluster>{a && a.b.map(action)}</AnyCluster>` },
    { code: `<AnyCluster>{a || <><Hoge /><Hoge /></>}</AnyCluster>` },
    { code: `<AnyCluster>{a || a.map(action)}</AnyCluster>` },
    { code: `<AnyCluster>{a || a.b.map(action)}</AnyCluster>` },
    { code: `<AnyCluster>{a ? a.b.map(action) : <Hoge />}</AnyCluster>` },
    { code: `<AnyCluster>{a ? <Hoge /> : a.b.map(action)}</AnyCluster>` },
    { code: `<AnyCluster>{a ? <Hoge /> : a ? <Hoge /> : a.b.map(action)}</AnyCluster>` },
    { code: `<Cluster justify="flex-end">{a}</Cluster>` },
    { code: `<HogeCluster justify="end" gap={0}>{a}</HogeCluster>` },
    { code: `<Stack align="flex-end">{a}</Stack>` },
    { code: `<HogeStack align="end">{a}</HogeStack>` },
    { code: `<Cluster>{a}</Cluster>` },
    { code: `<Cluster>{a.b}</Cluster>` },
    { code: `<Cluster>{a ? b : c}</Cluster>` },
    { code: `<Heading><Stack as="span"><Hoge /><Fuga /></Stack></Heading>` },
    { code: `<AnyHeading icon={<AnyIcon />}>hoge</AnyHeading>` },
    { code: `<FormControl label={<AnyStack as="span"><span>a</span><span>b</span></AnyStack>} />` },
    { code: `<AnyFormControl label={{ text: 'hoge', icon: <AnyIcon /> }} />` },
    { code: `<AnyFieldset legend={{ text: <AnyStack as="span"><span>a</span><span>b</span></AnyStack> }} />` },
    { code: `<Fieldset legend={{ text: 'hoge', icon: <AnyIcon /> }} />` },
  ],
  invalid: [
    { code: `<Stack><Hoge /></Stack>`, errors: [ { message: errorMessage('Stack', 'Stack') } ] },
    { code: `<AnyStack>{a.hoge(action)}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a && <><Hoge /></>}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a && a.hoge(action)}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a && a.b.hoge(action)}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a || <><Hoge /></>}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a || a.hoge(action)}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a || a.b.hoge(action)}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a ? a.b.hoge(action) : <Hoge />}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a ? <Hoge /> : a.b.hoge(action)}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<AnyStack>{a ? <Hoge /> : a ? <Hoge /> : a.b.hoge(action)}</AnyStack>`, errors: [ { message: errorMessage('Stack', 'AnyStack') } ] },
    { code: `<Cluster><Hoge /></Cluster>`, errors: [ { message: errorMessage('Cluster', 'Cluster') } ] },
    { code: `<AnyCluster>{a.hoge(action)}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a && <><Hoge /></>}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a && a.hoge(action)}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a && a.b.hoge(action)}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a || <><Hoge /></>}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a || a.hoge(action)}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a || a.b.hoge(action)}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a ? a.b.hoge(action) : <Hoge />}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a ? <Hoge /> : a.b.hoge(action)}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<AnyCluster>{a ? <Hoge /> : a ? <Hoge /> : a.b.hoge(action)}</AnyCluster>`, errors: [ { message: errorMessage('Cluster', 'AnyCluster') } ] },
    { code: `<HogeStack gap={0}>{a}{b}</HogeStack>`, errors: [ { message: `HogeStack に "gap={0}" が指定されており、smarthr-ui/Stack の利用方法として誤っている可能性があります。以下の修正方法を検討してください。
 - 方法1: 子要素を一つにまとめられないか検討してください
   - 例: "<Stack gap={0}><p>hoge</p><p>fuga</p></Stack>" を "<p>hoge<br />fuga</p>" にするなど
 - 方法2: 子要素のstyleを確認しgap属性を0以外にできないか検討してください
   - 子要素が個別に持っているmarginなどのstyleをHogeStackのgap属性で共通化できないか確認してください
 - 方法3: 別要素でマークアップし直すか、HogeStackを削除してください
   - 親要素に smarthr-ui/Cluster, smarthr-ui/Stack などが存在している場合、div・spanなどで1要素にまとめる必要がある場合があります
   - as, forwardedAsなどでSectioningContent系要素に変更している場合、対応するsmarthr-ui/Section, Aside, Nav, Article のいずれかに差し替えてください` } ] },
    { code: `<Heading><Cluster><Hoge /><Fuga /></Cluster></Heading>`, errors: [ { message: `Headingの子孫にClusterを置くことはできません。Headingの外でClusterを使用するようにマークアップを修正してください。` } ] },
    { code: `<AnyHeading><AnyStack><Hoge /><Fuga /></AnyStack></AnyHeading>`, errors: [ { message: `Headingの子孫にStackを置く場合、as属性、もしくはforwardedAs属性に \`span\` を指定してください` } ] },
    { code: `<Heading><AnyIcon text="hoge" /></Heading>`, errors: [ { message: `HeadingにIconを設定する場合 <Heading icon={<XxxIcon />}></Heading> のようにicon属性を利用してください` } ] },
    { code: `<AnyHeading><Text prefixIcon={<SomeIcon />}>hoge</Text></AnyHeading>`, errors: [ { message: `HeadingにIconを設定する場合 <Heading icon={<XxxIcon />}></Heading> のようにicon属性を利用してください` } ] },
    { code: `<AnyFormControl label={{ text: <Cluster><Hoge /><Fuga /></Cluster> }} />`, errors: [ { message: `FormControlのlabel属性にClusterを置くことはできません。ラベル用テキスト以外をstatusLabels、subActionArea、もしくはlabel属性のObjectとして '{ text: テキスト, icon: <XxxIcon /> }'に置き換えてください。` } ] },
    { code: `<FormControl label={<AnyStack><Hoge /><Fuga /></AnyStack>} />`, errors: [ { message: `FormControlのlabel属性にStackを置く場合、as属性、もしくはforwardedAs属性に \`span\` を指定してください` } ] },
    { code: `<AnyFormControl label={{ text: <AnyIcon text="hoge" /> }} />`, errors: [ { message: `FormControlのlabel属性にアイコンを設定する場合 <FormControl label={{ text: 'テキスト', icon: <XxxIcon /> }} /> のようにlabel.icon属性を利用してください` } ] },
    { code: `<FormControl label={{ text: <Text prefixIcon={<SomeIcon /> }>hoge</Text>}} />`, errors: [ { message: `FormControlのlabel属性にアイコンを設定する場合 <FormControl label={{ text: 'テキスト', icon: <XxxIcon /> }} /> のようにlabel.icon属性を利用してください` } ] },
    { code: `<Fieldset legend={<Cluster><Hoge /><Fuga /></Cluster>} />`, errors: [ { message: `Fieldsetのlegend属性にClusterを置くことはできません。ラベル用テキスト以外をstatusLabels、subActionArea、もしくはlabel属性のObjectとして '{ text: テキスト, icon: <XxxIcon /> }'に置き換えてください。` } ] },
    { code: `<AnyFieldset legend={{ text: <AnyStack><Hoge /><Fuga /></AnyStack> }} />`, errors: [ { message: `Fieldsetのlegend属性にStackを置く場合、as属性、もしくはforwardedAs属性に \`span\` を指定してください` } ] },
    { code: `<Fieldset legend={<AnyIcon text="hoge" />} />`, errors: [ { message: `Fieldsetのlegend属性にアイコンを設定する場合 <Fieldset legend={{ text: 'テキスト', icon: <XxxIcon /> }} /> のようにlegend.icon属性を利用してください` } ] },
    { code: `<AnyFieldset legend={{ text: <Text prefixIcon={<SomeIcon />}>hoge</Text>}} />`, errors: [ { message: `Fieldsetのlegend属性にアイコンを設定する場合 <Fieldset legend={{ text: 'テキスト', icon: <XxxIcon /> }} /> のようにlegend.icon属性を利用してください` } ] },
  ]
})

