const rule = require('../rules/best-practice-for-tailwind-prohibit-root-margin')
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

const errorMessage = `コンポーネントのルート要素に外側への余白（margin）を設定しないでください。外側の余白は使用する側で制御するべきです。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-prohibit-root-margin`

ruleTester.run('best-practice-for-tailwind-prohibit-root-margin', rule, {
  valid: [
    // 余白のないコンポーネント
    {
      code: `
        const Button = () => {
          return <button className="shr-bg-blue-500">Click me</button>
        }
      `,
    },
    // コンポーネントのルート以外の要素での余白使用
    {
      code: `
        const Card = () => (
          <div className="shr-bg-white">
            <h2 className="shr-mt-4">Title</h2>
            <p className="shr-mb-2 shr-pt-2">Content</p>
          </div>
        )
      `,
    },
    // returnしない場合
    {
      code: `
        const Card = () => {
          <div className="shr-bg-white">
            <h2 className="shr-mt-4">Title</h2>
            <p className="shr-mb-2 shr-pt-2">Content</p>
          </div>
        }
      `,
    },
    // shr-min などの、shr-m から始まるほかのクラス
    { code: `const Button = () => <button className="shr-min-w-100">Click me</button>` },
    { code: `const Button = () => <button className="shr-min-h-100">Click me</button>` },
    { code: `const Button = () => <button className="shr-max-w-100">Click me</button>` },
    { code: `const Button = () => <button className="shr-max-h-100">Click me</button>` },
    // padding は許可
    { code: `const Button = () => <button className="shr-p-4">Click me</button>` },
    { code: `const Button = () => <button className="shr-pt-4">Click me</button>` },
    { code: `const Button = () => <button className="shr-pb-4">Click me</button>` },
    { code: `const Button = () => <button className="shr-pl-4">Click me</button>` },
    { code: `const Button = () => <button className="shr-pr-4">Click me</button>` },
    // リテラルでないクラス名
    { code: `const Button = () => <button className={shr-mt-2}>Click me</button>` },
    { code: `const Button = () => <button className={shr-pb-4}>Click me</button>` },
  ],
  invalid: [
    // マージンクラスを持つコンポーネント
    {
      code: `const Button = () => { return <button className="shr-m-4">Click me</button> }`,
      errors: [{ message: errorMessage }],
    },
    {
      code: `const Button = () => <button className="shr-mt-4">Click me</button>`,
      errors: [{ message: errorMessage }],
    },
    {
      code: `const Button = () => { return <button className="shr-mb-4">Click me</button> }`,
      errors: [{ message: errorMessage }],
    },
    {
      code: `const Button = () => <button className="shr-ml-4">Click me</button>`,
      errors: [{ message: errorMessage }],
    },
    {
      code: `const Button = () => { return <button className="shr-mr-4">Click me</button> }`,
      errors: [{ message: errorMessage }],
    },
    // 複数の余白クラスを持つコンポーネント
    {
      code: `
        const Card = () => {
          return (
            <div className="shr-mt-4 shr-mb-2 shr-ml-2 shr-mr-2">
              <p>Content</p>
            </div>
          )
        }
      `,
      errors: [{ message: errorMessage }],
    },
    // 他のクラスと組み合わせた余白
    {
      code: `
        const Box = () => (
            <div className="shr-bg-gray-100 shr-ml-2 hoge">
              <p>Content</p>
            </div>
        )
      `,
      errors: [{ message: errorMessage }],
    },
    // function 宣言によるコンポーネント
    {
      code: `
        function Button() {
          return <button className="shr-m-4">Click me</button>
        }
      `,
      errors: [{ message: errorMessage }],
    },
  ],
})
