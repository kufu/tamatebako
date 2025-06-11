const rule = require('../rules/a11y-heading-in-sectioning-content');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

const lowerMessage = `smarthr-ui/Headingと紐づく内容の範囲（アウトライン）が曖昧になっています。
 - smarthr-uiのArticle, Aside, Nav, SectionのいずれかでHeadingコンポーネントと内容をラップしてHeadingに対応する範囲を明確に指定してください。`
const message = `${lowerMessage}
 - Headingをh1にしたい場合(機能名、ページ名などこのページ内でもっとも重要な見出しの場合)、smarthr-ui/PageHeadingを利用してください。その場合はSectionなどでアウトラインを示す必要はありません。`
const pageMessage = 'smarthr-ui/PageHeading が同一ファイル内に複数存在しています。PageHeadingはh1タグを出力するため最も重要な見出しにのみ利用してください。'
const pageInSectionMessage = 'smarthr-ui/PageHeadingはsmarthr-uiのArticle, Aside, Nav, Sectionで囲まないでください。囲んでしまうとページ全体の見出しではなくなってしまいます。'
const noTagAttrMessage = `tag属性を指定せず、smarthr-uiのArticle, Aside, Nav, Sectionのいずれかの自動レベル計算に任せるよう、tag属性を削除してください。
 - tag属性を指定することで意図しないレベルに固定されてしまう可能性があります。`
const notHaveHeadingMessage = (elementName, isNav) => `${elementName} はHeading要素を含んでいません。
 - SectioningContentはHeadingを含むようにマークアップする必要があります
 - ${elementName}に設定しているいずれかの属性がHeading，もしくはHeadingのテキストに該当する場合、その属性の名称を /^(heading|title)$/ にマッチする名称に変更してください
 - Headingにするべき適切な文字列が存在しない場合、 ${elementName} は削除するか、SectioningContentではない要素に差し替えてください${isNav ? `
 - nav要素の場合、aria-label、もしくはaria-labelledby属性を設定し、どんなナビゲーションなのかがわかる名称を設定してください` : ''}`

ruleTester.run('a11y-heading-in-sectioning-content', rule, {
  valid: [
    { code: '<PageHeading>hoge</PageHeading>' },
    { code: '<Section><Heading>hoge</Heading></Section>' },
    { code: '<FugaSection heading={<Heading>hoge</Heading>}>abc</FugaSection>' },
    { code: '<FugaSection heading="hoge">abc</FugaSection>' },
    { code: '<FugaSection title="hoge">abc</FugaSection>' },
    { code: '<><Section><Heading>hoge</Heading></Section><Section><Heading>fuga</Heading></Section></>' },
    { code: 'const HogeHeading = () => <FugaHeading anyArg={abc}>hoge</FugaHeading>' },
    { code: 'export const HogeHeading = () => <FugaHeading anyArg={abc}>hoge</FugaHeading>' },
    { code: 'function FugaHeading() { return <PiyoHeading anyArg={abc}>hoge</PiyoHeading> }' },
    { code: 'export function FugaHeading() { return <PiyoHeading anyArg={abc}>hoge</PiyoHeading> }' },
    { code: '<Center as="section"><div><Heading>hoge</Heading></div></Center>' },
    { code: '<Cluster as="section"><div><Heading>hoge</Heading></div></Cluster>' },
    { code: '<Reel as="aside"><div><Heading>hoge</Heading></div></Reel>' },
    { code: '<Sidebar as="nav"><div><Heading>hoge</Heading></div></Sidebar>' },
    { code: '<Stack as="section"><div><Heading>hoge</Heading></div></Stack>' },
    { code: '<HogeCenter forwardedAs="section"><div><Heading>hoge</Heading></div></HogeCenter>' },
    { code: '<HogeCluster forwardedAs="section"><div><Heading>hoge</Heading></div></HogeCluster>' },
    { code: '<HogeReel forwardedAs="aside"><div><Heading>hoge</Heading></div></HogeReel>' },
    { code: '<HogeSidebar forwardedAs="nav"><div><Heading>hoge</Heading></div></HogeSidebar>' },
    { code: '<HogeStack forwardedAs="section"><div><Heading>hoge</Heading></div></HogeStack>' },
    { code: '<HogeBase as="aside"><Heading>hoge</Heading></HogeBase>' },
    { code: '<HogeBaseColumn forwardedAs="nav"><Heading>hoge</Heading></HogeBaseColumn>' },
    { code: '<HogeNav aria-label="any"><Any /></HogeNav>' },
    { code: '<HogeNav aria-labelledby="any"><Any /></HogeNav>' },
  ],
  invalid: [
    { code: 'const StyledArticle = styled.article``', errors: [ { message: `"article"を利用せず、smarthr-ui/Articleを拡張してください。Headingのレベルが自動計算されるようになります。(例: "styled.article" -> "styled(Article)")` } ] },
    { code: 'const StyledAside = styled.aside``', errors: [ { message: `"aside"を利用せず、smarthr-ui/Asideを拡張してください。Headingのレベルが自動計算されるようになります。(例: "styled.aside" -> "styled(Aside)")` } ] },
    { code: 'const StyledNav = styled.nav``', errors: [ { message: `"nav"を利用せず、smarthr-ui/Navを拡張してください。Headingのレベルが自動計算されるようになります。(例: "styled.nav" -> "styled(Nav)")` } ] },
    { code: 'const StyledSection = styled.section``', errors: [ { message: `"section"を利用せず、smarthr-ui/Sectionを拡張してください。Headingのレベルが自動計算されるようになります。(例: "styled.section" -> "styled(Section)")` } ] },
    { code: '<><PageHeading>hoge</PageHeading><PageHeading>fuga</PageHeading></>', errors: [ { message: pageMessage } ] },
    { code: '<Heading>hoge</Heading>', errors: [ { message } ] },
    { code: '<><Heading>hoge</Heading><Heading>fuga</Heading></>', errors: [ { message }, { message } ] },
    { code: 'const Hoge = () => <FugaHeading anyArg={abc}>hoge</FugaHeading>', errors: [ { message } ] },
    { code: '<Section><Heading>hoge</Heading><Heading>fuga</Heading></Section>', errors: [ { message: lowerMessage } ] },
    { code: '<Section><PageHeading>hoge</PageHeading></Section>', errors: [ { message: pageInSectionMessage } ] },
    { code: '<Section><Heading tag="h2">hoge</Heading></Section>', errors: [ { message: noTagAttrMessage } ] },
    { code: '<Section></Section>', errors: [ { message: notHaveHeadingMessage('Section') } ] },
    { code: '<Aside><HogeSection></HogeSection></Aside>', errors: [ { message: notHaveHeadingMessage('Aside') }, { message: notHaveHeadingMessage('HogeSection') } ] },
    { code: '<Aside any="hoge"><HogeSection><Heading /></HogeSection></Aside>', errors: [ { message: notHaveHeadingMessage('Aside') } ] },
    { code: '<HogeNav><Any /></HogeNav>', errors: [ { message: notHaveHeadingMessage('HogeNav', true) } ] },
    { code: '<HogeNav aria-diabled="true"><Any /></HogeNav>', errors: [ { message: notHaveHeadingMessage('HogeNav', true) } ] },
  ],
});
